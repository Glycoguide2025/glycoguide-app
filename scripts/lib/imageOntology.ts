// Automated Recipe Image Quality Control System
// Tokenizes ingredients and images to detect mismatches efficiently

export interface ImageToken {
  raw: string;
  normalized: string;
  category?: string;
  synonyms: string[];
}

export interface ImageMatch {
  filename: string;
  tokens: string[];
  categories: string[];
  confidence: number;
  reason: string;
}

// Ingredient synonym mapping for better matching
const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  'dragonfruit': ['pitaya', 'dragon fruit'],
  'chickpea': ['garbanzo', 'chick pea', 'chickpeas', 'garbanzos'],
  'quinoa': ['keen-wah', 'quinoa grain'],
  'acai': ['acai berry', 'açaí', 'acai puree'],
  'goji': ['goji berry', 'wolfberry', 'goji berries'],
  'chia': ['chia seed', 'chia seeds'],
  'cacao': ['cocoa', 'chocolate', 'dark chocolate'],
  'coconut': ['coconut milk', 'coconut flakes', 'coconut oil'],
  'almond': ['almonds', 'almond butter', 'chopped almonds'],
  'avocado': ['avocados', 'avo'],
  'broccoli': ['broccoli florets'],
  'cauliflower': ['cauliflower rice', 'cauliflower florets'],
  'spinach': ['baby spinach', 'spinach leaves'],
  'kale': ['kale leaves', 'baby kale'],
  'salmon': ['atlantic salmon', 'wild salmon'],
  'chicken': ['chicken breast', 'chicken thigh'],
  'beef': ['ground beef', 'beef strips'],
  'tofu': ['firm tofu', 'silken tofu'],
  'mushroom': ['mushrooms', 'shiitake', 'portobello'],
  'bell pepper': ['red pepper', 'yellow pepper', 'green pepper', 'peppers'],
  'tomato': ['tomatoes', 'cherry tomatoes', 'roma tomatoes'],
  'onion': ['onions', 'red onion', 'white onion', 'yellow onion'],
  'garlic': ['garlic clove', 'garlic cloves'],
  'lemon': ['lemon juice', 'lemon zest'],
  'lime': ['lime juice', 'lime zest'],
  'ginger': ['fresh ginger', 'ginger root'],
  'turmeric': ['turmeric powder', 'fresh turmeric'],
  'basil': ['fresh basil', 'basil leaves'],
  'cilantro': ['fresh cilantro', 'coriander'],
  'parsley': ['fresh parsley', 'parsley leaves']
};

// Category mappings for meal types
const MEAL_CATEGORIES: Record<string, string[]> = {
  'breakfast': ['bowl', 'smoothie', 'parfait', 'toast', 'eggs', 'pancakes', 'oatmeal'],
  'lunch': ['salad', 'wrap', 'sandwich', 'soup', 'bowl'],
  'dinner': ['stir fry', 'pasta', 'curry', 'roast', 'casserole', 'pizza'],
  'snack': ['bites', 'chips', 'crackers', 'bars'],
  'dessert': ['ice cream', 'cake', 'cookies', 'pudding', 'mousse'],
  'beverage': ['smoothie', 'juice', 'tea', 'latte', 'water']
};

// High-risk ingredients that MUST NOT appear in images if not in recipe
const FORBIDDEN_MISMATCHES = [
  'dragonfruit', 'pitaya',
  'quinoa', 'buckwheat', 
  'pork', 'bacon', 'ham',
  'shellfish', 'shrimp', 'crab', 'lobster',
  'alcohol', 'wine', 'beer',
  'dairy', 'milk', 'cheese', 'yogurt', // unless specifically in recipe
  'wheat', 'bread', 'pasta', // unless recipe calls for it
  'rice', // unless recipe calls for it
  'sweet potato', 'potato' // unless recipe calls for it
];

export class ImageOntology {
  
  // Normalize and tokenize text (ingredients or image names)
  static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ') // Remove punctuation/numbers
      .split(/\s+/)
      .filter(token => token.length > 2) // Remove short words
      .map(token => this.singularize(token)) // Basic singularization
      .filter(token => !this.isStopWord(token));
  }

  // Basic singularization for common patterns
  private static singularize(word: string): string {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
  }

  // Remove common stop words
  private static isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'with', 'for', 'cup', 'tbsp', 'tsp', 'fresh', 'raw', 'organic'];
    return stopWords.includes(word);
  }

  // Expand tokens with synonyms
  static expandTokens(tokens: string[]): string[] {
    const expanded = new Set(tokens);
    
    tokens.forEach(token => {
      // Add synonyms
      Object.entries(INGREDIENT_SYNONYMS).forEach(([key, synonyms]) => {
        if (synonyms.includes(token) || key === token) {
          expanded.add(key);
          synonyms.forEach(syn => expanded.add(syn.replace(/\s+/g, '').toLowerCase()));
        }
      });
    });

    return Array.from(expanded);
  }

  // Calculate match score between recipe and image tokens
  static calculateMatchScore(recipeTokens: string[], imageTokens: string[], mealCategory?: string): {
    score: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    const expandedRecipeTokens = this.expandTokens(recipeTokens);
    const expandedImageTokens = this.expandTokens(imageTokens);

    // Check for forbidden mismatches (critical)
    const forbiddenFound = FORBIDDEN_MISMATCHES.filter(forbidden => 
      expandedImageTokens.includes(forbidden) && !expandedRecipeTokens.includes(forbidden)
    );

    if (forbiddenFound.length > 0) {
      issues.push(`Forbidden ingredients in image: ${forbiddenFound.join(', ')}`);
      score -= 50; // Heavy penalty
    }

    // Category alignment (important)
    if (mealCategory) {
      const categoryKeywords = MEAL_CATEGORIES[mealCategory] || [];
      const categoryMatch = categoryKeywords.some(keyword => 
        expandedImageTokens.includes(keyword)
      );
      if (categoryMatch) {
        score += 20;
      } else {
        issues.push(`Image doesn't match meal category: ${mealCategory}`);
        score -= 10;
      }
    }

    // Ingredient overlap (core matching)
    const commonTokens = expandedRecipeTokens.filter(token => 
      expandedImageTokens.includes(token)
    );
    const overlapRatio = commonTokens.length / Math.max(expandedRecipeTokens.length, 1);
    score += Math.round(overlapRatio * 100);

    if (overlapRatio < 0.2) {
      issues.push(`Low ingredient overlap: ${Math.round(overlapRatio * 100)}%`);
    }

    // Determine confidence
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    if (score >= 80 && issues.length === 0) confidence = 'HIGH';
    else if (score >= 50 && forbiddenFound.length === 0) confidence = 'MEDIUM';
    else confidence = 'LOW';

    return { score, confidence, issues };
  }

  // Find best image replacement from available options (enhanced matching)
  static findBestMatch(
    recipeTokens: string[], 
    mealCategory: string,
    availableImages: { filename: string; tokens: string[] }[]
  ): ImageMatch | null {
    
    let bestMatch: ImageMatch | null = null;
    let bestScore = -999;

    const expandedRecipeTokens = this.expandTokens(recipeTokens);

    for (const image of availableImages) {
      const result = this.calculateMatchScore(recipeTokens, image.tokens, mealCategory);
      
      // More flexible matching - accept matches even with LOW confidence if score is decent
      if (result.score > bestScore && result.score > -20) {
        bestScore = result.score;
        bestMatch = {
          filename: image.filename,
          tokens: image.tokens,
          categories: [mealCategory],
          confidence: result.score,
          reason: `Score: ${result.score}, Issues: ${result.issues.join('; ') || 'None'}`
        };
      }
    }

    // If no decent match found, try category-based fallback matching
    if (!bestMatch || bestScore < 0) {
      const categoryFallback = this.findCategoryFallback(mealCategory, expandedRecipeTokens, availableImages);
      if (categoryFallback && categoryFallback.confidence > bestScore) {
        bestMatch = categoryFallback;
      }
    }

    return bestMatch;
  }

  // Fallback matching based on meal category and common ingredients
  private static findCategoryFallback(
    mealCategory: string,
    recipeTokens: string[],
    availableImages: { filename: string; tokens: string[] }[]
  ): ImageMatch | null {
    
    // Define category-specific image patterns
    const categoryPatterns: Record<string, string[]> = {
      'breakfast': ['breakfast', 'morning', 'bowl', 'smoothie', 'parfait', 'eggs', 'oatmeal'],
      'lunch': ['lunch', 'salad', 'bowl', 'wrap', 'sandwich', 'soup'],
      'dinner': ['dinner', 'plate', 'stir', 'curry', 'pasta', 'roast', 'grill'],
      'snack': ['snack', 'bite', 'ball', 'chip', 'bar', 'energy'],
      'dessert': ['dessert', 'sweet', 'cake', 'ice', 'cream', 'mousse'],
      'beverage': ['drink', 'smoothie', 'juice', 'tea', 'coffee', 'latte']
    };

    // Look for protein types in recipe
    const proteins = ['chicken', 'beef', 'fish', 'salmon', 'turkey', 'tofu', 'egg'];
    const recipeProtein = proteins.find(protein => 
      recipeTokens.some(token => token.includes(protein))
    );

    let bestCategoryMatch: ImageMatch | null = null;
    let bestCategoryScore = -999;

    const patterns = categoryPatterns[mealCategory] || [];
    
    for (const image of availableImages) {
      let categoryScore = 0;
      
      // Score for category pattern matches
      const categoryMatches = patterns.filter(pattern => 
        image.tokens.some(token => token.includes(pattern))
      );
      categoryScore += categoryMatches.length * 15;

      // Score for protein matches
      if (recipeProtein && image.tokens.some(token => token.includes(recipeProtein))) {
        categoryScore += 25;
      }

      // Score for any ingredient overlap
      const commonIngredients = recipeTokens.filter(token => 
        image.tokens.includes(token)
      );
      categoryScore += commonIngredients.length * 10;

      if (categoryScore > bestCategoryScore) {
        bestCategoryScore = categoryScore;
        bestCategoryMatch = {
          filename: image.filename,
          tokens: image.tokens,
          categories: [mealCategory],
          confidence: categoryScore,
          reason: `Category fallback: ${mealCategory} (${categoryMatches.length} pattern matches, ${commonIngredients.length} ingredient matches)`
        };
      }
    }

    // Only return fallback if it's at least minimally relevant
    return bestCategoryScore > 10 ? bestCategoryMatch : null;
  }
}