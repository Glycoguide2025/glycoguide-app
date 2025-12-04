import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Enhanced function to clean and format ALL types of recipe instructions
function formatInstructions(instructions: string, recipeName: string): string {
  console.log(`\nProcessing: ${recipeName}`);
  console.log(`Original: ${instructions.substring(0, 100)}...`);

  // Handle malformed JSON array format first
  if (instructions.startsWith('{') && instructions.includes('","')) {
    try {
      console.log('  -> Detected JSON format');
      // Remove the outer braces and split by '","'
      const arrayContent = instructions.slice(1, -1); // Remove { and }
      const steps = arrayContent.split('","').map((step, index) => {
        let cleanStep = step.replace(/^"/, '').replace(/"$/, '').trim();
        
        // Remove step numbers if they exist at the beginning
        cleanStep = cleanStep.replace(/^\d+\.\s*/, '');
        
        // Ensure proper capitalization
        if (cleanStep.length > 0) {
          cleanStep = cleanStep.charAt(0).toUpperCase() + cleanStep.slice(1);
        }
        
        // Ensure proper ending punctuation
        if (cleanStep.length > 0 && !cleanStep.endsWith('.') && !cleanStep.endsWith('!') && !cleanStep.endsWith('?')) {
          cleanStep += '.';
        }
        
        return `${index + 1}. ${cleanStep}`;
      });
      
      const formatted = steps.join('\n');
      console.log(`  -> Converted from JSON to ${steps.length} steps`);
      return formatted;
    } catch (e) {
      console.warn('  -> Failed to parse JSON format, falling back to other methods');
    }
  }

  // Handle very short instructions that need expansion
  if (instructions.length < 100) {
    console.log(`  -> Very short instructions (${instructions.length} chars), expanding...`);
    
    // Check if it's already in numbered format but too brief
    if (instructions.match(/^\d+\./)) {
      // Already numbered but may need enhancement
      const steps = instructions.split(/\n|\.\s*\d+\./).filter(s => s.trim().length > 0);
      if (steps.length < 3) {
        // Need to expand based on recipe name context
        const expandedSteps = expandShortRecipe(instructions, recipeName);
        if (expandedSteps.length >= 3) {
          const formatted = expandedSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
          console.log(`  -> Expanded to ${expandedSteps.length} steps`);
          return formatted;
        }
      }
    } else {
      // Not numbered at all - try to expand
      const expandedSteps = expandShortRecipe(instructions, recipeName);
      if (expandedSteps.length >= 3) {
        const formatted = expandedSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
        console.log(`  -> Expanded to ${expandedSteps.length} steps`);
        return formatted;
      }
    }
  }

  // Handle single paragraph format (long text without line breaks)
  if (!instructions.includes('\n') && instructions.length > 100) {
    console.log('  -> Single paragraph format, splitting...');
    
    // Split by common sentence boundaries and cooking instruction patterns
    const splitPatterns = [
      /\.\s+(?=[A-Z])/g,       // Period followed by space and capital letter
      /\.\s*Then\s+/gi,        // Then transitions
      /\.\s*Next\s+/gi,        // Next transitions  
      /\.\s*After\s+/gi,       // After transitions
      /\.\s*Meanwhile\s+/gi,   // Meanwhile transitions
      /\.\s*While\s+/gi,       // While transitions
      /\;\s+/g,                // Semicolon followed by space
      /\.\s*Add\s+/gi,         // Add instructions
      /\.\s*Cook\s+/gi,        // Cook instructions
      /\.\s*Heat\s+/gi,        // Heat instructions
      /\.\s*Season\s+/gi,      // Season instructions
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

    // Clean and format the steps
    const cleanSteps = steps
      .map(step => step.trim())
      .filter(step => step.length > 10) // Remove very short fragments
      .map(step => {
        // Remove step numbers if they exist at the beginning
        step = step.replace(/^\d+\.\s*/, '');
        
        // Ensure step starts with capital letter
        if (step.length > 0) {
          step = step.charAt(0).toUpperCase() + step.slice(1);
        }
        
        // Ensure step ends with period
        if (step.length > 0 && !step.endsWith('.') && !step.endsWith('!') && !step.endsWith('?')) {
          step += '.';
        }
        
        return step;
      })
      .filter(step => step.length > 5); // Final filter for meaningful steps

    // Limit to reasonable number of steps
    if (cleanSteps.length > 15) {
      cleanSteps.splice(15);
    }
    
    if (cleanSteps.length >= 3) {
      const formatted = cleanSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
      console.log(`  -> Split paragraph into ${cleanSteps.length} steps`);
      return formatted;
    }
  }

  // Handle existing numbered format that might have issues
  if (instructions.includes('\n') && instructions.match(/\d+\./)) {
    console.log('  -> Already numbered format, cleaning up...');
    
    const lines = instructions.split('\n').filter(line => line.trim().length > 0);
    const cleanedSteps: string[] = [];
    
    lines.forEach((line, index) => {
      let cleanLine = line.trim();
      
      // Remove existing numbering
      cleanLine = cleanLine.replace(/^\d+\.\s*/, '');
      
      // Skip very short or meaningless lines
      if (cleanLine.length < 5 || cleanLine.match(/^(and|or|with|for)$/i)) {
        return;
      }
      
      // Ensure proper capitalization
      if (cleanLine.length > 0) {
        cleanLine = cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1);
      }
      
      // Ensure proper ending punctuation
      if (cleanLine.length > 0 && !cleanLine.endsWith('.') && !cleanLine.endsWith('!') && !cleanLine.endsWith('?')) {
        cleanLine += '.';
      }
      
      cleanedSteps.push(cleanLine);
    });
    
    if (cleanedSteps.length >= 3) {
      const formatted = cleanedSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
      console.log(`  -> Cleaned up to ${cleanedSteps.length} steps`);
      return formatted;
    }
  }

  console.log('  -> No changes needed or unable to improve');
  return instructions;
}

// Function to expand very short recipe instructions based on context
function expandShortRecipe(instructions: string, recipeName: string): string[] {
  const steps: string[] = [];
  
  // Common recipe patterns based on name and instruction analysis
  const lowerName = recipeName.toLowerCase();
  const lowerInstructions = instructions.toLowerCase();
  
  if (lowerName.includes('toast') && lowerInstructions.includes('bread')) {
    steps.push("Toast bread slice until golden brown and crispy");
    if (lowerInstructions.includes('butter') || lowerInstructions.includes('almond')) {
      steps.push("Spread almond butter or nut butter evenly over warm toast");
    }
    if (lowerInstructions.includes('topping') || lowerInstructions.includes('seeds') || lowerInstructions.includes('fruit')) {
      steps.push("Add desired toppings such as seeds, fruit, or spices");
    }
    steps.push("Serve immediately while warm");
  }
  else if (lowerName.includes('smoothie') || lowerName.includes('blend')) {
    steps.push("Add all liquid ingredients to blender first for optimal blending");
    steps.push("Add solid ingredients including fruits, vegetables, and protein powder");
    steps.push("Blend on high speed for 60-90 seconds until completely smooth");
    steps.push("Pour into glass and serve immediately for best texture and nutrition");
  }
  else if (lowerName.includes('salad') && lowerInstructions.includes('mix')) {
    steps.push("Prepare all vegetables by washing and chopping to desired size");
    steps.push("Combine vegetables in large serving bowl");
    if (lowerInstructions.includes('dress') || lowerInstructions.includes('oil')) {
      steps.push("Drizzle with olive oil and seasonings, toss gently to coat");
    }
    steps.push("Serve immediately or chill for enhanced flavors");
  }
  else if (lowerName.includes('burrito') || lowerName.includes('wrap')) {
    if (lowerInstructions.includes('egg')) {
      steps.push("Scramble eggs with salt and pepper until fluffy and cooked through");
    }
    steps.push("Warm tortilla in dry skillet or microwave until pliable");
    steps.push("Add filling ingredients to center of tortilla in a line");
    steps.push("Fold sides of tortilla inward, then roll tightly from bottom to top");
    steps.push("Serve immediately while warm or wrap for later");
  }
  else if (lowerName.includes('bowl') && (lowerInstructions.includes('grain') || lowerInstructions.includes('quinoa'))) {
    steps.push("Cook grains according to package directions until fluffy and tender");
    steps.push("Prepare vegetables by chopping and cooking as needed");
    steps.push("Arrange cooked grains as base in serving bowl");
    steps.push("Top with prepared vegetables and protein");
    if (lowerInstructions.includes('dress') || lowerInstructions.includes('sauce')) {
      steps.push("Drizzle with dressing or sauce and serve immediately");
    } else {
      steps.push("Season with salt, pepper, and herbs, then serve");
    }
  }
  else if (lowerName.includes('grill') || lowerInstructions.includes('grill')) {
    steps.push("Preheat grill to medium-high heat and oil grates to prevent sticking");
    steps.push("Season ingredients with salt, pepper, and desired spices");
    steps.push("Grill ingredients according to thickness, turning once halfway through");
    steps.push("Check for proper doneness and remove when cooked through");
    steps.push("Let rest for 2-3 minutes before serving");
  }
  else {
    // Generic expansion for any unmatched recipes
    const parts = instructions.split(/[,.;]/).filter(p => p.trim().length > 5);
    if (parts.length >= 2) {
      return parts.map(part => {
        let cleanPart = part.trim();
        if (cleanPart.charAt(0) === cleanPart.charAt(0).toLowerCase()) {
          cleanPart = cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
        }
        if (!cleanPart.endsWith('.')) {
          cleanPart += '.';
        }
        return cleanPart;
      });
    } else {
      // Fallback - at least create a basic step
      let cleanInstr = instructions.trim();
      if (cleanInstr.charAt(0) === cleanInstr.charAt(0).toLowerCase()) {
        cleanInstr = cleanInstr.charAt(0).toUpperCase() + cleanInstr.slice(1);
      }
      if (!cleanInstr.endsWith('.')) {
        cleanInstr += '.';
      }
      steps.push(cleanInstr);
      steps.push("Serve immediately while fresh");
    }
  }
  
  return steps;
}

async function fixAllRecipeFormatting() {
  console.log('Starting comprehensive recipe formatting script...');
  
  try {
    // Get ALL recipes that might need formatting improvements
    const query = `
      SELECT id, name, instructions, LENGTH(instructions) as char_length,
             (LENGTH(instructions) - LENGTH(REPLACE(instructions, E'\\n', ''))) + 1 as line_count
      FROM meals 
      WHERE 
        -- JSON format recipes
        (instructions LIKE '{%' AND instructions LIKE '%",%') OR
        -- Paragraph style (single line, long)
        ((LENGTH(instructions) - LENGTH(REPLACE(instructions, E'\\n', ''))) + 1 = 1 AND LENGTH(instructions) > 100) OR
        -- Very short instructions
        (LENGTH(instructions) < 100) OR
        -- Poorly formatted numbered lists
        (instructions ~ '\\d+\\.' AND (instructions ~ '\\d+\\. [a-z]' OR instructions ~ '\\d+\\.[^A-Z]'))
      ORDER BY char_length DESC, name
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} recipes that need formatting improvements`);
    
    // Process each recipe
    let updateCount = 0;
    const updates: Array<{id: string, name: string, oldInstructions: string, newInstructions: string, type: string}> = [];
    
    for (const row of result.rows) {
      const { id, name, instructions, char_length } = row;
      
      const newInstructions = formatInstructions(instructions, name);
      const newStepCount = (newInstructions.match(/\n/g) || []).length + 1;
      
      if (newInstructions !== instructions && newStepCount >= 3) {
        let type = 'unknown';
        if (instructions.startsWith('{')) type = 'json';
        else if (!instructions.includes('\n') && instructions.length > 100) type = 'paragraph';
        else if (instructions.length < 100) type = 'short';
        else type = 'cleanup';
        
        updates.push({
          id,
          name,
          oldInstructions: instructions,
          newInstructions,
          type
        });
        updateCount++;
      }
    }
    
    console.log(`\nReady to update ${updateCount} recipes:`);
    
    // Group by type for reporting
    const byType = updates.reduce((acc, update) => {
      acc[update.type] = (acc[update.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Updates by type:', byType);
    
    // Preview some changes
    console.log('\nPreview of changes:');
    updates.slice(0, 3).forEach(update => {
      console.log(`\n${update.name} (${update.type}):`);
      console.log(`  Before: ${update.oldInstructions.substring(0, 80)}...`);
      console.log(`  After:  ${update.newInstructions.substring(0, 80)}...`);
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
    
    console.log(`\nScript completed successfully! Updated ${updateCount} recipes.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
fixAllRecipeFormatting().catch(console.error);