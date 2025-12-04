import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  ingredients: string[];
  instructions: string;
  carbohydrates: number;
  calories: number;
  protein: number;
  fat: number;
  fiber: number;
}

interface StandardCheck {
  name: string;
  passed: boolean;
  details: string;
}

interface RecipeAudit {
  id: string;
  name: string;
  category: string;
  overallPassed: boolean;
  checks: StandardCheck[];
}

interface CategorySummary {
  total: number;
  passed: number;
  failed: number;
}

interface AuditReport {
  timestamp: string;
  totalRecipes: number;
  passedRecipes: number;
  failedRecipes: number;
  summary: Record<string, CategorySummary>;
  auditResults: RecipeAudit[];
  detailedFailures: string[];
}

// Standard 1: No emojis anywhere in content
function checkNoEmojis(recipe: Recipe): StandardCheck {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  
  const textToCheck = [
    recipe.name,
    recipe.description,
    recipe.instructions,
    ...recipe.ingredients
  ].join(' ');
  
  const emojiMatches = textToCheck.match(emojiRegex);
  
  return {
    name: "No Emojis",
    passed: !emojiMatches,
    details: emojiMatches ? `Found emojis: ${emojiMatches.join(', ')}` : "No emojis found"
  };
}

// Standard 2: Professional clinical headers (no marketing phrases)
function checkProfessionalHeaders(recipe: Recipe): StandardCheck {
  const marketingPhrases = [
    /amazing/i, /incredible/i, /fantastic/i, /awesome/i, /delicious/i,
    /yummy/i, /scrumptious/i, /mouth-watering/i, /heavenly/i, /divine/i,
    /perfect/i, /ultimate/i, /best/i, /wonderful/i, /superb/i,
    /exceptional/i, /outstanding/i, /magnificent/i, /spectacular/i,
    /irresistible/i, /crave/i, /indulgent/i, /treat yourself/i,
    /guilty pleasure/i, /comfort food/i
  ];
  
  const textToCheck = recipe.name + ' ' + recipe.description;
  const violations = marketingPhrases.filter(phrase => phrase.test(textToCheck));
  
  return {
    name: "Professional Headers",
    passed: violations.length === 0,
    details: violations.length > 0 
      ? `Found marketing phrases: ${violations.map(v => v.source).join(', ')}` 
      : "No marketing phrases found"
  };
}

// Standard 3: Benefits sections ≤4 bullets maximum
function checkBenefitsLength(recipe: Recipe): StandardCheck {
  const description = recipe.description || '';
  
  // Look for benefits sections (bullet points, numbered lists, or "benefits:" sections)
  const benefitPatterns = [
    /benefits?:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i,
    /•[\s\S]*?(?=\n\n|\n[^•]|$)/g,
    /\*[\s\S]*?(?=\n\n|\n[^\*]|$)/g,
    /-[\s\S]*?(?=\n\n|\n[^-]|$)/g
  ];
  
  let maxBullets = 0;
  let foundPattern = '';
  
  for (const pattern of benefitPatterns) {
    const matches = description.match(pattern);
    if (matches) {
      for (const match of matches) {
        const bulletCount = (match.match(/[•\*-]/g) || []).length;
        if (bulletCount > maxBullets) {
          maxBullets = bulletCount;
          foundPattern = match.substring(0, 100) + '...';
        }
      }
    }
  }
  
  return {
    name: "Benefits ≤4 Bullets",
    passed: maxBullets <= 4,
    details: maxBullets > 4 
      ? `Found ${maxBullets} bullets, exceeds limit of 4. Sample: ${foundPattern}`
      : maxBullets > 0 
      ? `Found ${maxBullets} bullets, within limit`
      : "No bullet points found"
  };
}

// Standard 4: Medical disclaimer present and standardized
function checkMedicalDisclaimer(recipe: Recipe): StandardCheck {
  const description = recipe.description || '';
  const instructions = recipe.instructions || '';
  const textToCheck = (description + ' ' + instructions).toLowerCase();
  
  const disclaimerKeywords = [
    'consult',
    'healthcare provider',
    'medical advice',
    'physician',
    'doctor',
    'professional medical',
    'individual needs',
    'varies by person'
  ];
  
  const foundKeywords = disclaimerKeywords.filter(keyword => 
    textToCheck.includes(keyword.toLowerCase())
  );
  
  // Should have at least 2 disclaimer-related keywords for a proper disclaimer
  const hasProperDisclaimer = foundKeywords.length >= 2;
  
  return {
    name: "Medical Disclaimer",
    passed: hasProperDisclaimer,
    details: hasProperDisclaimer 
      ? `Found disclaimer keywords: ${foundKeywords.join(', ')}`
      : foundKeywords.length > 0
      ? `Partial disclaimer found: ${foundKeywords.join(', ')} - needs more comprehensive disclaimer`
      : "No medical disclaimer found"
  };
}

// Standard 5: Numbered instructions with specific temps/times
function checkNumberedInstructions(recipe: Recipe): StandardCheck {
  const instructions = recipe.instructions || '';
  
  // Check for numbered format
  const numberedSteps = instructions.match(/^\d+\./gm) || [];
  const hasNumberedFormat = numberedSteps.length >= 3;
  
  // Check for specific temperatures and times
  const tempTimePatterns = [
    /\d+°[CF]/g,                    // Temperature: 350°F, 180°C
    /\d+\s*degrees?/gi,             // degrees
    /\d+\s*minutes?/gi,             // minutes
    /\d+\s*hours?/gi,               // hours
    /\d+\s*seconds?/gi,             // seconds
    /medium heat/gi,                // heat levels
    /high heat/gi,
    /low heat/gi,
    /until golden/gi,               // visual cues
    /until tender/gi,
    /until cooked through/gi
  ];
  
  const foundTempTime = tempTimePatterns.filter(pattern => 
    pattern.test(instructions)
  );
  
  const hasSpecificDetails = foundTempTime.length >= 2;
  
  const passed = hasNumberedFormat && hasSpecificDetails;
  
  return {
    name: "Numbered Instructions with Temps/Times",
    passed,
    details: `Numbered steps: ${numberedSteps.length}, Temp/time details: ${foundTempTime.length} patterns found. ${
      !hasNumberedFormat ? 'Missing numbered format. ' : ''
    }${!hasSpecificDetails ? 'Missing specific temperatures/times.' : ''}`
  };
}

// Standard 6: Image URLs pointing to valid @assets paths
function checkImagePaths(recipe: Recipe): StandardCheck {
  const imageUrl = recipe.image_url || '';
  
  if (!imageUrl) {
    return {
      name: "Valid Image Paths",
      passed: false,
      details: "No image URL provided"
    };
  }
  
  // Check if it follows the @assets pattern
  const hasCorrectPrefix = imageUrl.startsWith('@assets/') || 
                          imageUrl.startsWith('attached_assets/');
  
  if (!hasCorrectPrefix) {
    return {
      name: "Valid Image Paths",
      passed: false,
      details: `Image URL "${imageUrl}" does not use @assets/ prefix`
    };
  }
  
  // Convert to file system path and check if file exists
  let filePath = imageUrl;
  if (imageUrl.startsWith('@assets/')) {
    filePath = imageUrl.replace('@assets/', 'attached_assets/');
  }
  
  const fullPath = path.join(process.cwd(), filePath);
  const fileExists = fs.existsSync(fullPath);
  
  return {
    name: "Valid Image Paths",
    passed: hasCorrectPrefix && fileExists,
    details: fileExists 
      ? `Image file exists at ${filePath}`
      : `Image file missing: ${filePath}`
  };
}

// Function to audit a single recipe
function auditRecipe(recipe: Recipe): RecipeAudit {
  const checks = [
    checkNoEmojis(recipe),
    checkProfessionalHeaders(recipe),
    checkBenefitsLength(recipe),
    checkMedicalDisclaimer(recipe),
    checkNumberedInstructions(recipe),
    checkImagePaths(recipe)
  ];
  
  const overallPassed = checks.every(check => check.passed);
  
  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    overallPassed,
    checks
  };
}

// Function to generate CSV report
function generateCSVReport(report: AuditReport): string {
  const header = 'Recipe ID,Recipe Name,Category,Overall Status,No Emojis,Professional Headers,Benefits ≤4 Bullets,Medical Disclaimer,Numbered Instructions,Valid Image Paths,Failure Details\n';
  
  const rows = report.auditResults.map(audit => {
    const status = audit.overallPassed ? 'PASS' : 'FAIL';
    const checkResults = audit.checks.map(check => check.passed ? 'PASS' : 'FAIL');
    const failureDetails = audit.checks
      .filter(check => !check.passed)
      .map(check => `${check.name}: ${check.details}`)
      .join('; ');
    
    return `"${audit.id}","${audit.name}","${audit.category}","${status}",${checkResults.join(',')},"${failureDetails}"`;
  });
  
  return header + rows.join('\n');
}

// Function to generate JSON report
function generateJSONReport(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

// Main verification function
async function verifyAllRecipes(): Promise<void> {
  console.log('🔍 Starting Recipe Clinical Standards Verification...\n');
  
  try {
    // Load all recipes from all categories  
    const query = `
      SELECT id, name, description, category, image_url, 
             ingredients, instructions, carbohydrates, 
             calories, protein, fat, fiber
      FROM meals 
      ORDER BY category, name
    `;
    
    const result = await pool.query(query);
    const recipes: Recipe[] = result.rows;
    
    // Get category counts
    const categoryCounts: Record<string, number> = {};
    recipes.forEach(recipe => {
      categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
    });
    
    console.log(`📊 Found ${recipes.length} recipes to audit across ${Object.keys(categoryCounts).length} categories:`);
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} recipes`);
    });
    console.log('');
    
    // Audit each recipe
    console.log('🔬 Auditing recipes against clinical standards...\n');
    
    const auditResults: RecipeAudit[] = [];
    const detailedFailures: string[] = [];
    
    for (const recipe of recipes) {
      const audit = auditRecipe(recipe);
      auditResults.push(audit);
      
      // Log progress
      const status = audit.overallPassed ? '✅' : '❌';
      console.log(`${status} ${recipe.category.toUpperCase()}: ${recipe.name}`);
      
      if (!audit.overallPassed) {
        const failures = audit.checks
          .filter(check => !check.passed)
          .map(check => `  • ${check.name}: ${check.details}`);
        
        detailedFailures.push(`${recipe.name}:\n${failures.join('\n')}`);
        
        // Log failures immediately for debugging
        console.log(`   Failed checks:`);
        failures.forEach(failure => console.log(`   ${failure}`));
      }
      
      console.log(''); // spacing
    }
    
    // Generate dynamic summary for all categories
    const summary: Record<string, CategorySummary> = {};
    Object.keys(categoryCounts).forEach(category => {
      const categoryResults = auditResults.filter(r => r.category === category);
      summary[category] = {
        total: categoryResults.length,
        passed: categoryResults.filter(r => r.overallPassed).length,
        failed: categoryResults.filter(r => !r.overallPassed).length
      };
    });
    
    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      totalRecipes: recipes.length,
      passedRecipes: auditResults.filter(r => r.overallPassed).length,
      failedRecipes: auditResults.filter(r => !r.overallPassed).length,
      summary,
      auditResults,
      detailedFailures
    };
    
    // Print summary
    console.log('📋 AUDIT SUMMARY');
    console.log('================');
    console.log(`Total Recipes: ${report.totalRecipes}`);
    console.log(`✅ Passed: ${report.passedRecipes}`);
    console.log(`❌ Failed: ${report.failedRecipes}`);
    console.log('');
    console.log('By Category:');
    Object.entries(report.summary).forEach(([category, stats]) => {
      console.log(`  ${category}: ${stats.passed}/${stats.total} passed`);
    });
    console.log('');
    
    // Generate and save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save CSV report
    const csvReport = generateCSVReport(report);
    const csvPath = `scripts/recipe_audit_${timestamp}.csv`;
    fs.writeFileSync(csvPath, csvReport);
    console.log(`📄 CSV report saved: ${csvPath}`);
    
    // Save JSON report  
    const jsonReport = generateJSONReport(report);
    const jsonPath = `scripts/recipe_audit_${timestamp}.json`;
    fs.writeFileSync(jsonPath, jsonReport);
    console.log(`📄 JSON report saved: ${jsonPath}`);
    
    // Print standard-by-standard summary
    console.log('\n📊 STANDARDS COMPLIANCE SUMMARY');
    console.log('================================');
    
    const standardNames = [
      "No Emojis",
      "Professional Headers", 
      "Benefits ≤4 Bullets",
      "Medical Disclaimer",
      "Numbered Instructions with Temps/Times",
      "Valid Image Paths"
    ];
    
    standardNames.forEach((standardName, index) => {
      const passed = auditResults.filter(r => r.checks[index].passed).length;
      const failed = auditResults.length - passed;
      const percentage = ((passed / auditResults.length) * 100).toFixed(1);
      console.log(`${standardName}: ${passed}/${auditResults.length} (${percentage}%) passed`);
    });
    
    // Exit with error if any recipe failed
    if (report.failedRecipes > 0) {
      console.log('\n❌ VERIFICATION FAILED');
      console.log(`${report.failedRecipes} recipes do not meet clinical standards.`);
      console.log('\nDetailed failures:');
      detailedFailures.forEach(failure => {
        console.log('\n' + failure);
      });
      process.exit(1);
    } else {
      console.log('\n✅ VERIFICATION PASSED');
      console.log(`All ${report.totalRecipes} recipes meet clinical standards requirements.`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the verification
verifyAllRecipes().catch(console.error);