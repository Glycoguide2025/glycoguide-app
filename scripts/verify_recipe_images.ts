// Automated Recipe Image Verification System
// Processes all recipes simultaneously to identify and fix image mismatches
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ImageOntology } from './lib/imageOntology.js';

// Get script directory for robust file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, 'data');

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  category: string;
  image_url: string;
  glycemic_index: string;
  glycemic_value?: number;
}

interface ImageIndexEntry {
  filename: string;
  fullPath: string;
  tokens: string[];
  categories: string[];
}

interface VerificationResult {
  recipeId: string;
  recipeName: string;
  currentImage: string;
  issues: string[];
  matchScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedImage?: string;
  suggestedReason?: string;
  actionRequired: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL' | 'OK';
}

interface AuditReport {
  timestamp: string;
  totalRecipes: number;
  criticalIssues: number;
  recommendedFixes: number;
  okRecipes: number;
  results: VerificationResult[];
}

export class RecipeImageVerifier {
  private imageIndex: ImageIndexEntry[] = [];
  private dryRun: boolean = true;

  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
    this.loadImageIndex();
  }

  private loadImageIndex(): void {
    try {
      const indexFile = join(dataDir, 'image-index.json');
      const indexData = readFileSync(indexFile, 'utf-8');
      this.imageIndex = JSON.parse(indexData);
      console.log(`📚 Loaded index of ${this.imageIndex.length} images`);
    } catch (error) {
      console.error('❌ Failed to load image index. Run buildImageIndex.ts first!');
      throw error;
    }
  }

  async verifyAllRecipes(): Promise<AuditReport> {
    console.log(`🔍 Starting ${this.dryRun ? 'DRY RUN' : 'LIVE'} verification of all recipes...`);

    // Fetch all recipes from database
    const recipes = await this.fetchAllRecipes();
    console.log(`📋 Processing ${recipes.length} recipes...`);

    const results: VerificationResult[] = [];
    let criticalCount = 0;
    let recommendedCount = 0;
    let okCount = 0;

    // Process recipes in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(recipe => this.verifyRecipe(recipe))
      );
      
      results.push(...batchResults);
      
      // Count issues
      batchResults.forEach(result => {
        if (result.actionRequired === 'CRITICAL') criticalCount++;
        else if (result.actionRequired === 'RECOMMENDED') recommendedCount++;
        else if (result.actionRequired === 'OK') okCount++;
      });

      console.log(`✅ Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(recipes.length/batchSize)} (${i + batch.length}/${recipes.length} recipes)`);
    }

    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      totalRecipes: recipes.length,
      criticalIssues: criticalCount,
      recommendedFixes: recommendedCount,
      okRecipes: okCount,
      results
    };

    await this.generateReport(report);
    return report;
  }

  private async fetchAllRecipes(): Promise<Recipe[]> {
    const { fetchAllRecipes } = await import('./database.js');
    return await fetchAllRecipes();
  }

  private async verifyRecipe(recipe: Recipe): Promise<VerificationResult> {
    // Extract tokens from recipe ingredients and name
    const recipeText = [recipe.name, ...recipe.ingredients].join(' ');
    const recipeTokens = ImageOntology.tokenize(recipeText);

    // Extract tokens from current image filename
    const currentImageFilename = recipe.image_url.split('/').pop() || '';
    const imageTokens = ImageOntology.tokenize(currentImageFilename);

    // Calculate match score
    const matchResult = ImageOntology.calculateMatchScore(
      recipeTokens, 
      imageTokens, 
      recipe.category
    );

    let actionRequired: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL' | 'OK' = 'OK';
    let suggestedImage: string | undefined;
    let suggestedReason: string | undefined;

    // Determine action required based on issues
    if (matchResult.issues.some(issue => issue.includes('Forbidden ingredients'))) {
      actionRequired = 'CRITICAL';
    } else if (matchResult.score < 50) {
      actionRequired = 'RECOMMENDED';
    } else if (matchResult.score < 70) {
      actionRequired = 'OPTIONAL';
    }

    // Find better image if needed
    if (actionRequired !== 'OK') {
      const bestMatch = ImageOntology.findBestMatch(
        recipeTokens,
        recipe.category,
        this.imageIndex
      );

      if (bestMatch) {
        suggestedImage = bestMatch.filename;
        suggestedReason = bestMatch.reason;
      }
    }

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      currentImage: currentImageFilename,
      issues: matchResult.issues,
      matchScore: matchResult.score,
      confidence: matchResult.confidence,
      suggestedImage,
      suggestedReason,
      actionRequired
    };
  }

  private async generateReport(report: AuditReport): Promise<void> {
    const timestamp = report.timestamp.replace(/[:.]/g, '-');
    const reportPath = `./data/image-audit-${timestamp}.json`;
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate human-readable summary
    const summaryPath = `./data/image-audit-summary-${timestamp}.txt`;
    const summary = this.generateSummary(report);
    writeFileSync(summaryPath, summary);

    console.log(`📊 Report saved to: ${reportPath}`);
    console.log(`📋 Summary saved to: ${summaryPath}`);
    console.log('\n' + summary);
  }

  private generateSummary(report: AuditReport): string {
    const { totalRecipes, criticalIssues, recommendedFixes, okRecipes } = report;
    
    let summary = `🔍 RECIPE IMAGE AUDIT REPORT\n`;
    summary += `Generated: ${report.timestamp}\n\n`;
    summary += `📊 SUMMARY:\n`;
    summary += `• Total Recipes: ${totalRecipes}\n`;
    summary += `• ❌ Critical Issues: ${criticalIssues}\n`;
    summary += `• ⚠️  Recommended Fixes: ${recommendedFixes}\n`;
    summary += `• ✅ OK Recipes: ${okRecipes}\n\n`;

    if (criticalIssues > 0) {
      summary += `🚨 CRITICAL ISSUES (Forbidden ingredient mismatches):\n`;
      report.results
        .filter(r => r.actionRequired === 'CRITICAL')
        .slice(0, 10) // Show top 10
        .forEach(result => {
          summary += `• ${result.recipeName}: ${result.issues.join(', ')}\n`;
          if (result.suggestedImage) {
            summary += `  → Suggested: ${result.suggestedImage}\n`;
          }
        });
      summary += '\n';
    }

    if (recommendedFixes > 0) {
      summary += `⚠️  TOP RECOMMENDED FIXES:\n`;
      report.results
        .filter(r => r.actionRequired === 'RECOMMENDED')
        .sort((a, b) => a.matchScore - b.matchScore) // Worst scores first
        .slice(0, 10)
        .forEach(result => {
          summary += `• ${result.recipeName} (Score: ${result.matchScore})\n`;
          if (result.suggestedImage) {
            summary += `  → Suggested: ${result.suggestedImage}\n`;
          }
        });
    }

    return summary;
  }

  async applySurgicalFixes(): Promise<void> {
    if (this.dryRun) {
      console.log('❌ Cannot apply fixes in dry-run mode');
      return;
    }

    console.log('🔧 Starting surgical precision fixes (regression-safe)...');
    
    const { updateMealImage } = await import('./database.js');
    
    // Load image locks to protect manually-fixed images
    const locks = this.loadImageLocks();

    // Get latest audit report
    const report = await this.verifyAllRecipes();
    
    // ONLY apply CRITICAL fixes, and RECOMMENDED with significant improvement  
    // Exclude locked images from any changes
    const criticalFixes = report.results.filter(r => 
      r.actionRequired === 'CRITICAL' && 
      r.suggestedImage &&
      !locks.locked_recipes[r.recipeId] && // Skip locked images
      this.isFormFactorCompatible(r.recipeName, r.suggestedImage)
    );
    
    const highValueRecommended = report.results.filter(r => 
      r.actionRequired === 'RECOMMENDED' && 
      r.suggestedImage && 
      r.matchScore < 0 && // Only replace genuinely poor current images
      r.confidence === 'HIGH' && // High confidence in replacement
      !locks.locked_recipes[r.recipeId] && // Skip locked images
      this.isFormFactorCompatible(r.recipeName, r.suggestedImage) &&
      !this.hasForbiddenIssues(r.issues)
    );

    const allFixes = [...criticalFixes, ...highValueRecommended];
    console.log(`🎯 Surgical fixes identified: ${allFixes.length} (${criticalFixes.length} critical, ${highValueRecommended.length} high-value recommended)`);
    console.log(`🛡️  Regression prevention: Rejected ${report.results.length - allFixes.length} low-confidence changes`);

    let appliedCount = 0;
    let failedCount = 0;
    const rollback: Array<{id: string, recipeName: string, oldImage: string, newImage: string, reason: string}> = [];
    const failures: Array<{recipeName: string, error: string}> = [];

    // Process in batches to avoid overwhelming the database
    const batchSize = 25;
    for (let i = 0; i < allFixes.length; i += batchSize) {
      const batch = allFixes.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allFixes.length/batchSize)} (${batch.length} recipes)`);

      for (const fix of batch) {
        try {
          const newImageUrl = `/attached_assets/generated_images/${fix.suggestedImage}`;
          
          // Belt-and-suspenders: Double-check if this recipe is locked before applying
          if (locks.locked_recipes[fix.recipeId]) {
            console.log(`🚫 SKIPPED (locked): ${fix.recipeName} - ${locks.locked_recipes[fix.recipeId]}`);
            continue;
          }

          // Store rollback info
          rollback.push({
            id: fix.recipeId,
            recipeName: fix.recipeName,
            oldImage: fix.currentImage,
            newImage: newImageUrl,
            reason: `${fix.actionRequired}: ${fix.issues.join('; ')}`
          });

          // Apply the fix
          await updateMealImage(fix.recipeId, newImageUrl);

          console.log(`✅ Fixed: ${fix.recipeName} (Score: ${fix.matchScore})`);
          appliedCount++;

        } catch (error) {
          console.error(`❌ Failed to fix ${fix.recipeName}:`, error);
          failures.push({
            recipeName: fix.recipeName,
            error: String(error)
          });
          failedCount++;
        }
      }

      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save comprehensive rollback file
    const rollbackFile = join(dataDir, `comprehensive-rollback-${Date.now()}.json`);
    writeFileSync(rollbackFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalApplied: appliedCount,
      totalFailed: failedCount,
      changes: rollback,
      failures: failures
    }, null, 2));

    console.log(`\n🎉 COMPREHENSIVE FIX COMPLETE!`);
    console.log(`✅ Successfully fixed: ${appliedCount} recipes`);
    console.log(`❌ Failed fixes: ${failedCount} recipes`);
    console.log(`📋 Rollback file: ${rollbackFile}`);
    
    return this.generateFixSummary(appliedCount, failedCount, rollback);
  }

  private async generateFixSummary(applied: number, failed: number, changes: any[]): Promise<void> {
    const summary = `
🔧 COMPREHENSIVE RECIPE IMAGE FIX SUMMARY
Generated: ${new Date().toISOString()}

📊 RESULTS:
• Successfully Fixed: ${applied} recipes
• Failed Fixes: ${failed} recipes  
• Success Rate: ${Math.round((applied / (applied + failed)) * 100)}%

🎯 SAMPLE FIXES APPLIED:
${changes.slice(0, 10).map(change => 
  `• ${change.recipeName}: ${change.reason}`
).join('\n')}

💰 ESTIMATED SAVINGS:
• Manual review at $80 CAD/day would take ~${Math.ceil((applied + failed) / 20)} days
• Estimated cost savings: $${Math.ceil((applied + failed) / 20) * 80} CAD

✅ The systematic approach fixed ${applied} recipes in minutes instead of weeks of manual work!
`;

    const summaryFile = `./data/fix-summary-${Date.now()}.txt`;
    writeFileSync(summaryFile, summary);
    console.log(summary);
    console.log(`📋 Full summary: ${summaryFile}`);
  }

  // Form factor compatibility check
  private isFormFactorCompatible(recipeName: string, suggestedImageFile: string): boolean {
    const recipeTokens = recipeName.toLowerCase().split(/\s+/);
    const imageTokens = suggestedImageFile.toLowerCase().split(/[_.-]/);
    
    const beverageTokens = ['smoothie', 'juice', 'latte', 'tea', 'coffee', 'drink'];
    const recipeIsBeverage = recipeTokens.some(token => beverageTokens.includes(token));
    const imageIsBeverage = imageTokens.some(token => beverageTokens.includes(token));
    
    // Prevent beverage/solid food mismatches
    if (!recipeIsBeverage && imageIsBeverage) {
      console.log(`🚫 Form-factor mismatch: ${recipeName} (solid food) → ${suggestedImageFile} (beverage)`);
      return false;
    }
    
    return true;
  }

  // Check for forbidden critical issues
  private hasForbiddenIssues(issues: string[]): boolean {
    const forbidden = ['dairy', 'potato', 'forbidden ingredient'];
    return issues.some(issue => 
      forbidden.some(forbiddenTerm => issue.toLowerCase().includes(forbiddenTerm))
    );
  }

  // Load image lock system (fixed path resolution)
  private loadImageLocks(): {locked_recipes: {[key: string]: string}} {
    try {
      const locksFile = join(dataDir, 'image-locks.json');
      if (existsSync(locksFile)) {
        const locks = JSON.parse(readFileSync(locksFile, 'utf8'));
        const lockCount = Object.keys(locks.locked_recipes || {}).length;
        console.log(`🔒 Loaded ${lockCount} image locks from ${locksFile}`);
        if (lockCount > 0) {
          const sampleIds = Object.keys(locks.locked_recipes).slice(0, 3);
          console.log(`🔒 Sample locked recipes: ${sampleIds.join(', ')}`);
        }
        return locks;
      } else {
        console.log(`⚠️  CRITICAL: Lock file missing at ${locksFile}`);
        console.log('❌  ABORTING: Cannot proceed without lock protection to prevent regressions!');
        throw new Error('Lock file required for regression prevention');
      }
    } catch (error) {
      console.error('❌ Failed to load image locks:', error);
      throw error;
    }
  }

  // Lock an image to prevent future automated changes
  async lockRecipeImage(recipeId: string, reason: string): Promise<void> {
    const locks = this.loadImageLocks();
    locks.locked_recipes[recipeId] = reason;
    
    const locksFile = join(dataDir, 'image-locks.json');
    writeFileSync(locksFile, JSON.stringify(locks, null, 2));
    console.log(`🔒 Locked recipe ${recipeId}: ${reason}`);
  }

  async applyHighConfidenceFixes(): Promise<void> {
    // Use surgical precision instead of broad fixes
    return this.applySurgicalFixes();
  }
}

// CLI runner
async function main() {
  const isDryRun = !process.argv.includes('--apply');
  const verifier = new RecipeImageVerifier(isDryRun);
  
  try {
    const report = await verifier.verifyAllRecipes();
    
    if (report.criticalIssues > 0) {
      console.log(`\n🚨 Found ${report.criticalIssues} critical image mismatches!`);
    }
    
    if (!isDryRun && report.criticalIssues === 0) {
      await verifier.applyHighConfidenceFixes();
    }
    
  } catch (error) {
    console.error(`💥 Verification failed:`, error);
    process.exit(1);
  }
}

// Run if this is the main module  
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}