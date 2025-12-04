// GlycoGuide Recipe Audit Script
// Systematic A-Z audit of all 587 recipes for quality assurance

const fs = require('fs');
const path = require('path');

class RecipeAuditor {
  constructor() {
    this.auditResults = {
      missingImages: [],
      ingredientMismatches: [],
      descriptionIssues: [],
      instructionIssues: [],
      giOptimizationNeeded: [],
      highPriorityIssues: []
    };
    
    this.availableImages = new Set();
    this.loadAvailableImages();
  }

  loadAvailableImages() {
    try {
      const imageDir = path.join(__dirname, '../attached_assets/generated_images');
      const files = fs.readdirSync(imageDir);
      files.forEach(file => {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
          this.availableImages.add(file);
        }
      });
      console.log(`Loaded ${this.availableImages.size} available images for validation`);
    } catch (error) {
      console.error('Error loading available images:', error.message);
    }
  }

  // 1. Image Verification
  verifyImage(recipe) {
    if (!recipe.image_url || recipe.image_url.trim() === '') {
      return {
        hasIssue: true,
        issue: 'Missing image URL',
        severity: 'high'
      };
    }

    // Extract filename from URL
    const urlParts = recipe.image_url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (!this.availableImages.has(filename)) {
      return {
        hasIssue: true,
        issue: `Image file not found: ${filename}`,
        severity: 'high',
        expectedPath: recipe.image_url
      };
    }

    return { hasIssue: false };
  }

  // 2. Ingredient Consistency Check
  verifyIngredientConsistency(recipe) {
    const issues = [];
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return {
        hasIssue: true,
        issue: 'No ingredients listed',
        severity: 'critical'
      };
    }

    // Check if ingredients count makes sense for the recipe type
    const minIngredients = {
      'snack': 3,
      'breakfast': 4,
      'lunch': 5,
      'dinner': 6,
      'soup': 4,
      'pizza': 8,
      'dessert': 4,
      'beverage': 2
    };

    const expectedMin = minIngredients[recipe.category] || 4;
    if (recipe.ingredients.length < expectedMin) {
      issues.push(`Low ingredient count: ${recipe.ingredients.length} (expected at least ${expectedMin} for ${recipe.category})`);
    }

    // Check for basic nutritional balance in ingredients
    const hasProtein = recipe.ingredients.some(ing => 
      /chicken|fish|beef|pork|tofu|eggs|beans|lentils|nuts|seeds|cheese|yogurt/i.test(ing)
    );
    const hasVegetables = recipe.ingredients.some(ing => 
      /spinach|broccoli|cauliflower|lettuce|tomato|pepper|onion|garlic|cucumber|carrot|zucchini/i.test(ing)
    );
    
    if (!hasProtein && recipe.category !== 'beverage') {
      issues.push('Missing protein source for balanced nutrition');
    }
    if (!hasVegetables && ['lunch', 'dinner'].includes(recipe.category)) {
      issues.push('Missing vegetables for nutritional completeness');
    }

    return {
      hasIssue: issues.length > 0,
      issues: issues,
      severity: issues.length > 2 ? 'high' : 'medium'
    };
  }

  // 3. Description Quality Assessment
  assessDescriptionQuality(recipe) {
    const issues = [];
    
    if (!recipe.description || recipe.description.trim().length === 0) {
      return {
        hasIssue: true,
        issue: 'Missing description',
        severity: 'critical'
      };
    }

    const description = recipe.description.toLowerCase();
    
    // Check length - should be comprehensive but not overwhelming
    if (description.length < 100) {
      issues.push('Description too short (less than 100 characters)');
    }
    if (description.length > 500) {
      issues.push('Description too long (over 500 characters)');
    }

    // Check for diabetes-focused language
    const diabetesKeywords = ['blood sugar', 'glucose', 'diabetic', 'low glycemic', 'fiber', 'protein', 'healthy', 'balanced'];
    const hasKeywords = diabetesKeywords.some(keyword => description.includes(keyword));
    
    if (!hasKeywords) {
      issues.push('Missing diabetes-focused language or health benefits');
    }

    // Check for nutritional information
    const nutritionKeywords = ['calories', 'carbs', 'protein', 'fat', 'fiber', 'vitamins', 'minerals', 'antioxidants'];
    const hasNutrition = nutritionKeywords.some(keyword => description.includes(keyword));
    
    if (!hasNutrition) {
      issues.push('Missing nutritional benefit descriptions');
    }

    return {
      hasIssue: issues.length > 0,
      issues: issues,
      severity: issues.length > 2 ? 'high' : 'medium'
    };
  }

  // 4. Instruction Completeness Review
  reviewInstructionCompleteness(recipe) {
    const issues = [];
    
    if (!recipe.instructions || recipe.instructions.trim().length === 0) {
      return {
        hasIssue: true,
        issue: 'Missing instructions',
        severity: 'critical'
      };
    }

    const instructions = recipe.instructions.toLowerCase();
    
    // Check for numbered steps
    const hasNumberedSteps = /\d+\.|step \d+/i.test(recipe.instructions);
    if (!hasNumberedSteps) {
      issues.push('Instructions not properly numbered or structured');
    }

    // Check for cooking specifics
    const hasTemperature = /\d+°[cf]|\d+\s*degrees/i.test(recipe.instructions);
    const hasTime = /\d+\s*minutes?|\d+\s*hours?|\d+-\d+\s*min/i.test(recipe.instructions);
    
    if (['lunch', 'dinner', 'breakfast'].includes(recipe.category)) {
      if (!hasTemperature && /bake|roast|grill|cook|fry|sauté/i.test(instructions)) {
        issues.push('Missing cooking temperature for cooked dishes');
      }
      if (!hasTime) {
        issues.push('Missing cooking or preparation time');
      }
    }

    // Check instruction length and detail
    if (instructions.length < 150) {
      issues.push('Instructions too brief (less than 150 characters)');
    }

    // Check for safety instructions for cooked foods
    if (/meat|chicken|fish|pork|beef/i.test(instructions) && !/internal temperature|cooked through|until done/i.test(instructions)) {
      issues.push('Missing food safety instructions for meat/poultry');
    }

    return {
      hasIssue: issues.length > 0,
      issues: issues,
      severity: issues.length > 2 ? 'high' : 'medium'
    };
  }

  // 5. Low GI Optimization Analysis
  analyzeGIOptimization(recipe) {
    const issues = [];
    
    // Flag high and medium GI recipes
    if (recipe.glycemic_index === 'high') {
      return {
        hasIssue: true,
        issue: `HIGH PRIORITY: High GI recipe (${recipe.glycemic_value}) needs immediate optimization`,
        severity: 'critical',
        recommendations: [
          'Replace high GI ingredients with low GI alternatives',
          'Add fiber-rich ingredients to slow glucose absorption',
          'Include protein and healthy fats to balance the meal',
          'Consider portion size modifications',
          'Review cooking methods to reduce GI impact'
        ]
      };
    }

    if (recipe.glycemic_index === 'medium') {
      const recommendations = [];
      
      // Analyze ingredients for potential improvements
      const ingredients = recipe.ingredients.join(' ').toLowerCase();
      
      if (/white rice|white bread|pasta|potato/i.test(ingredients)) {
        recommendations.push('Replace refined grains with whole grain alternatives');
      }
      if (!/fiber|beans|legumes|oats|quinoa/i.test(ingredients)) {
        recommendations.push('Add high-fiber ingredients to lower GI');
      }
      if (!/protein/i.test(ingredients) && !/chicken|fish|tofu|eggs|nuts/i.test(ingredients)) {
        recommendations.push('Include protein to balance blood sugar response');
      }
      
      return {
        hasIssue: true,
        issue: `Medium GI recipe (${recipe.glycemic_value}) could be optimized to low GI`,
        severity: 'medium',
        recommendations: recommendations
      };
    }

    // Even low GI recipes can be optimized
    if (recipe.glycemic_value && recipe.glycemic_value > 35) {
      issues.push(`Low GI recipe with value ${recipe.glycemic_value} could be further optimized (target: <35)`);
    }

    return {
      hasIssue: issues.length > 0,
      issues: issues,
      severity: 'low'
    };
  }

  // Perform comprehensive audit on a single recipe
  auditRecipe(recipe) {
    const auditResults = {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      glycemic_index: recipe.glycemic_index,
      glycemic_value: recipe.glycemic_value,
      checks: {
        imageVerification: this.verifyImage(recipe),
        ingredientConsistency: this.verifyIngredientConsistency(recipe),
        descriptionQuality: this.assessDescriptionQuality(recipe),
        instructionCompleteness: this.reviewInstructionCompleteness(recipe),
        giOptimization: this.analyzeGIOptimization(recipe)
      },
      overallIssues: 0,
      severity: 'none'
    };

    // Count total issues and determine overall severity
    Object.values(auditResults.checks).forEach(check => {
      if (check.hasIssue) {
        auditResults.overallIssues++;
        if (check.severity === 'critical' && auditResults.severity !== 'critical') {
          auditResults.severity = 'critical';
        } else if (check.severity === 'high' && !['critical'].includes(auditResults.severity)) {
          auditResults.severity = 'high';
        } else if (check.severity === 'medium' && !['critical', 'high'].includes(auditResults.severity)) {
          auditResults.severity = 'medium';
        } else if (auditResults.severity === 'none') {
          auditResults.severity = check.severity;
        }
      }
    });

    return auditResults;
  }

  // Generate comprehensive reports
  generateReports(auditResults) {
    const reports = {
      missingImages: this.generateMissingImagesReport(auditResults),
      ingredientMismatches: this.generateIngredientMismatchReport(auditResults),
      giOptimization: this.generateGIOptimizationReport(auditResults),
      instructionQuality: this.generateInstructionQualityReport(auditResults),
      summary: this.generateSummaryReport(auditResults)
    };

    return reports;
  }

  generateMissingImagesReport(auditResults) {
    const missingImages = auditResults.filter(recipe => 
      recipe.checks.imageVerification.hasIssue
    );

    return {
      count: missingImages.length,
      percentage: ((missingImages.length / auditResults.length) * 100).toFixed(2),
      recipes: missingImages.map(recipe => ({
        name: recipe.name,
        category: recipe.category,
        issue: recipe.checks.imageVerification.issue,
        expectedPath: recipe.checks.imageVerification.expectedPath
      }))
    };
  }

  generateIngredientMismatchReport(auditResults) {
    const mismatches = auditResults.filter(recipe => 
      recipe.checks.ingredientConsistency.hasIssue
    );

    return {
      count: mismatches.length,
      percentage: ((mismatches.length / auditResults.length) * 100).toFixed(2),
      recipes: mismatches.map(recipe => ({
        name: recipe.name,
        category: recipe.category,
        issues: recipe.checks.ingredientConsistency.issues || [recipe.checks.ingredientConsistency.issue]
      }))
    };
  }

  generateGIOptimizationReport(auditResults) {
    const needsOptimization = auditResults.filter(recipe => 
      recipe.checks.giOptimization.hasIssue
    );

    const highPriority = needsOptimization.filter(recipe => 
      recipe.glycemic_index === 'high'
    );

    const mediumPriority = needsOptimization.filter(recipe => 
      recipe.glycemic_index === 'medium'
    );

    return {
      totalNeedsOptimization: needsOptimization.length,
      highPriority: {
        count: highPriority.length,
        recipes: highPriority.map(recipe => ({
          name: recipe.name,
          glycemicValue: recipe.glycemic_value,
          recommendations: recipe.checks.giOptimization.recommendations
        }))
      },
      mediumPriority: {
        count: mediumPriority.length,
        recipes: mediumPriority.map(recipe => ({
          name: recipe.name,
          glycemicValue: recipe.glycemic_value,
          recommendations: recipe.checks.giOptimization.recommendations
        }))
      }
    };
  }

  generateInstructionQualityReport(auditResults) {
    const instructionIssues = auditResults.filter(recipe => 
      recipe.checks.instructionCompleteness.hasIssue
    );

    return {
      count: instructionIssues.length,
      percentage: ((instructionIssues.length / auditResults.length) * 100).toFixed(2),
      recipes: instructionIssues.map(recipe => ({
        name: recipe.name,
        category: recipe.category,
        issues: recipe.checks.instructionCompleteness.issues || [recipe.checks.instructionCompleteness.issue]
      }))
    };
  }

  generateSummaryReport(auditResults) {
    const totalRecipes = auditResults.length;
    const recipesWithIssues = auditResults.filter(recipe => recipe.overallIssues > 0).length;
    const criticalIssues = auditResults.filter(recipe => recipe.severity === 'critical').length;
    const highIssues = auditResults.filter(recipe => recipe.severity === 'high').length;
    const mediumIssues = auditResults.filter(recipe => recipe.severity === 'medium').length;

    return {
      totalRecipes,
      recipesWithIssues,
      percentageWithIssues: ((recipesWithIssues / totalRecipes) * 100).toFixed(2),
      severityBreakdown: {
        critical: criticalIssues,
        high: highIssues,
        medium: mediumIssues,
        low: totalRecipes - criticalIssues - highIssues - mediumIssues
      },
      checkBreakdown: {
        imageIssues: auditResults.filter(r => r.checks.imageVerification.hasIssue).length,
        ingredientIssues: auditResults.filter(r => r.checks.ingredientConsistency.hasIssue).length,
        descriptionIssues: auditResults.filter(r => r.checks.descriptionQuality.hasIssue).length,
        instructionIssues: auditResults.filter(r => r.checks.instructionCompleteness.hasIssue).length,
        giOptimizationNeeded: auditResults.filter(r => r.checks.giOptimization.hasIssue).length
      }
    };
  }
}

module.exports = RecipeAuditor;