// GlycoGuide Recipe Audit Execution Script
// Runs comprehensive audit on all 587 recipes

const { Client } = require('pg');
const RecipeAuditor = require('./recipe_audit.js');
const fs = require('fs');

class AuditExecutor {
  constructor() {
    this.auditor = new RecipeAuditor();
    this.client = new Client({
      connectionString: process.env.DATABASE_URL
    });
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async getAllRecipes() {
    try {
      const query = `
        SELECT id, name, category, glycemic_index, glycemic_value, image_url, 
               ingredients, description, instructions
        FROM meals 
        ORDER BY name
      `;
      
      const result = await this.client.query(query);
      console.log(`📊 Retrieved ${result.rows.length} recipes for audit`);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching recipes:', error.message);
      throw error;
    }
  }

  async runFullAudit() {
    console.log('🔍 Starting comprehensive A-Z audit of all recipes...\n');
    
    await this.connect();
    const recipes = await this.getAllRecipes();
    
    // Track progress
    const auditResults = [];
    const progressInterval = Math.ceil(recipes.length / 10); // Update every 10%
    
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      
      if (i % progressInterval === 0) {
        const percent = Math.round((i / recipes.length) * 100);
        console.log(`📈 Progress: ${percent}% complete (${i}/${recipes.length} recipes)`);
      }
      
      try {
        const auditResult = this.auditor.auditRecipe(recipe);
        auditResults.push(auditResult);
        
        // Log critical issues immediately
        if (auditResult.severity === 'critical') {
          console.log(`🚨 CRITICAL ISSUE: ${recipe.name} - ${auditResult.overallIssues} issues`);
        }
        
      } catch (error) {
        console.error(`❌ Error auditing recipe "${recipe.name}":`, error.message);
        auditResults.push({
          id: recipe.id,
          name: recipe.name,
          error: error.message,
          severity: 'error'
        });
      }
    }
    
    console.log('\n✅ Audit completed! Generating reports...\n');
    
    // Generate comprehensive reports
    const reports = this.auditor.generateReports(auditResults);
    
    // Add detailed analysis
    reports.priorityRecipes = this.identifyPriorityRecipes(auditResults);
    reports.alphabeticalSummary = this.generateAlphabeticalSummary(auditResults);
    
    // Save results to files
    await this.saveReports(reports, auditResults);
    
    await this.client.end();
    
    return { reports, auditResults };
  }

  identifyPriorityRecipes(auditResults) {
    // Identify recipes needing immediate attention
    const critical = auditResults.filter(r => r.severity === 'critical');
    const highGI = auditResults.filter(r => r.glycemic_index === 'high');
    const mediumGI = auditResults.filter(r => r.glycemic_index === 'medium');
    const missingImages = auditResults.filter(r => 
      r.checks && r.checks.imageVerification && r.checks.imageVerification.hasIssue
    );
    
    return {
      criticalIssues: {
        count: critical.length,
        recipes: critical.map(r => ({
          name: r.name,
          issues: r.overallIssues,
          category: r.category
        }))
      },
      highGIUrgent: {
        count: highGI.length,
        recipes: highGI.map(r => ({
          name: r.name,
          glycemicValue: r.glycemic_value,
          category: r.category
        }))
      },
      mediumGINeedsWork: {
        count: mediumGI.length,
        recipes: mediumGI.slice(0, 20).map(r => ({ // Show first 20 for summary
          name: r.name,
          glycemicValue: r.glycemic_value,
          category: r.category
        }))
      },
      imageIssues: {
        count: missingImages.length,
        recipes: missingImages.map(r => ({
          name: r.name,
          issue: r.checks.imageVerification.issue,
          expectedPath: r.checks.imageVerification.expectedPath
        }))
      }
    };
  }

  generateAlphabeticalSummary(auditResults) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const summary = {};
    
    alphabet.forEach(letter => {
      const recipes = auditResults.filter(r => 
        r.name && r.name.charAt(0).toUpperCase() === letter
      );
      
      summary[letter] = {
        count: recipes.length,
        withIssues: recipes.filter(r => r.overallIssues > 0).length,
        critical: recipes.filter(r => r.severity === 'critical').length,
        high: recipes.filter(r => r.severity === 'high').length,
        medium: recipes.filter(r => r.severity === 'medium').length
      };
    });
    
    return summary;
  }

  async saveReports(reports, auditResults) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = 'scripts/audit_reports';
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Save individual reports
    const reportFiles = [
      {
        name: 'missing_images_report.json',
        content: reports.missingImages
      },
      {
        name: 'ingredient_mismatch_report.json',
        content: reports.ingredientMismatches
      },
      {
        name: 'gi_optimization_report.json',
        content: reports.giOptimization
      },
      {
        name: 'instruction_quality_report.json',
        content: reports.instructionQuality
      },
      {
        name: 'summary_statistics.json',
        content: reports.summary
      },
      {
        name: 'priority_recipes.json',
        content: reports.priorityRecipes
      },
      {
        name: 'alphabetical_summary.json',
        content: reports.alphabeticalSummary
      },
      {
        name: 'full_audit_results.json',
        content: auditResults
      }
    ];
    
    for (const file of reportFiles) {
      const filePath = `${reportDir}/${timestamp}_${file.name}`;
      fs.writeFileSync(filePath, JSON.stringify(file.content, null, 2));
      console.log(`📄 Saved: ${filePath}`);
    }
    
    // Generate human-readable summary
    const summaryText = this.generateHumanReadableSummary(reports);
    const summaryPath = `${reportDir}/${timestamp}_audit_summary.txt`;
    fs.writeFileSync(summaryPath, summaryText);
    console.log(`📋 Saved human-readable summary: ${summaryPath}`);
  }

  generateHumanReadableSummary(reports) {
    const summary = reports.summary;
    const priority = reports.priorityRecipes;
    
    return `
🔍 GLYCOGUIDE RECIPE AUDIT SUMMARY
=====================================
Audit Date: ${new Date().toLocaleString()}
Total Recipes Audited: ${summary.totalRecipes}

📊 OVERALL HEALTH
- Recipes with Issues: ${summary.recipesWithIssues} (${summary.percentageWithIssues}%)
- Recipes without Issues: ${summary.totalRecipes - summary.recipesWithIssues}

🚨 SEVERITY BREAKDOWN
- Critical Issues: ${summary.severityBreakdown.critical} recipes
- High Priority: ${summary.severityBreakdown.high} recipes  
- Medium Priority: ${summary.severityBreakdown.medium} recipes
- Low/No Issues: ${summary.severityBreakdown.low} recipes

🔍 ISSUE CATEGORIES
- Image Problems: ${summary.checkBreakdown.imageIssues} recipes
- Ingredient Issues: ${summary.checkBreakdown.ingredientIssues} recipes
- Description Issues: ${summary.checkBreakdown.descriptionIssues} recipes
- Instruction Issues: ${summary.checkBreakdown.instructionIssues} recipes
- GI Optimization Needed: ${summary.checkBreakdown.giOptimizationNeeded} recipes

🎯 PRIORITY ACTIONS REQUIRED

1. HIGH GI RECIPES (URGENT):
   ${priority.highGIUrgent.count} recipes need immediate optimization
   ${priority.highGIUrgent.recipes.map(r => `   - ${r.name} (GI: ${r.glycemicValue})`).join('\n')}

2. MEDIUM GI RECIPES:
   ${priority.mediumGINeedsWork.count} recipes should be optimized to low GI
   (Showing first 20)
   ${priority.mediumGINeedsWork.recipes.map(r => `   - ${r.name} (GI: ${r.glycemicValue})`).join('\n')}

3. IMAGE ISSUES:
   ${priority.imageIssues.count} recipes with missing/broken images
   ${priority.imageIssues.recipes.slice(0, 10).map(r => `   - ${r.name}: ${r.issue}`).join('\n')}
   ${priority.imageIssues.count > 10 ? `   ... and ${priority.imageIssues.count - 10} more` : ''}

4. CRITICAL QUALITY ISSUES:
   ${priority.criticalIssues.count} recipes with critical problems requiring immediate attention
   ${priority.criticalIssues.recipes.map(r => `   - ${r.name} (${r.issues} issues)`).join('\n')}

📈 RECOMMENDATIONS
1. Immediately address all ${priority.highGIUrgent.count} high GI recipes
2. Fix ${priority.imageIssues.count} broken image paths
3. Review ${priority.criticalIssues.count} recipes with critical issues
4. Systematically optimize ${priority.mediumGINeedsWork.count} medium GI recipes
5. Implement quality control process for new recipe additions

💡 SUCCESS METRICS
- ${summary.totalRecipes - summary.recipesWithIssues} recipes are already high quality
- ${((summary.totalRecipes - summary.recipesWithIssues) / summary.totalRecipes * 100).toFixed(1)}% of recipes meet quality standards
- Strong foundation with room for targeted improvements
`;
  }
}

// Execute if run directly
if (require.main === module) {
  const executor = new AuditExecutor();
  
  executor.runFullAudit()
    .then(({ reports, auditResults }) => {
      console.log('\n🎉 AUDIT COMPLETED SUCCESSFULLY!');
      console.log(`📊 ${reports.summary.totalRecipes} recipes audited`);
      console.log(`🚨 ${reports.summary.recipesWithIssues} recipes need attention`);
      console.log(`📁 Reports saved to scripts/audit_reports/`);
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = AuditExecutor;