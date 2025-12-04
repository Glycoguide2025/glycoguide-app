import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Run audit on just the Trinidad Callaloo recipes
async function auditCallalooRecipes() {
  try {
    const query = `
      SELECT id, name, description, category, image_url, 
             ingredients, instructions, carbohydrates, 
             calories, protein, fat, fiber
      FROM meals 
      WHERE name ILIKE '%callaloo%'
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    const recipes = result.rows;
    
    console.log("🔍 Trinidad Callaloo Clinical Standards Analysis");
    console.log("================================================");
    
    for (const recipe of recipes) {
      console.log(`\n📋 ${recipe.name.toUpperCase()} (${recipe.category})`);
      console.log("=====================================");
      
      // Check 1: No emojis
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const textToCheck = [recipe.name, recipe.description, recipe.instructions, ...recipe.ingredients].join(" ");
      const emojiMatches = textToCheck.match(emojiRegex);
      console.log(`${!emojiMatches ? "✅" : "❌"} No Emojis: ${!emojiMatches ? "PASS" : "FAIL - Found: " + emojiMatches.join(", ")}`);
      
      // Check 2: Professional headers (no marketing phrases)
      const marketingPhrases = [/amazing/i, /incredible/i, /fantastic/i, /awesome/i, /delicious/i, /perfect/i, /ultimate/i, /best/i];
      const headerText = recipe.name + " " + recipe.description;
      const violations = marketingPhrases.filter(phrase => phrase.test(headerText));
      console.log(`${violations.length === 0 ? "✅" : "❌"} Professional Headers: ${violations.length === 0 ? "PASS" : "FAIL - Found: " + violations.map(v => v.source).join(", ")}`);
      
      // Check 3: Benefits ≤4 bullets
      const benefitBullets = (recipe.description.match(/[•\\*-]/g) || []).length;
      console.log(`${benefitBullets <= 4 ? "✅" : "❌"} Benefits ≤4 Bullets: ${benefitBullets <= 4 ? "PASS" : "FAIL"} (${benefitBullets} bullets)`);
      
      // Check 4: Medical disclaimer
      const disclaimerKeywords = ["consult", "healthcare", "medical advice", "physician", "doctor"];
      const hasDisclaimer = disclaimerKeywords.some(keyword => textToCheck.toLowerCase().includes(keyword));
      console.log(`${hasDisclaimer ? "✅" : "❌"} Medical Disclaimer: ${hasDisclaimer ? "PASS" : "FAIL"}`);
      
      // Check 5: Numbered instructions with temps/times
      const numberedSteps = (recipe.instructions.match(/^\\d+\\./gm) || []).length;
      const tempTimePatterns = [/\\d+°[CF]/g, /\\d+\\s*degrees?/gi, /\\d+\\s*minutes?/gi, /medium heat/gi, /high heat/gi];
      const hasSpecifics = tempTimePatterns.some(pattern => pattern.test(recipe.instructions));
      console.log(`${numberedSteps >= 3 && hasSpecifics ? "✅" : "❌"} Numbered Instructions: ${numberedSteps >= 3 && hasSpecifics ? "PASS" : "FAIL"} (${numberedSteps} steps, temps/times: ${hasSpecifics})`);
      
      // Check 6: Valid image paths
      const hasValidPath = recipe.image_url && recipe.image_url.startsWith("@assets/");
      console.log(`${hasValidPath ? "✅" : "❌"} Valid Image Path: ${hasValidPath ? "PASS" : "FAIL"} (${recipe.image_url})`);
      
      const overallPass = !emojiMatches && violations.length === 0 && benefitBullets <= 4 && hasDisclaimer && numberedSteps >= 3 && hasSpecifics && hasValidPath;
      console.log(`\n📊 Overall Status: ${overallPass ? "✅ COMPLIANT" : "❌ NEEDS WORK"}`);
    }
    
    console.log("\n🔍 DUPLICATE ANALYSIS");
    console.log("=====================");
    console.log(`Found ${recipes.length} Callaloo recipes:`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.category})`);
    });
    
    if (recipes.length > 1) {
      console.log("\n📝 RECOMMENDATION: Review for potential consolidation.");
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

auditCallalooRecipes();
