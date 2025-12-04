import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to clean and format recipe instructions
function formatInstructions(instructions: string): string {
  // Handle JSON array format first
  if (instructions.startsWith('{') && instructions.includes('","')) {
    try {
      // Extract array content from malformed JSON format
      const arrayContent = instructions.slice(1, -1); // Remove { and }
      const steps = arrayContent.split('","').map((step, index) => {
        const cleanStep = step.replace(/^"/, '').replace(/"$/, '').trim();
        return `${index + 1}. ${cleanStep}`;
      });
      return steps.join('\n');
    } catch (e) {
      console.warn('Failed to parse JSON array format, falling back to paragraph processing');
    }
  }

  // Handle single paragraph format
  if (!instructions.includes('\n') && instructions.length > 100) {
    // Split by common sentence boundaries and cooking instruction patterns
    const splitPatterns = [
      /\.\s+/g,       // Period followed by space
      /\.\s*Then\s+/gi,    // Then transitions
      /\.\s*Next\s+/gi,    // Next transitions
      /\.\s*After\s+/gi,   // After transitions
      /\.\s*Meanwhile\s+/gi, // Meanwhile transitions
      /\.\s*While\s+/gi,   // While transitions
      /\;\s+/g,       // Semicolon followed by space
    ];

    let steps = [instructions];
    
    // Apply each split pattern
    for (const pattern of splitPatterns) {
      const newSteps: string[] = [];
      for (const step of steps) {
        newSteps.push(...step.split(pattern));
      }
      steps = newSteps;
    }

    // Clean and number the steps
    const cleanSteps = steps
      .map(step => step.trim())
      .filter(step => step.length > 10) // Remove very short fragments
      .map(step => {
        // Preserve critical parenthetical information (temperatures, times, clinical notes)
        const criticalPatterns = /\([^)]*(?:°F|°C|\d+°|minutes?|mins?|hours?|hrs?|sugar-free|low-glycemic|optional|internal temp|until tender|al dente)\)/gi;
        const criticalParenheticals = step.match(criticalPatterns) || [];
        
        // Remove non-critical parenthetical explanations but preserve critical ones
        step = step.replace(/\s*\([^)]*\)/g, (match) => {
          return criticalPatterns.test(match) ? match : '';
        });
        
        // Ensure step starts with capital letter
        if (step.length > 0) {
          step = step.charAt(0).toUpperCase() + step.slice(1);
        }
        // Ensure step ends with period
        if (step.length > 0 && !step.endsWith('.')) {
          step += '.';
        }
        return step;
      })
      .filter(step => step.length > 5); // Final filter for meaningful steps

    // Limit to 6-12 steps as recommended
    if (cleanSteps.length > 12) {
      // Merge shorter steps or take the most important ones
      cleanSteps.splice(12);
    }
    
    if (cleanSteps.length < 6 && cleanSteps.length > 0) {
      // If too few steps, try to be more liberal with splitting
      const moreSteps = instructions.split(/[.;,]\s+/).filter(s => s.trim().length > 5);
      if (moreSteps.length >= 6) {
        return moreSteps.slice(0, 12).map((step, index) => {
          const cleanStep = step.trim().replace(/\s*\([^)]*\)/g, '');
          return `${index + 1}. ${cleanStep.charAt(0).toUpperCase() + cleanStep.slice(1)}.`;
        }).join('\n');
      }
    }

    return cleanSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  }

  // If already formatted or very short, return as is
  return instructions;
}

async function fixRecipeFormatting() {
  console.log('Starting recipe formatting script...');
  
  try {
    // Get all A-C recipes that need fixing
    const query = `
      SELECT id, name, instructions, LENGTH(instructions) as char_length
      FROM meals 
      WHERE name ~ '^[A-C]' 
      AND (
        (LENGTH(instructions) - LENGTH(REPLACE(instructions, E'\\n', ''))) + 1 = 1
        AND LENGTH(instructions) > 100
      )
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} recipes to fix`);
    
    // Process each recipe
    let updateCount = 0;
    const updates: Array<{id: string, name: string, oldLength: number, newInstructions: string}> = [];
    
    for (const row of result.rows) {
      const { id, name, instructions, char_length } = row;
      console.log(`Processing: ${name} (${char_length} chars)`);
      
      const newInstructions = formatInstructions(instructions);
      const newStepCount = (newInstructions.match(/\n/g) || []).length + 1;
      
      if (newInstructions !== instructions && newStepCount >= 6 && newStepCount <= 12) {
        updates.push({
          id,
          name,
          oldLength: char_length,
          newInstructions
        });
        updateCount++;
      } else {
        console.log(`  Skipped ${name} - formatting didn't improve or step count out of range`);
      }
    }
    
    console.log(`\nReady to update ${updateCount} recipes. Preview of changes:`);
    updates.slice(0, 3).forEach(update => {
      console.log(`\n${update.name}:`);
      console.log(`  Steps: ${(update.newInstructions.match(/\n/g) || []).length + 1}`);
      console.log(`  Preview: ${update.newInstructions.substring(0, 100)}...`);
    });
    
    // Apply the updates
    console.log('\nApplying updates...');
    for (const update of updates) {
      await pool.query(
        'UPDATE meals SET instructions = $1 WHERE id = $2',
        [update.newInstructions, update.id]
      );
      console.log(`  Updated: ${update.name}`);
    }
    
    console.log(`\nScript completed. ${updateCount} recipes ready for update.`);
    console.log('Uncomment the update section in the script to apply changes.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
fixRecipeFormatting().catch(console.error);