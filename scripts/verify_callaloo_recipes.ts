import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

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
}

interface StandardCheck {
  name: string;
  passed: boolean;
  details: string;
}

// Standard checks
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

function checkProfessionalHeaders(recipe: Recipe): StandardCheck {
  const marketingPhrases = [
    /amazing/i, /incredible/i, /fantastic/i, /awesome/i, /delicious/i,
    /yummy/i, /scrumptious/i, /mouth-watering/i, /heavenly/i, /divine/i,
    /perfect/i, /ultimate/i, /best/i, /wonderful/i, /superb/i
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

function checkBenefitsLength(recipe: Recipe): StandardCheck {
  const description = recipe.description || '';
  
  // Count bullet points more precisely
  const bulletMatches = description.match(/•[\s\S]*?(?=\n•|\n\n|\n[A-Z]|$)/g) || [];
  const maxBullets = bulletMatches.length;
  
  return {
    name: "Benefits ≤4 Bullets",
    passed: maxBullets <= 4,
    details: maxBullets > 4 
      ? `Found ${maxBullets} bullets, exceeds limit of 4`
      : `Found ${maxBullets} bullets, within limit`
  };
}

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

async function verifyCallalooRecipes(): Promise<void> {
  console.log('🔍 Verifying Trinidad Callaloo Recipes Clinical Standards...\n');
  
  try {
    const query = `
      SELECT id, name, description, category, image_url, 
             ingredients, instructions
      FROM meals 
      WHERE LOWER(name) LIKE '%callaloo%'
      ORDER BY category, name
    `;
    
    const result = await pool.query(query);
    const recipes: Recipe[] = result.rows;
    
    console.log(`📊 Found ${recipes.length} Callaloo recipes to verify:\n`);
    
    let allPassed = true;
    
    for (const recipe of recipes) {
      console.log(`🧪 TESTING: ${recipe.name} (${recipe.category})`);
      console.log('═'.repeat(60));
      
      const checks = [
        checkNoEmojis(recipe),
        checkProfessionalHeaders(recipe),
        checkBenefitsLength(recipe),
        checkMedicalDisclaimer(recipe)
      ];
      
      const recipePassed = checks.every(check => check.passed);
      allPassed = allPassed && recipePassed;
      
      checks.forEach(check => {
        const status = check.passed ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${check.details}`);
      });
      
      console.log(`\n📋 OVERALL: ${recipePassed ? '✅ PASSED' : '❌ FAILED'}\n`);
    }
    
    console.log('🎯 FINAL VERIFICATION RESULT');
    console.log('═'.repeat(40));
    
    if (allPassed) {
      console.log('✅ SUCCESS: All Trinidad Callaloo recipes meet clinical standards!');
      console.log(`✨ ${recipes.length}/3 recipes are now compliant`);
      process.exit(0);
    } else {
      console.log('❌ FAILURE: Some recipes still have issues');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyCallalooRecipes().catch(console.error);