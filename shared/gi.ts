/**
 * Comprehensive Glycemic Index (GI) Database and Substitution System
 * CRITICAL DIABETES SAFETY: All recipes must maintain GI ≤45
 */

// High-GI ingredients that VIOLATE our diabetes safety standard (GI >45)
export const HIGH_GI_VIOLATIONS: Record<string, number> = {
  // Grains & Cereals (MAJOR VIOLATIONS)
  'rolled oats': 55,
  'steel-cut oats': 55, 
  'old-fashioned oats': 55,
  'oatmeal': 55,
  'instant oats': 75,
  'white rice': 73,
  'jasmine rice': 89,
  'basmati rice': 58,
  'brown rice': 50,
  'wild rice': 45, // borderline
  'wheat flour': 71,
  'all-purpose flour': 71,
  'whole wheat flour': 71,
  'bread flour': 71,
  'white bread': 75,
  'whole wheat bread': 74,
  'sourdough bread': 52,
  'corn': 52,
  'cornmeal': 68,
  'polenta': 68,
  'couscous': 65,
  'bulgur wheat': 48,
  'kamut berries': 55,
  'kamut': 55,
  'spelt': 55,
  'farro': 45, // borderline
  'barley': 25, // actually low GI - keep
  'millet': 71,
  
  // Potatoes & Starchy Vegetables (MAJOR VIOLATIONS)
  'potato': 62,
  'potatoes': 62,
  'white potato': 62,
  'red potato': 62,
  'russet potato': 77,
  'baked potato': 85,
  'mashed potato': 87,
  'sweet potato': 45, // borderline
  'yam': 37, // actually low GI - keep
  'plantain': 55,
  'parsnip': 97,
  'rutabaga': 62,
  'turnip': 30, // actually low GI - keep
  
  // Sugars & Sweeteners (EXTREME VIOLATIONS)
  'sugar': 65,
  'white sugar': 65,
  'brown sugar': 64,
  'raw sugar': 65,
  'cane sugar': 65,
  'coconut sugar': 54,
  'maple syrup': 54,
  'honey': 55,
  'raw honey': 55,
  'agave nectar': 17, // actually low GI - keep
  'molasses': 55,
  'corn syrup': 75,
  'high fructose corn syrup': 62,
  'date syrup': 55,
  'rice syrup': 98,
  
  // Fruits (SELECTIVE VIOLATIONS)
  'banana': 51,
  'ripe banana': 62,
  'overripe banana': 62,
  'dates': 55,
  'medjool dates': 55,
  'dried dates': 55,
  'raisins': 64,
  'dried fruit': 60,
  'watermelon': 72,
  'pineapple': 59,
  'mango': 51,
  'papaya': 59,
  
  // Processed Foods (VIOLATIONS)
  'pasta': 49,
  'white pasta': 49,
  'whole wheat pasta': 37, // actually low GI - keep
  'rice cakes': 87,
  'corn flakes': 81,
  'breakfast cereal': 70,
  'granola': 55,
  'crackers': 67,
  'pretzels': 83,
  'bagel': 72,
  'muffin': 62,
  'donut': 76,
  'cake': 63,
  'cookies': 55,
  'biscuit': 67,
  
  // Beverages (VIOLATIONS)
  'fruit juice': 50,
  'orange juice': 50,
  'apple juice': 41, // borderline
  'grape juice': 48,
  'cranberry juice': 52,
  'sports drink': 78,
  'soda': 63,
  'cola': 63,
  'energy drink': 85,
  
  // Specialty Grains (VIOLATIONS)
  'quinoa': 53,
  'amaranth': 97,
  'teff': 57,
  'sorghum': 62,
  'tapioca': 67,
  'arrowroot': 85,
  'cassava': 46,
  'yuca': 46,
  
  // Legumes (BORDERLINE - most are safe but check)
  'broad beans': 79,
  'fava beans': 79,
  'lima beans': 32, // actually low GI - keep
  'navy beans': 38, // actually low GI - keep
  'pinto beans': 39, // actually low GI - keep
  'black beans': 30, // actually low GI - keep
  'kidney beans': 24, // actually low GI - keep
  'chickpeas': 28, // actually low GI - keep
  'lentils': 29, // actually low GI - keep
  
  // Dairy (MOSTLY SAFE)
  'milk': 39, // actually low GI - keep
  'yogurt': 36, // actually low GI - keep
  'ice cream': 51,
};

// SAFE low-GI substitutions for diabetes management
export const SAFE_SUBSTITUTIONS: Record<string, string[]> = {
  // GRAIN SUBSTITUTIONS (PRIMARY FOCUS)
  'rolled oats': ['chia seeds', 'hemp hearts', 'ground flaxseed', 'almond flour'],
  'steel-cut oats': ['chia seeds', 'hemp hearts', 'ground flaxseed', 'coconut flour'],
  'old-fashioned oats': ['chia seeds', 'hemp hearts', 'ground flaxseed'],
  'oatmeal': ['chia pudding', 'hemp heart pudding', 'coconut flour porridge'],
  'instant oats': ['chia seeds', 'hemp hearts', 'almond flour'],
  'white rice': ['cauliflower rice', 'broccoli rice', 'shiitaki mushroom rice'],
  'brown rice': ['cauliflower rice', 'broccoli rice', 'zucchini rice'],
  'wild rice': ['cauliflower rice', 'broccoli rice'],
  'jasmine rice': ['cauliflower rice', 'broccoli rice'],
  'basmati rice': ['cauliflower rice', 'broccoli rice'],
  'wheat flour': ['almond flour', 'coconut flour', 'flaxseed meal'],
  'all-purpose flour': ['almond flour', 'coconut flour', 'flaxseed meal'],
  'whole wheat flour': ['almond flour', 'coconut flour', 'flaxseed meal'],
  'bread flour': ['almond flour', 'coconut flour', 'flaxseed meal'],
  'corn': ['cauliflower', 'zucchini', 'broccoli'],
  'cornmeal': ['almond flour', 'coconut flour', 'flaxseed meal'],
  'polenta': ['cauliflower mash', 'turnip mash', 'almond flour'],
  'couscous': ['cauliflower rice', 'broccoli rice', 'zucchini noodles'],
  'bulgur wheat': ['cauliflower rice', 'hemp hearts', 'chia seeds'],
  'kamut berries': ['hemp hearts', 'chia seeds', 'pumpkin seeds'],
  'kamut': ['hemp hearts', 'chia seeds', 'sunflower seeds'],
  'farro': ['cauliflower rice', 'hemp hearts', 'chia seeds'],
  'millet': ['cauliflower rice', 'hemp hearts', 'chia seeds'],
  'quinoa': ['cauliflower rice', 'hemp hearts', 'chia seeds'],
  'amaranth': ['chia seeds', 'hemp hearts', 'flaxseed meal'],
  'teff': ['almond flour', 'coconut flour', 'hemp hearts'],
  
  // POTATO & STARCH SUBSTITUTIONS
  'potato': ['cauliflower', 'turnip', 'radish', 'jicama'],
  'potatoes': ['cauliflower', 'turnips', 'radishes', 'jicama'],
  'white potato': ['cauliflower', 'turnip', 'rutabaga'],
  'red potato': ['cauliflower', 'turnip', 'radish'],
  'russet potato': ['cauliflower', 'turnip', 'kohlrabi'],
  'baked potato': ['roasted cauliflower', 'roasted turnip', 'roasted radish'],
  'mashed potato': ['cauliflower mash', 'turnip mash', 'celeriac mash'],
  'sweet potato': ['roasted cauliflower', 'roasted turnip', 'butternut squash (small portions)'],
  'plantain': ['zucchini', 'eggplant', 'portobello mushrooms'],
  'parsnip': ['turnip', 'radish', 'cauliflower'],
  'rutabaga': ['turnip', 'cauliflower', 'kohlrabi'],
  
  // SWEETENER SUBSTITUTIONS
  'sugar': ['stevia', 'monk fruit extract', 'erythritol'],
  'white sugar': ['stevia', 'monk fruit extract', 'erythritol'],
  'brown sugar': ['stevia', 'monk fruit extract', 'erythritol'],
  'raw sugar': ['stevia', 'monk fruit extract', 'erythritol'],
  'cane sugar': ['stevia', 'monk fruit extract', 'erythritol'],
  'coconut sugar': ['stevia', 'monk fruit extract', 'erythritol'],
  'maple syrup': ['stevia', 'monk fruit extract', 'sugar-free maple syrup'],
  'honey': ['stevia', 'monk fruit extract', 'erythritol'],
  'raw honey': ['stevia', 'monk fruit extract', 'erythritol'],
  'molasses': ['stevia', 'monk fruit extract', 'blackstrap molasses (small amounts)'],
  'corn syrup': ['stevia', 'monk fruit extract', 'erythritol'],
  'date syrup': ['stevia', 'monk fruit extract', 'erythritol'],
  'rice syrup': ['stevia', 'monk fruit extract', 'erythritol'],
  
  // FRUIT SUBSTITUTIONS
  'banana': ['avocado (for creaminess)', 'berries', 'zucchini (in baking)'],
  'ripe banana': ['berries', 'avocado', 'cucumber'],
  'dates': ['berries', 'stevia for sweetness'],
  'medjool dates': ['berries', 'monk fruit extract'],
  'dried dates': ['fresh berries', 'stevia'],
  'raisins': ['fresh berries', 'chopped nuts'],
  'dried fruit': ['fresh berries', 'nuts', 'seeds'],
  'watermelon': ['cucumber', 'berries', 'melon (small portions)'],
  'pineapple': ['berries', 'cucumber', 'bell pepper'],
  'mango': ['berries', 'yellow bell pepper', 'cucumber'],
  'papaya': ['berries', 'cucumber', 'zucchini'],
  
  // PASTA & BREAD SUBSTITUTIONS
  'pasta': ['zucchini noodles', 'shirataki noodles', 'spaghetti squash'],
  'white pasta': ['zucchini noodles', 'shirataki noodles', 'kelp noodles'],
  'rice cakes': ['flax crackers', 'cheese crisps', 'vegetable chips'],
  'corn flakes': ['chia pudding', 'hemp heart cereal'],
  'breakfast cereal': ['chia pudding', 'hemp heart bowl', 'Greek yogurt with nuts'],
  'granola': ['nut and seed mix', 'hemp hearts with berries'],
  'crackers': ['flax crackers', 'cheese crisps', 'vegetable slices'],
  'pretzels': ['nuts', 'seeds', 'vegetable sticks'],
  'bagel': ['portobello mushroom', 'cauliflower round', 'lettuce wrap'],
  'bread': ['lettuce leaves', 'portobello mushroom', 'cauliflower bread'],
  'white bread': ['lettuce wraps', 'portobello caps', 'almond flour bread'],
  'whole wheat bread': ['lettuce wraps', 'coconut flour bread'],
  
  // BEVERAGE SUBSTITUTIONS
  'fruit juice': ['infused water', 'herbal tea', 'coconut water (small amounts)'],
  'orange juice': ['lemon water', 'herbal tea', 'sparkling water with lemon'],
  'apple juice': ['green tea', 'herbal tea', 'infused water'],
  'grape juice': ['sparkling water with berries', 'herbal tea'],
  'cranberry juice': ['unsweetened cranberry juice (diluted)', 'herbal tea'],
  'sports drink': ['coconut water', 'electrolyte water', 'herbal tea'],
  'soda': ['sparkling water', 'stevia-sweetened beverages', 'kombucha'],
  'cola': ['sparkling water with stevia', 'herbal tea'],
  'energy drink': ['green tea', 'herbal tea', 'coconut water'],
  
  // ICE CREAM & DESSERTS
  'ice cream': ['avocado nice cream', 'coconut cream', 'chia pudding'],
};

// SAFE ingredients that are diabetes-friendly (GI ≤45)
export const SAFE_INGREDIENTS = [
  // VEGETABLES (GI <15 mostly)
  'spinach', 'kale', 'arugula', 'lettuce', 'cabbage', 'broccoli', 'cauliflower',
  'Brussels sprouts', 'asparagus', 'zucchini', 'cucumber', 'celery', 'bell pepper',
  'tomato', 'onion', 'garlic', 'mushrooms', 'eggplant', 'okra', 'green beans',
  'snow peas', 'snap peas', 'radish', 'turnip', 'kohlrabi', 'bok choy',
  'collard greens', 'swiss chard', 'watercress', 'endive', 'radicchio',
  
  // PROTEINS (GI ~0)
  'chicken', 'turkey', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'cod',
  'eggs', 'tofu', 'tempeh', 'seitan', 'cottage cheese', 'Greek yogurt',
  
  // NUTS & SEEDS (GI <15)
  'almonds', 'walnuts', 'pecans', 'macadamias', 'hazelnuts', 'pine nuts',
  'chia seeds', 'flax seeds', 'hemp hearts', 'pumpkin seeds', 'sunflower seeds',
  'sesame seeds', 'tahini', 'almond butter', 'peanut butter', 'sunflower butter',
  
  // HEALTHY FATS (GI ~0)
  'olive oil', 'coconut oil', 'avocado oil', 'ghee', 'butter', 'MCT oil',
  'avocado', 'coconut', 'olives',
  
  // LOW-GI BERRIES & FRUITS (GI 25-40)
  'blueberries', 'strawberries', 'raspberries', 'blackberries', 'cranberries',
  'cherries', 'plums', 'peaches', 'apricots', 'grapefruit', 'lemon', 'lime',
  'apple', 'pear', 'kiwi', 'orange',
  
  // LOW-GI LEGUMES (GI 24-39)
  'lentils', 'black beans', 'kidney beans', 'navy beans', 'pinto beans',
  'chickpeas', 'split peas', 'hummus',
  
  // SAFE FLOURS (GI <30)
  'almond flour', 'coconut flour', 'flaxseed meal', 'hemp flour', 'hazelnut flour',
  'walnut flour', 'pumpkin seed flour',
  
  // SAFE SWEETENERS (GI 0-25)
  'stevia', 'monk fruit', 'erythritol', 'xylitol', 'inulin',
  
  // DAIRY (GI 15-39)
  'milk', 'yogurt', 'kefir', 'cheese', 'cream cheese', 'sour cream',
  
  // HERBS & SPICES (GI ~0)
  'basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill',
  'turmeric', 'ginger', 'cinnamon', 'cumin', 'paprika', 'black pepper',
  'sea salt', 'himalayan salt',
  
  // SAFE GRAINS (VERY LIMITED - GI ≤45)
  'barley', // GI 25
  // NOTE: Most grains are eliminated for strict diabetes control
];

// Fuzzy matching patterns for ingredient detection
export const INGREDIENT_PATTERNS: Record<string, string[]> = {
  'oats': ['oat', 'oats', 'oatmeal', 'steel-cut', 'rolled', 'old-fashioned', 'instant oats'],
  'rice': ['rice', 'jasmine', 'basmati', 'brown rice', 'white rice', 'wild rice'],
  'flour': ['flour', 'wheat', 'all-purpose', 'bread flour', 'whole wheat'],
  'potato': ['potato', 'potatoes', 'russet', 'red potato', 'white potato'],
  'sugar': ['sugar', 'honey', 'maple syrup', 'molasses', 'syrup'],
  'banana': ['banana', 'bananas', 'ripe banana'],
  'corn': ['corn', 'cornmeal', 'polenta', 'corn flakes'],
  'pasta': ['pasta', 'noodles', 'spaghetti', 'macaroni'],
  'bread': ['bread', 'bagel', 'bun', 'roll', 'toast'],
};

// Recipe transformation rules
export interface RecipeTransformation {
  originalIngredient: string;
  substitution: string;
  ratio: number; // conversion ratio
  notes?: string;
}

export const RECIPE_TRANSFORMATIONS: RecipeTransformation[] = [
  // OAT TRANSFORMATIONS (CRITICAL)
  {
    originalIngredient: '1/4 cup steel-cut oats',
    substitution: '2 tbsp chia seeds + 1 tbsp hemp hearts',
    ratio: 1,
    notes: 'Creates similar texture and nutrition without GI spike'
  },
  {
    originalIngredient: '1/2 cup rolled oats',
    substitution: '1/4 cup chia seeds + 2 tbsp ground flaxseed',
    ratio: 1,
    notes: 'Maintains fiber and omega-3s'
  },
  {
    originalIngredient: '3/4 cup kamut berries',
    substitution: '1/2 cup hemp hearts + 1/4 cup pumpkin seeds',
    ratio: 1,
    notes: 'Provides protein and healthy fats instead of high-GI grains'
  },
  
  // FLOUR TRANSFORMATIONS
  {
    originalIngredient: '1 cup wheat flour',
    substitution: '3/4 cup almond flour + 1/4 cup coconut flour',
    ratio: 1,
    notes: 'Low-carb, high-protein alternative'
  },
  
  // RICE TRANSFORMATIONS
  {
    originalIngredient: '1 cup white rice',
    substitution: '2 cups cauliflower rice',
    ratio: 2,
    notes: 'Significantly lower carbs and GI'
  },
  
  // POTATO TRANSFORMATIONS
  {
    originalIngredient: '1 medium potato',
    substitution: '1 cup cauliflower florets',
    ratio: 1,
    notes: 'Much lower GI and carbs'
  },
  
  // SWEETENER TRANSFORMATIONS
  {
    originalIngredient: '2 tbsp honey',
    substitution: '1/4 tsp stevia extract',
    ratio: 0.1,
    notes: 'Zero GI sweetener'
  },
];

/**
 * Check if an ingredient violates GI standards
 */
export function isHighGIViolation(ingredient: string): boolean {
  const normalized = ingredient.toLowerCase().trim();
  
  // Check direct matches
  if (HIGH_GI_VIOLATIONS[normalized]) {
    return true;
  }
  
  // Check fuzzy patterns
  for (const [category, patterns] of Object.entries(INGREDIENT_PATTERNS)) {
    if (patterns.some(pattern => normalized.includes(pattern))) {
      if (HIGH_GI_VIOLATIONS[category] || category === 'oats' || category === 'rice' || category === 'flour') {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get suggested substitutions for a high-GI ingredient
 */
export function getSuggestions(ingredient: string): string[] {
  const normalized = ingredient.toLowerCase().trim();
  
  // Check direct substitutions
  if (SAFE_SUBSTITUTIONS[normalized]) {
    return SAFE_SUBSTITUTIONS[normalized];
  }
  
  // Check pattern-based substitutions
  for (const [key, substitutions] of Object.entries(SAFE_SUBSTITUTIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return substitutions;
    }
  }
  
  // Default safe alternatives
  return ['cauliflower rice', 'chia seeds', 'hemp hearts', 'almond flour'];
}

/**
 * Calculate estimated GI for recipe based on ingredients
 */
export function estimateRecipeGI(ingredients: string[]): number {
  let totalGI = 0;
  let weightedCount = 0;
  
  for (const ingredient of ingredients) {
    const normalized = ingredient.toLowerCase();
    let ingredientGI = 25; // default low GI
    
    // Check for high-GI violations
    for (const [highGIIngredient, gi] of Object.entries(HIGH_GI_VIOLATIONS)) {
      if (normalized.includes(highGIIngredient)) {
        ingredientGI = gi;
        break;
      }
    }
    
    // Weight by ingredient prominence (rough estimation)
    const weight = normalized.includes('cup') || normalized.includes('tbsp') ? 2 : 1;
    totalGI += ingredientGI * weight;
    weightedCount += weight;
  }
  
  return weightedCount > 0 ? Math.round(totalGI / weightedCount) : 25;
}

/**
 * Validate recipe compliance with diabetes safety standards
 */
export function validateRecipeCompliance(ingredients: string[]): {
  isCompliant: boolean;
  violations: string[];
  suggestions: Record<string, string[]>;
  estimatedGI: number;
} {
  const violations: string[] = [];
  const suggestions: Record<string, string[]> = {};
  
  for (const ingredient of ingredients) {
    if (isHighGIViolation(ingredient)) {
      violations.push(ingredient);
      suggestions[ingredient] = getSuggestions(ingredient);
    }
  }
  
  const estimatedGI = estimateRecipeGI(ingredients);
  
  return {
    isCompliant: violations.length === 0 && estimatedGI <= 45,
    violations,
    suggestions,
    estimatedGI
  };
}