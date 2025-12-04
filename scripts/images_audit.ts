import { db } from '../server/db';
import { meals } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

interface ImageAuditResult {
  mealId: string;
  mealName: string;
  currentImageUrl?: string;
  issues: string[];
  suggestedFix?: {
    newImageUrl: string;
    confidence: number;
    reason: string;
  };
}

interface AuditSummary {
  totalMeals: number;
  totalImages: number;
  issuesFound: {
    missingFiles: number;
    wrongPaths: number;
    duplicates: number;
    mismatches: number;
  };
  fixableIssues: number;
  unfixableIssues: number;
}

export class ImageAuditSystem {
  private availableImages: string[] = [];
  private auditResults: ImageAuditResult[] = [];
  private duplicateUsage: Map<string, string[]> = new Map();

  constructor() {
    this.loadAvailableImages();
  }

  private loadAvailableImages(): void {
    // Use process.cwd() which should be the root directory
    const imagesDir = path.join(process.cwd(), 'attached_assets', 'generated_images');
    try {
      this.availableImages = fs.readdirSync(imagesDir)
        .filter(file => file.endsWith('.png'))
        .map(file => `/attached_assets/generated_images/${file}`);
      console.log(`Loaded ${this.availableImages.length} available images from: ${imagesDir}`);
    } catch (error) {
      console.error('Error loading images:', error);
      console.error('Tried directory:', imagesDir);
      this.availableImages = [];
    }
  }

  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTokens(text: string): string[] {
    const normalized = this.normalizeText(text);
    return normalized.split(' ').filter(token => token.length > 2);
  }

  // Domain-aware heuristics for better image matching
  private readonly categoryMappings = {
    'breakfast': ['breakfast', 'morning', 'bowl', 'parfait', 'smoothie', 'oatmeal', 'granola', 'eggs', 'pancakes'],
    'lunch': ['lunch', 'salad', 'bowl', 'wrap', 'sandwich', 'soup', 'grain'],
    'dinner': ['dinner', 'feast', 'plate', 'stew', 'casserole', 'roast', 'grilled'],
    'snack': ['snack', 'bites', 'chips', 'crackers', 'energy', 'trail', 'mix'],
    'soup': ['soup', 'stew', 'broth', 'bisque', 'chowder', 'gazpacho'],
    'dessert': ['dessert', 'cake', 'cookie', 'mousse', 'ice', 'cream', 'chocolate', 'sweet'],
    'pizza': ['pizza', 'flatbread', 'crust'],
    'beverage': ['drink', 'smoothie', 'juice', 'tea', 'coffee', 'latte', 'water', 'beverage']
  };

  private readonly cuisineTokens = {
    'moroccan': ['moroccan', 'tagine', 'couscous', 'harissa'],
    'jamaican': ['jamaican', 'jerk', 'curry', 'ackee', 'saltfish', 'callaloo', 'escovitch'],
    'asian': ['asian', 'stir', 'fry', 'rice', 'noodles', 'soy', 'ginger'],
    'mediterranean': ['mediterranean', 'greek', 'olive', 'feta', 'hummus'],
    'indian': ['indian', 'curry', 'dal', 'spiced', 'turmeric'],
    'italian': ['italian', 'pasta', 'risotto', 'parmesan', 'basil'],
    'french': ['french', 'provincial', 'bourguignon', 'ratatouille']
  };

  private readonly proteinTokens = {
    'meat': ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'meat'],
    'fish': ['fish', 'salmon', 'cod', 'tuna', 'shrimp', 'seafood'],
    'vegetarian': ['vegetarian', 'vegan', 'plant', 'tofu', 'beans', 'lentils']
  };

  private readonly contradictoryPairs = [
    { vegetarian: ['fish', 'chicken', 'beef', 'pork', 'lamb', 'meat', 'seafood'] },
    { dessert: ['soup', 'stew', 'salad', 'dinner', 'lunch'] },
    { breakfast: ['dinner', 'feast'] },
    { beverage: ['pizza', 'solid', 'plate'] }
  ];

  private calculateImageMatchScore(mealName: string, imageUrl: string, mealCategory?: string, mealIngredients?: string[]): number {
    const mealTokens = this.extractTokens(mealName);
    const imageFileName = path.basename(imageUrl, '.png');
    const imageTokens = this.extractTokens(imageFileName.replace(/_/g, ' '));
    
    let baseScore = 0;
    let categoryBonus = 0;
    let cuisineBonus = 0;
    let contradictionPenalty = 0;
    let ingredientBonus = 0;
    
    const maxPossibleScore = Math.max(mealTokens.length, 1);

    // Base token matching with weighted scoring
    for (const mealToken of mealTokens) {
      let tokenMatched = false;
      for (const imageToken of imageTokens) {
        if (imageToken === mealToken) {
          baseScore += 1.0; // Exact match
          tokenMatched = true;
          break;
        } else if (imageToken.includes(mealToken) || mealToken.includes(imageToken)) {
          baseScore += 0.8; // Partial inclusion
          tokenMatched = true;
          break;
        } else if (mealToken.length > 3 && imageToken.length > 3) {
          const commonChars = this.getCommonSubstring(mealToken, imageToken);
          if (commonChars.length >= 3) {
            baseScore += 0.5; // Substring match
            tokenMatched = true;
            break;
          }
        }
      }
    }

    // Category matching boost
    if (mealCategory && this.categoryMappings[mealCategory]) {
      const categoryTokens = this.categoryMappings[mealCategory];
      for (const categoryToken of categoryTokens) {
        if (imageTokens.some(token => token.includes(categoryToken) || categoryToken.includes(token))) {
          categoryBonus += 0.3;
          break;
        }
      }
    }

    // Cuisine matching boost
    for (const [cuisine, tokens] of Object.entries(this.cuisineTokens)) {
      const mealHasCuisine = mealTokens.some(token => tokens.includes(token));
      const imageHasCuisine = imageTokens.some(token => tokens.includes(token));
      if (mealHasCuisine && imageHasCuisine) {
        cuisineBonus += 0.4;
        break;
      }
    }

    // Ingredient matching bonus
    if (mealIngredients && mealIngredients.length > 0) {
      const ingredientTokens = mealIngredients.flatMap(ing => this.extractTokens(ing));
      let matchedIngredients = 0;
      for (const ingredientToken of ingredientTokens) {
        if (imageTokens.some(token => token.includes(ingredientToken) || ingredientToken.includes(token))) {
          matchedIngredients++;
        }
      }
      ingredientBonus = (matchedIngredients / Math.max(ingredientTokens.length, 1)) * 0.3;
    }

    // Contradiction penalties
    for (const contradictionGroup of this.contradictoryPairs) {
      for (const [primaryType, conflictingTokens] of Object.entries(contradictionGroup)) {
        const mealHasPrimary = mealTokens.some(token => token.includes(primaryType));
        const imageHasConflicting = imageTokens.some(token => 
          conflictingTokens.some(conflictToken => token.includes(conflictToken))
        );
        if (mealHasPrimary && imageHasConflicting) {
          contradictionPenalty += 0.5; // Heavy penalty for contradictions
        }
      }
    }

    // Final score calculation with bounds checking
    const rawScore = (baseScore + categoryBonus + cuisineBonus + ingredientBonus - contradictionPenalty) / maxPossibleScore;
    return Math.max(0, Math.min(1, rawScore)); // Clamp between 0 and 1
  }

  private getCommonSubstring(str1: string, str2: string): string {
    let longest = '';
    for (let i = 0; i < str1.length; i++) {
      for (let j = i + 1; j <= str1.length; j++) {
        const substr = str1.slice(i, j);
        if (str2.includes(substr) && substr.length > longest.length) {
          longest = substr;
        }
      }
    }
    return longest;
  }

  private findBestImageMatch(
    mealName: string, 
    excludeUrls: string[] = [], 
    mealCategory?: string, 
    mealIngredients?: string[]
  ): { url: string; confidence: number } | null {
    let bestMatch = { url: '', confidence: 0 };

    for (const imageUrl of this.availableImages) {
      if (excludeUrls.includes(imageUrl)) continue;
      
      const confidence = this.calculateImageMatchScore(mealName, imageUrl, mealCategory, mealIngredients);
      if (confidence > bestMatch.confidence) {
        bestMatch = { url: imageUrl, confidence };
      }
    }

    return bestMatch.confidence >= 0.5 ? bestMatch : null; // Raised threshold from 0.3 to 0.5
  }

  private fileExists(filePath: string): boolean {
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
    return fs.existsSync(fullPath);
  }

  private isStandardPath(imageUrl: string): boolean {
    return imageUrl.startsWith('/attached_assets/generated_images/');
  }

  async auditSingleMeal(meal: { id: string; name: string; image_url?: string; category?: string; ingredients?: string[] }): Promise<ImageAuditResult> {
    const result: ImageAuditResult = {
      mealId: meal.id,
      mealName: meal.name,
      currentImageUrl: meal.image_url || undefined,
      issues: []
    };

    // Check if image URL is missing
    if (!meal.image_url) {
      result.issues.push('Missing image URL');
      const bestMatch = this.findBestImageMatch(meal.name, [], meal.category, meal.ingredients);
      if (bestMatch) {
        result.suggestedFix = {
          newImageUrl: bestMatch.url,
          confidence: bestMatch.confidence,
          reason: `Auto-matched based on name similarity (${Math.round(bestMatch.confidence * 100)}% confidence)`
        };
      }
      return result;
    }

    // Check if file exists
    if (!this.fileExists(meal.image_url)) {
      result.issues.push('Image file does not exist');
    }

    // Check if path is standardized
    if (!this.isStandardPath(meal.image_url)) {
      result.issues.push('Non-standard image path');
    }

    // Check for potential name mismatches using enhanced scoring
    const currentMatchScore = this.calculateImageMatchScore(meal.name, meal.image_url, meal.category, meal.ingredients);
    if (currentMatchScore < 0.5) { // Raised threshold from 0.3 to 0.5
      result.issues.push(`Poor image-name match (${Math.round(currentMatchScore * 100)}% confidence)`);
    }

    // Track duplicate usage
    if (!this.duplicateUsage.has(meal.image_url)) {
      this.duplicateUsage.set(meal.image_url, []);
    }
    this.duplicateUsage.get(meal.image_url)!.push(meal.id);

    // Suggest fixes if there are issues
    if (result.issues.length > 0) {
      const excludeUrls = result.issues.includes('Image file does not exist') ? [] : [meal.image_url];
      const bestMatch = this.findBestImageMatch(meal.name, excludeUrls, meal.category, meal.ingredients);
      
      if (bestMatch && (bestMatch.confidence > currentMatchScore || result.issues.includes('Image file does not exist'))) {
        result.suggestedFix = {
          newImageUrl: bestMatch.url,
          confidence: bestMatch.confidence,
          reason: this.generateFixReason(result.issues, bestMatch.confidence, currentMatchScore)
        };
      }
    }

    return result;
  }

  private generateFixReason(issues: string[], newConfidence: number, oldConfidence: number): string {
    if (issues.includes('Image file does not exist')) {
      return `Replace missing file with best available match (${Math.round(newConfidence * 100)}% confidence)`;
    }
    if (issues.includes('Non-standard image path')) {
      return `Standardize path and improve match (${Math.round(newConfidence * 100)}% vs ${Math.round(oldConfidence * 100)}% confidence)`;
    }
    return `Improve image match (${Math.round(newConfidence * 100)}% vs ${Math.round(oldConfidence * 100)}% confidence)`;
  }

  async runFullAudit(): Promise<{ results: ImageAuditResult[]; summary: AuditSummary }> {
    console.log('Starting comprehensive image audit...');
    
    // Get all meals from database with enhanced data for domain-aware scoring
    const allMeals = await db.select({
      id: meals.id,
      name: meals.name,
      image_url: meals.imageUrl,
      category: meals.category,
      ingredients: meals.ingredients
    }).from(meals);

    console.log(`Auditing ${allMeals.length} meals...`);

    // Audit each meal
    for (const meal of allMeals) {
      const auditResult = await this.auditSingleMeal({
        ...meal,
        image_url: meal.image_url || undefined,
        ingredients: meal.ingredients || undefined
      });
      this.auditResults.push(auditResult);
    }

    // Identify duplicate usage with enhanced scoring
    for (const [imageUrl, mealIds] of this.duplicateUsage.entries()) {
      if (mealIds.length > 1) {
        for (let i = 1; i < mealIds.length; i++) {
          const result = this.auditResults.find(r => r.mealId === mealIds[i]);
          if (result) {
            result.issues.push(`Duplicate image usage (shared with ${mealIds.length - 1} other meals)`);
            
            // Suggest alternative for duplicates using enhanced scoring
            if (!result.suggestedFix) {
              const meal = allMeals.find(m => m.id === mealIds[i]);
              if (meal) {
                const bestMatch = this.findBestImageMatch(meal.name, [imageUrl], meal.category, meal.ingredients || undefined);
                if (bestMatch) {
                  result.suggestedFix = {
                    newImageUrl: bestMatch.url,
                    confidence: bestMatch.confidence,
                    reason: `Resolve duplicate usage with alternative match (${Math.round(bestMatch.confidence * 100)}% confidence)`
                  };
                }
              }
            }
          }
        }
      }
    }

    // Generate summary
    const summary = this.generateSummary();

    return { results: this.auditResults, summary };
  }

  private generateSummary(): AuditSummary {
    const issuesFound = {
      missingFiles: 0,
      wrongPaths: 0,
      duplicates: 0,
      mismatches: 0
    };

    let fixableIssues = 0;
    let unfixableIssues = 0;

    for (const result of this.auditResults) {
      if (result.issues.includes('Image file does not exist')) issuesFound.missingFiles++;
      if (result.issues.some(issue => issue.includes('Non-standard'))) issuesFound.wrongPaths++;
      if (result.issues.some(issue => issue.includes('Duplicate'))) issuesFound.duplicates++;
      if (result.issues.some(issue => issue.includes('Poor image-name match'))) issuesFound.mismatches++;

      if (result.suggestedFix) {
        fixableIssues++;
      } else if (result.issues.length > 0) {
        unfixableIssues++;
      }
    }

    return {
      totalMeals: this.auditResults.length,
      totalImages: this.availableImages.length,
      issuesFound,
      fixableIssues,
      unfixableIssues
    };
  }

  async applyAutoFixes(dryRun: boolean = true): Promise<{ applied: number; skipped: number; errors: string[]; changeLog: string[] }> {
    console.log(`${dryRun ? 'DRY RUN:' : ''} Applying enhanced auto-fixes...`);
    
    let applied = 0;
    let skipped = 0;
    const errors: string[] = [];
    const changeLog: string[] = [];
    
    // Apply high-confidence fixes (≥0.7) only
    const highConfidenceFixes = this.auditResults.filter(r => r.suggestedFix && r.suggestedFix.confidence >= 0.7);
    
    console.log(`High-confidence fixes to apply: ${highConfidenceFixes.length}`);

    for (const result of highConfidenceFixes) {
      try {
        const changeLogEntry = {
          timestamp: new Date().toISOString(),
          mealId: result.mealId,
          mealName: result.mealName,
          oldImageUrl: result.currentImageUrl || 'None',
          newImageUrl: result.suggestedFix!.newImageUrl,
          confidence: result.suggestedFix!.confidence,
          reason: result.suggestedFix!.reason,
          issues: result.issues.join(', ')
        };

        if (!dryRun) {
          await db.update(meals)
            .set({ imageUrl: result.suggestedFix!.newImageUrl })
            .where(eq(meals.id, result.mealId));
        }
        
        const logMessage = `${dryRun ? '[DRY RUN] ' : ''}FIXED: ${result.mealName} (${Math.round(result.suggestedFix!.confidence * 100)}% confidence) - ${result.suggestedFix!.reason}`;
        console.log(logMessage);
        changeLog.push(JSON.stringify(changeLogEntry, null, 2));
        applied++;
      } catch (error) {
        const errorMsg = `Failed to fix ${result.mealName}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        skipped++;
      }
    }

    return { applied, skipped, errors, changeLog };
  }

  generateMediumConfidenceReview(): string {
    const mediumConfidenceFixes = this.auditResults.filter(r => 
      r.suggestedFix && 
      r.suggestedFix.confidence >= 0.5 && 
      r.suggestedFix.confidence < 0.7
    );

    let reviewReport = `# Medium Confidence Fixes Review\n`;
    reviewReport += `Generated: ${new Date().toISOString()}\n\n`;
    reviewReport += `Total fixes requiring manual review: ${mediumConfidenceFixes.length}\n\n`;

    for (const result of mediumConfidenceFixes) {
      reviewReport += `## ${result.mealName} (${result.mealId})\n`;
      reviewReport += `**Current Image:** ${result.currentImageUrl || 'None'}\n`;
      reviewReport += `**Suggested Image:** ${result.suggestedFix!.newImageUrl}\n`;
      reviewReport += `**Confidence:** ${Math.round(result.suggestedFix!.confidence * 100)}%\n`;
      reviewReport += `**Issues:** ${result.issues.join(', ')}\n`;
      reviewReport += `**Reason:** ${result.suggestedFix!.reason}\n\n`;
      reviewReport += `---\n\n`;
    }

    return reviewReport;
  }

  generateReport(): string {
    const timestamp = new Date().toISOString();
    const summary = this.generateSummary();
    
    let report = `# Image Audit Report\nGenerated: ${timestamp}\n\n`;
    
    report += `## Summary\n`;
    report += `- Total Meals: ${summary.totalMeals}\n`;
    report += `- Total Available Images: ${summary.totalImages}\n`;
    report += `- Missing Files: ${summary.issuesFound.missingFiles}\n`;
    report += `- Wrong Paths: ${summary.issuesFound.wrongPaths}\n`;
    report += `- Duplicates: ${summary.issuesFound.duplicates}\n`;
    report += `- Poor Matches: ${summary.issuesFound.mismatches}\n`;
    report += `- Fixable Issues: ${summary.fixableIssues}\n`;
    report += `- Unfixable Issues: ${summary.unfixableIssues}\n\n`;

    report += `## Issues by Meal\n\n`;
    
    for (const result of this.auditResults.filter(r => r.issues.length > 0)) {
      report += `### ${result.mealName} (${result.mealId})\n`;
      report += `Current: ${result.currentImageUrl || 'None'}\n`;
      report += `Issues: ${result.issues.join(', ')}\n`;
      if (result.suggestedFix) {
        report += `Suggested Fix: ${result.suggestedFix.newImageUrl} (${result.suggestedFix.reason})\n`;
      }
      report += `\n`;
    }

    return report;
  }
}

// CLI interface
async function main() {
  const audit = new ImageAuditSystem();
  
  console.log('=== COMPREHENSIVE IMAGE AUDIT SYSTEM ===\n');
  
  // Run audit
  const { results, summary } = await audit.runFullAudit();
  
  // Generate and save report
  const report = audit.generateReport();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `scripts/audit_reports/image_audit_${timestamp}.md`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  // Show summary
  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Meals: ${summary.totalMeals}`);
  console.log(`Total Images Available: ${summary.totalImages}`);
  console.log(`Issues Found:`);
  console.log(`  - Missing Files: ${summary.issuesFound.missingFiles}`);
  console.log(`  - Wrong Paths: ${summary.issuesFound.wrongPaths}`);
  console.log(`  - Duplicates: ${summary.issuesFound.duplicates}`);
  console.log(`  - Poor Matches: ${summary.issuesFound.mismatches}`);
  console.log(`Fixable Issues: ${summary.fixableIssues}`);
  console.log(`Unfixable Issues: ${summary.unfixableIssues}`);
  
  // Generate medium confidence review report
  const mediumReview = audit.generateMediumConfidenceReview();
  const reviewPath = `scripts/audit_reports/medium_confidence_review_${timestamp}.md`;
  fs.writeFileSync(reviewPath, mediumReview);
  console.log(`\nMedium confidence review saved to: ${reviewPath}`);

  // Apply fixes if requested
  const args = process.argv.slice(2);
  if (args.includes('--fix')) {
    console.log('\n=== APPLYING ENHANCED FIXES ===');
    const dryRun = !args.includes('--no-dry-run');
    const fixResults = await audit.applyAutoFixes(dryRun);
    
    console.log(`High-confidence fixes applied: ${fixResults.applied}`);
    console.log(`Skipped: ${fixResults.skipped}`);
    if (fixResults.errors.length > 0) {
      console.log(`Errors: ${fixResults.errors.length}`);
      fixResults.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Save change log
    if (fixResults.changeLog.length > 0) {
      const changeLogPath = `scripts/audit_reports/change_log_${timestamp}.json`;
      fs.writeFileSync(changeLogPath, JSON.stringify(fixResults.changeLog, null, 2));
      console.log(`\nChange log saved to: ${changeLogPath}`);
    }
    
    if (dryRun) {
      console.log('\nTo actually apply fixes, run with: --fix --no-dry-run');
    } else {
      console.log('\n✅ High-confidence fixes have been applied to the database!');
      console.log('📋 Check the medium confidence review for fixes requiring manual approval.');
    }
  } else {
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Review the medium confidence fixes in the review report');
    console.log('2. To apply high-confidence fixes (≥70%), run with: --fix');
    console.log('3. To apply fixes without dry run: --fix --no-dry-run');
  }
}

export default ImageAuditSystem;

// Auto-run if executed directly
main().catch(console.error);