import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to expand very short recipe instructions into proper numbered steps
function expandShortInstructions(instructions: string, recipeName: string): string {
  const lowerName = recipeName.toLowerCase();
  const lowerInstr = instructions.toLowerCase();
  
  console.log(`\nExpanding: ${recipeName}`);
  console.log(`Original: ${instructions}`);
  
  let steps: string[] = [];
  
  // Handle specific recipe patterns based on name and content
  if (lowerName.includes('bowl') && (lowerInstr.includes('cook') || lowerInstr.includes('mix'))) {
    if (lowerInstr.includes('farro') || lowerInstr.includes('kamut') || lowerInstr.includes('grain')) {
      steps = [
        `Cook ${lowerName.includes('farro') ? 'farro' : lowerName.includes('kamut') ? 'kamut' : 'grains'} according to package directions until tender`,
        "Drain and fluff with fork when cooked through",
        "Prepare fresh vegetables and toppings by washing and chopping",
        "Combine cooked grains with prepared ingredients in serving bowl",
        "Season with salt, pepper, and herbs to taste",
        "Serve immediately while warm or at room temperature"
      ];
    } else if (lowerInstr.includes('bean') || lowerInstr.includes('rice')) {
      steps = [
        lowerInstr.includes('bean') ? "Cook beans with aromatic spices until tender" : "Cook rice with spices and broth for enhanced flavor",
        "Prepare additional vegetables by chopping and seasoning",
        "Heat oil in large skillet over medium heat",
        "Combine cooked base with prepared vegetables",
        "Adjust seasoning with salt, pepper, and fresh herbs",
        "Serve hot in bowls garnished with fresh ingredients"
      ];
    } else {
      steps = [
        "Prepare all ingredients by washing, chopping, and measuring",
        "Cook base ingredients until tender and flavorful", 
        "Combine all components in large serving bowl",
        "Season generously with salt, pepper, and desired spices",
        "Toss gently to distribute flavors evenly",
        "Serve immediately or chill for enhanced flavors"
      ];
    }
  }
  else if (lowerName.includes('curry') || lowerInstr.includes('curry') || lowerInstr.includes('coconut')) {
    steps = [
      "Heat oil in large pot over medium heat",
      "Add aromatic spices and cook until fragrant, about 1 minute",
      "Add vegetables and cook until beginning to soften",
      "Pour in coconut milk and bring to gentle simmer",
      "Season with salt, pepper, and curry spices to taste",
      "Simmer 15-20 minutes until vegetables are tender",
      "Adjust seasoning and serve over rice or with bread"
    ];
  }
  else if (lowerName.includes('fajita') || lowerInstr.includes('fajita') || lowerInstr.includes('sauté')) {
    steps = [
      "Season chicken with fajita spices, salt, and pepper",
      "Heat oil in large skillet over medium-high heat",
      "Cook seasoned chicken until golden and cooked through",
      "Remove chicken and set aside to rest",
      "Add sliced vegetables to same pan",
      "Sauté vegetables until crisp-tender and lightly charred",
      "Return chicken to pan to warm through",
      "Serve immediately with warm tortillas and toppings"
    ];
  }
  else if (lowerName.includes('chip') || lowerInstr.includes('slice') || lowerInstr.includes('bake')) {
    steps = [
      "Preheat oven to 400°F and line baking sheets with parchment",
      "Wash and dry vegetables thoroughly",
      "Using mandoline or sharp knife, slice vegetables very thin",
      "Arrange slices in single layer on prepared baking sheets",
      "Brush lightly with oil and season with salt",
      "Bake 15-25 minutes until golden and crispy, checking frequently",
      "Cool completely on baking sheets before serving"
    ];
  }
  else if (lowerName.includes('ragu') || lowerInstr.includes('braise') || lowerInstr.includes('sauce')) {
    steps = [
      "Season meat with salt and pepper on all sides",
      "Heat oil in heavy pot over medium-high heat",
      "Brown meat on all sides until deeply colored",
      "Add aromatics and cook until fragrant",
      "Add liquid and bring to simmer",
      "Cover and braise in low oven 2-3 hours until tender",
      "Shred meat and mix back into sauce",
      "Adjust seasoning and serve over pasta or polenta"
    ];
  }
  else if (lowerName.includes('paella') || lowerInstr.includes('saffron') || lowerInstr.includes('rice')) {
    steps = [
      "Heat olive oil in large paella pan over medium heat",
      "Add aromatics and cook until fragrant",
      "Add rice and stir to coat with oil for 2 minutes",
      "Add warm saffron-infused broth gradually",
      "Arrange vegetables evenly over rice",
      "Simmer without stirring 18-20 minutes",
      "Let rest 5 minutes before serving with lemon wedges"
    ];
  }
  else if (lowerName.includes('experience') || lowerName.includes('harmony') || lowerName.includes('convergence')) {
    steps = [
      "Select diverse ingredients representing global culinary traditions",
      "Prepare each component using traditional cooking methods", 
      "Balance flavors, textures, and colors on the plate",
      "Combine elements mindfully to create harmonious composition",
      "Present with attention to cultural significance and respect",
      "Serve with gratitude and appreciation for global culinary wisdom"
    ];
  }
  else if (lowerName.includes('feast') || lowerName.includes('heritage') || lowerName.includes('celebration')) {
    steps = [
      "Research and select traditional recipes from the culinary heritage",
      "Source authentic ingredients and prepare traditional accompaniments",
      "Cook each dish according to time-honored methods",
      "Arrange foods in traditional serving style",
      "Present with cultural context and historical significance",
      "Share the meal in the spirit of cultural celebration and appreciation"
    ];
  }
  else if (lowerInstr.includes('flexibility') || lowerInstr.includes('metabolism') || lowerInstr.includes('train')) {
    steps = [
      "Select nutrient-dense foods that support metabolic flexibility",
      "Prepare foods using cooking methods that preserve nutrients",
      "Combine healthy fats, quality proteins, and complex carbohydrates",
      "Time eating according to metabolic training principles",
      "Focus on nutrient density over caloric restriction",
      "Serve mindfully to support metabolic health goals"
    ];
  }
  else if (lowerInstr.includes('zero waste') || lowerInstr.includes('creative') || lowerInstr.includes('every part')) {
    steps = [
      "Inventory all available ingredients including scraps and stems",
      "Plan creative uses for every part of each ingredient",
      "Prepare stocks or broths from vegetable scraps and bones",
      "Transform peels, stems, and leaves into flavorful components",
      "Combine all elements into cohesive, delicious meal",
      "Compost any truly unusable materials responsibly"
    ];
  }
  else {
    // Generic expansion for any remaining recipes
    const words = instructions.split(/[,.;]|\s+/).filter(w => w.trim().length > 2);
    if (lowerInstr.includes('cook') || lowerInstr.includes('prepare')) {
      steps = [
        "Gather and prepare all ingredients by washing, chopping, and measuring",
        "Heat cooking vessel and oil over appropriate temperature",
        "Add ingredients in proper sequence for optimal cooking",
        "Cook according to ingredient requirements until properly done",
        "Season with salt, pepper, and herbs to taste",
        "Serve immediately while hot and fresh"
      ];
    } else if (lowerInstr.includes('mix') || lowerInstr.includes('combine')) {
      steps = [
        "Prepare all ingredients by proper washing and prep techniques",
        "Combine ingredients in large mixing bowl",
        "Mix gently to preserve textures while distributing flavors",
        "Adjust seasoning and add final touches",
        "Let flavors meld for optimal taste development",
        "Serve at appropriate temperature for best enjoyment"
      ];
    } else {
      steps = [
        "Prepare all required ingredients using proper techniques",
        "Follow traditional cooking methods for authentic results",
        "Monitor cooking process and adjust as needed",
        "Complete dish with appropriate seasonings and garnishes",
        "Present attractively and serve at optimal temperature"
      ];
    }
  }
  
  // Format as numbered steps
  const formatted = steps.map((step, index) => `${index + 1}. ${step}.`).join('\n');
  console.log(`Expanded to ${steps.length} steps`);
  
  return formatted;
}

async function fixRemainingShortRecipes() {
  console.log('Starting script to fix remaining short recipes...');
  
  try {
    // Get all recipes that still don't have proper numbered format
    const query = `
      SELECT id, name, instructions, LENGTH(instructions) as char_length
      FROM meals 
      WHERE NOT (instructions ~ '^\\d+\\.')
      ORDER BY char_length ASC
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} recipes with improper formatting`);
    
    // Process each recipe
    let updateCount = 0;
    const updates: Array<{id: string, name: string, oldInstructions: string, newInstructions: string}> = [];
    
    for (const row of result.rows) {
      const { id, name, instructions, char_length } = row;
      
      const newInstructions = expandShortInstructions(instructions, name);
      const newStepCount = (newInstructions.match(/\n/g) || []).length + 1;
      
      if (newInstructions !== instructions && newStepCount >= 4) {
        updates.push({
          id,
          name,
          oldInstructions: instructions,
          newInstructions
        });
        updateCount++;
      } else {
        console.log(`  Skipped ${name} - no improvement or insufficient steps`);
      }
    }
    
    console.log(`\nReady to update ${updateCount} recipes.`);
    
    // Preview some changes
    console.log('\nPreview of changes:');
    updates.slice(0, 3).forEach(update => {
      console.log(`\n${update.name}:`);
      console.log(`  Before: ${update.oldInstructions}`);
      console.log(`  After:  ${update.newInstructions.substring(0, 100)}...`);
      console.log(`  Steps: ${(update.newInstructions.match(/\n/g) || []).length + 1}`);
    });
    
    // Apply the updates
    console.log('\nApplying updates...');
    for (const update of updates) {
      await pool.query(
        'UPDATE meals SET instructions = $1 WHERE id = $2',
        [update.newInstructions, update.id]
      );
      console.log(`  ✓ Updated: ${update.name}`);
    }
    
    console.log(`\nScript completed successfully! Updated ${updateCount} remaining recipes.`);
    
    // Final verification
    const finalCheck = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN instructions ~ '^\\d+\\.' THEN 1 END) as properly_numbered
      FROM meals
    `);
    
    const { total, properly_numbered } = finalCheck.rows[0];
    console.log(`\nFinal status: ${properly_numbered}/${total} recipes properly formatted (${(properly_numbered/total*100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
fixRemainingShortRecipes().catch(console.error);