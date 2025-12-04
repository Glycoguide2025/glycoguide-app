#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import Jimp from 'jimp';
import sharp from 'sharp';
import { fetch } from 'undici';
import PQueue from 'p-queue';
import stringSimilarity from 'string-similarity';
import { stringify } from 'csv-stringify/sync';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { meals, type Meal } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Configuration
const CONFIG = {
  BATCH_SIZE: 50,
  HTTP_CONCURRENCY: 10,
  IMAGE_CONCURRENCY: 4,
  HTTP_TIMEOUT: 5000,
  PERCEPTUAL_HASH_THRESHOLD: 5,
  CONTENT_MATCH_THRESHOLD: 0.3,
  RETRY_ATTEMPTS: 2,
};

// Types
interface ImageAuditResult {
  mealId: string;
  name: string;
  category: string;
  oldUrl: string | null;
  newUrl: string | null;
  status: 'ok' | 'missing' | '404' | 'duplicate' | 'content_mismatch' | 'fixed' | 'error';
  reasons: string[];
  sha256?: string;
  pHash?: string;
  contentScore?: number;
  action: 'none' | 'replaced' | 'generated' | 'flagged';
  fixedBy?: string;
}

interface ImageInfo {
  url: string;
  exists: boolean;
  accessible: boolean;
  sha256?: string;
  pHash?: string;
  localPath?: string;
  contentType?: string;
  fileSize?: number;
}

interface DuplicateGroup {
  sha256?: string;
  pHash?: string;
  urls: string[];
  meals: Array<{ id: string; name: string; category: string; imageLocked?: boolean }>;
  keepUrl?: string;
  replaceUrls?: string[];
}

class ImageAuditor {
  private db: ReturnType<typeof drizzle>;
  private httpQueue: PQueue;
  private imageQueue: PQueue;
  private results: ImageAuditResult[] = [];
  private imageCache = new Map<string, ImageInfo>();
  private availableAssets: string[] = [];

  constructor() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(client);
    this.httpQueue = new PQueue({ concurrency: CONFIG.HTTP_CONCURRENCY });
    this.imageQueue = new PQueue({ concurrency: CONFIG.IMAGE_CONCURRENCY });
  }

  async init() {
    // Scan available assets for replacement candidates
    await this.scanAvailableAssets();
    console.log(`📁 Found ${this.availableAssets.length} available assets for replacements`);
  }

  private async scanAvailableAssets() {
    const assetDirs = [
      'attached_assets',
      'attached_assets/generated_images',
      'attached_assets/stock_images'
    ];

    for (const dir of assetDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir, { recursive: true }) as string[];
        this.availableAssets.push(...files
          .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .map(f => path.join(dir, f))
        );
      }
    }
  }

  async auditAllRecipes(dryRun = true): Promise<ImageAuditResult[]> {
    console.log('🔍 Starting comprehensive recipe image audit...');
    
    // Get all meals in batches
    const allMeals = await this.db.select().from(meals);
    console.log(`📊 Auditing ${allMeals.length} recipes`);

    // Step 1: Check image availability and compute hashes
    console.log('\n📋 Step 1: Checking image availability and computing hashes...');
    const imageInfoMap = new Map<string, ImageInfo>();
    
    for (let i = 0; i < allMeals.length; i += CONFIG.BATCH_SIZE) {
      const batch = allMeals.slice(i, i + CONFIG.BATCH_SIZE);
      const promises = batch.map(meal => this.analyzeImage(meal.imageUrl));
      const batchResults = await Promise.all(promises);
      
      batch.forEach((meal, idx) => {
        if (meal.imageUrl && batchResults[idx]) {
          imageInfoMap.set(meal.imageUrl, batchResults[idx]);
        }
      });
      
      console.log(`  ✓ Processed ${Math.min(i + CONFIG.BATCH_SIZE, allMeals.length)}/${allMeals.length} images`);
    }

    // Step 2: Detect duplicates
    console.log('\n🔍 Step 2: Detecting duplicate images...');
    const duplicateGroups = this.detectDuplicates(imageInfoMap, allMeals);
    console.log(`  ⚠️ Found ${duplicateGroups.length} duplicate groups affecting ${duplicateGroups.reduce((sum, g) => sum + g.meals.length, 0)} recipes`);

    // Step 3: Analyze each recipe
    console.log('\n🧐 Step 3: Analyzing recipe-image content matches...');
    for (const meal of allMeals) {
      const result = await this.analyzeMeal(meal, imageInfoMap, duplicateGroups);
      this.results.push(result);
    }

    // Step 4: Apply fixes if not dry run
    if (!dryRun) {
      console.log('\n🔧 Step 4: Applying automated fixes...');
      await this.applyFixes();
    }

    // Step 5: Generate reports
    console.log('\n📄 Step 5: Generating audit reports...');
    await this.generateReports(dryRun);

    return this.results;
  }

  private async analyzeImage(imageUrl: string | null): Promise<ImageInfo | null> {
    if (!imageUrl) return null;
    
    if (this.imageCache.has(imageUrl)) {
      return this.imageCache.get(imageUrl)!;
    }

    const info: ImageInfo = {
      url: imageUrl,
      exists: false,
      accessible: false
    };

    try {
      // Check if it's a local file
      if (imageUrl.startsWith('/attached_assets') || imageUrl.startsWith('attached_assets')) {
        const localPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
        info.localPath = localPath;
        info.exists = fs.existsSync(localPath);
        
        if (info.exists) {
          info.accessible = true;
          const buffer = fs.readFileSync(localPath);
          info.sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
          info.fileSize = buffer.length;
          
          // Compute perceptual hash
          try {
            const image = await Jimp.read(buffer);
            info.pHash = image.hash();
          } catch (e) {
            console.warn(`⚠️ Could not compute pHash for ${imageUrl}: ${e}`);
          }
        }
      }
      // Check remote URLs
      else if (imageUrl.startsWith('http')) {
        info.accessible = await this.checkRemoteImage(imageUrl);
        if (info.accessible) {
          // For remote images, we can still compute hashes
          try {
            const response = await fetch(imageUrl, { 
              method: 'GET',
              signal: AbortSignal.timeout(CONFIG.HTTP_TIMEOUT)
            });
            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer());
              info.sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
              info.fileSize = buffer.length;
              info.contentType = response.headers.get('content-type') || undefined;
              
              const image = await Jimp.read(buffer);
              info.pHash = image.hash();
            }
          } catch (e) {
            console.warn(`⚠️ Could not analyze remote image ${imageUrl}: ${e}`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error analyzing image ${imageUrl}: ${error}`);
    }

    this.imageCache.set(imageUrl, info);
    return info;
  }

  private async checkRemoteImage(url: string): Promise<boolean> {
    return this.httpQueue.add(async () => {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(CONFIG.HTTP_TIMEOUT),
        });
        
        return response.ok && 
               response.headers.get('content-type')?.startsWith('image/') === true;
      } catch {
        return false;
      }
    });
  }

  private detectDuplicates(imageInfoMap: Map<string, ImageInfo>, meals: Meal[]): DuplicateGroup[] {
    const sha256Groups = new Map<string, string[]>();
    const pHashGroups = new Map<string, string[]>();
    
    // Group by exact SHA256 match
    for (const [url, info] of imageInfoMap) {
      if (info.sha256) {
        if (!sha256Groups.has(info.sha256)) {
          sha256Groups.set(info.sha256, []);
        }
        sha256Groups.get(info.sha256)!.push(url);
      }
    }
    
    // Group by perceptual hash similarity
    const processedPHashes = new Set<string>();
    for (const [url, info] of imageInfoMap) {
      if (info.pHash && !processedPHashes.has(info.pHash)) {
        const similarUrls = [url];
        processedPHashes.add(info.pHash);
        
        for (const [otherUrl, otherInfo] of imageInfoMap) {
          if (otherUrl !== url && otherInfo.pHash && !processedPHashes.has(otherInfo.pHash)) {
            const distance = this.hammingDistance(info.pHash, otherInfo.pHash);
            if (distance <= CONFIG.PERCEPTUAL_HASH_THRESHOLD) {
              similarUrls.push(otherUrl);
              processedPHashes.add(otherInfo.pHash);
            }
          }
        }
        
        if (similarUrls.length > 1) {
          pHashGroups.set(info.pHash, similarUrls);
        }
      }
    }
    
    // Convert to DuplicateGroup format
    const groups: DuplicateGroup[] = [];
    
    // Process SHA256 exact duplicates
    for (const [sha256, urls] of sha256Groups) {
      if (urls.length > 1) {
        const groupMeals = meals.filter(m => m.imageUrl && urls.includes(m.imageUrl))
          .map(m => ({ 
            id: m.id, 
            name: m.name, 
            category: m.category,
            imageLocked: m.imageLocked || false 
          }));
        
        groups.push({
          sha256,
          urls,
          meals: groupMeals,
          keepUrl: this.selectBestImageForGroup(groupMeals, urls),
          replaceUrls: urls.slice(1)
        });
      }
    }
    
    // Process perceptual hash near-duplicates (only if not already in exact duplicates)
    for (const [pHash, urls] of pHashGroups) {
      const notInExactDupes = urls.filter(url => 
        !groups.some(g => g.urls.includes(url))
      );
      
      if (notInExactDupes.length > 1) {
        const groupMeals = meals.filter(m => m.imageUrl && notInExactDupes.includes(m.imageUrl))
          .map(m => ({ 
            id: m.id, 
            name: m.name, 
            category: m.category,
            imageLocked: m.imageLocked || false 
          }));
        
        groups.push({
          pHash,
          urls: notInExactDupes,
          meals: groupMeals,
          keepUrl: this.selectBestImageForGroup(groupMeals, notInExactDupes),
          replaceUrls: notInExactDupes.slice(1)
        });
      }
    }
    
    return groups;
  }

  private selectBestImageForGroup(meals: Array<{ id: string; name: string; category: string; imageLocked?: boolean }>, urls: string[]): string {
    // Priority: imageLocked > best name match > first alphabetically
    const lockedMeal = meals.find(m => m.imageLocked);
    if (lockedMeal) {
      const meal = meals.find(m => m.id === lockedMeal.id);
      const correspondingUrl = urls[meals.indexOf(meal!)];
      return correspondingUrl || urls[0];
    }
    
    // Find best name match
    let bestScore = -1;
    let bestUrl = urls[0];
    
    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      const url = urls[i];
      if (!url) continue;
      
      const filename = path.basename(url, path.extname(url));
      const score = stringSimilarity.compareTwoStrings(
        filename.toLowerCase().replace(/[_-]/g, ' '),
        meal.name.toLowerCase()
      );
      
      if (score > bestScore) {
        bestScore = score;
        bestUrl = url;
      }
    }
    
    return bestUrl;
  }

  private hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return Infinity;
    
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    return distance;
  }

  private async analyzeMeal(meal: Meal, imageInfoMap: Map<string, ImageInfo>, duplicateGroups: DuplicateGroup[]): Promise<ImageAuditResult> {
    const result: ImageAuditResult = {
      mealId: meal.id,
      name: meal.name,
      category: meal.category,
      oldUrl: meal.imageUrl,
      newUrl: meal.imageUrl,
      status: 'ok',
      reasons: [],
      action: 'none'
    };

    // Check if image is missing or broken
    if (!meal.imageUrl) {
      result.status = 'missing';
      result.reasons.push('No image URL specified');
      result.action = 'flagged';
      return result;
    }

    const imageInfo = imageInfoMap.get(meal.imageUrl);
    if (!imageInfo || !imageInfo.accessible) {
      result.status = imageInfo?.exists === false ? 'missing' : '404';
      result.reasons.push(imageInfo?.exists === false ? 'Image file not found' : 'Image URL returns 404 or not accessible');
      result.action = 'flagged';
      return result;
    }

    // Check if it's part of a duplicate group
    const duplicateGroup = duplicateGroups.find(g => g.urls.includes(meal.imageUrl!));
    if (duplicateGroup && meal.imageUrl !== duplicateGroup.keepUrl) {
      result.status = 'duplicate';
      result.reasons.push(`Image shared with ${duplicateGroup.meals.length - 1} other recipes`);
      result.action = 'flagged';
      return result;
    }

    // Check content match
    const contentScore = this.calculateContentScore(meal, meal.imageUrl);
    result.contentScore = contentScore;
    
    if (contentScore < CONFIG.CONTENT_MATCH_THRESHOLD) {
      result.status = 'content_mismatch';
      result.reasons.push(`Low content match score: ${contentScore.toFixed(2)}`);
      result.action = 'flagged';
    }

    // Add hash information
    if (imageInfo.sha256) result.sha256 = imageInfo.sha256;
    if (imageInfo.pHash) result.pHash = imageInfo.pHash;

    return result;
  }

  private calculateContentScore(meal: Meal, imageUrl: string): number {
    const filename = path.basename(imageUrl, path.extname(imageUrl));
    const cleanFilename = filename.toLowerCase()
      .replace(/[_-]/g, ' ')
      .replace(/\d+/g, '')
      .replace(/[^a-z\s]/g, '');
    
    const mealTokens = meal.name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);
    
    const categoryTokens = meal.category.toLowerCase().split(/\s+/);
    const allTokens = [...mealTokens, ...categoryTokens];
    
    let matches = 0;
    for (const token of allTokens) {
      if (cleanFilename.includes(token)) {
        matches++;
      }
    }
    
    return allTokens.length > 0 ? matches / allTokens.length : 0;
  }

  private async applyFixes(): Promise<void> {
    const toFix = this.results.filter(r => 
      r.status !== 'ok' && r.action === 'flagged' && !r.oldUrl?.includes('imageLocked')
    );
    
    console.log(`🔧 Applying fixes to ${toFix.length} recipes...`);
    
    for (const result of toFix) {
      try {
        const newUrl = await this.findReplacementImage(result);
        if (newUrl && newUrl !== result.oldUrl) {
          // Update database
          await this.db.update(meals)
            .set({ imageUrl: newUrl })
            .where(eq(meals.id, result.mealId));
          
          result.newUrl = newUrl;
          result.status = 'fixed';
          result.action = 'replaced';
          result.fixedBy = 'auto';
          result.reasons.push(`Replaced with: ${newUrl}`);
          
          console.log(`  ✓ Fixed ${result.name}: ${result.oldUrl} → ${newUrl}`);
        }
      } catch (error) {
        result.reasons.push(`Fix failed: ${error}`);
        console.error(`  ✗ Failed to fix ${result.name}: ${error}`);
      }
    }
  }

  private async findReplacementImage(result: ImageAuditResult): Promise<string | null> {
    // Find best matching asset by filename similarity
    const searchTokens = result.name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);
    
    let bestMatch = '';
    let bestScore = 0;
    
    for (const assetPath of this.availableAssets) {
      const filename = path.basename(assetPath, path.extname(assetPath));
      const cleanFilename = filename.toLowerCase().replace(/[_-]/g, ' ');
      
      const score = stringSimilarity.compareTwoStrings(
        searchTokens.join(' '),
        cleanFilename
      );
      
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = '/' + assetPath.replace(/\\/g, '/');
      }
    }
    
    return bestMatch || null;
  }

  private async generateReports(dryRun: boolean): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportsDir = 'scripts/audit_reports';
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Summary stats
    const stats = {
      total: this.results.length,
      ok: this.results.filter(r => r.status === 'ok').length,
      missing: this.results.filter(r => r.status === 'missing').length,
      broken404: this.results.filter(r => r.status === '404').length,
      duplicates: this.results.filter(r => r.status === 'duplicate').length,
      contentMismatches: this.results.filter(r => r.status === 'content_mismatch').length,
      fixed: this.results.filter(r => r.status === 'fixed').length,
      flagged: this.results.filter(r => r.action === 'flagged').length
    };

    // JSON Report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      dryRun,
      stats,
      results: this.results
    };
    
    const jsonPath = path.join(reportsDir, `image_audit_${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    // CSV Report
    const csvData = this.results.map(r => ({
      meal_id: r.mealId,
      name: r.name,
      category: r.category,
      old_url: r.oldUrl || '',
      new_url: r.newUrl || '',
      status: r.status,
      reasons: r.reasons.join('; '),
      content_score: r.contentScore?.toFixed(3) || '',
      action: r.action,
      fixed_by: r.fixedBy || '',
      sha256: r.sha256 || '',
      phash: r.pHash || ''
    }));
    
    const csvContent = stringify(csvData, { header: true });
    const csvPath = path.join(reportsDir, `image_audit_${timestamp}.csv`);
    fs.writeFileSync(csvPath, csvContent);

    // Console summary
    console.log('\n📊 AUDIT SUMMARY:');
    console.log(`✅ Total recipes: ${stats.total}`);
    console.log(`🟢 OK: ${stats.ok}`);
    console.log(`🔴 Missing: ${stats.missing}`);
    console.log(`🟠 404/Broken: ${stats.broken404}`);
    console.log(`🟡 Duplicates: ${stats.duplicates}`);
    console.log(`🟣 Content mismatches: ${stats.contentMismatches}`);
    console.log(`🔧 Fixed: ${stats.fixed}`);
    console.log(`🚩 Flagged for manual review: ${stats.flagged}`);
    
    console.log(`\n📄 Reports saved:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  CSV: ${csvPath}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--fix');
  
  console.log('🚀 GlycoGuide Recipe Image Auditor');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'FIX MODE (will update database)'}`);
  
  const auditor = new ImageAuditor();
  await auditor.init();
  
  const results = await auditor.auditAllRecipes(dryRun);
  
  const critical = results.filter(r => 
    r.status === 'missing' || r.status === '404'
  ).length;
  
  if (critical > 0) {
    console.log(`\n🚨 CRITICAL: ${critical} recipes have missing or broken images!`);
    process.exit(1);
  } else {
    console.log('\n✅ Audit completed successfully!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ImageAuditor, type ImageAuditResult };