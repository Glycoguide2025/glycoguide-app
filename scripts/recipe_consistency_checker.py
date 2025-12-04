#!/usr/bin/env python3
"""
Production Recipe Consistency Checker for GlycoGuide
Based on Engineering Brief: Automated Recipe Consistency Checks

Generates CSV report with:
- Description ↔ Ingredients checks
- Ingredients ↔ Instructions checks  
- Image ↔ Recipe checks
- Critical substitutions validation (low-GI compliance)
- Severity levels (P0/P1/P2)
- Actionable fix suggestions
"""

import os
import sys
import re
import csv
from typing import List, Dict, Set, Tuple, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# ============================================================================
# CONFIGURATION & NORMALIZATION
# ============================================================================

# Critical substitutions for low-GI recipes
CRITICAL_SUBSTITUTIONS = {
    'sweetener': {
        'allowed': ['monk fruit extract', '100% monk fruit extract', 'monk fruit'],
        'forbidden': ['sugar', 'cane sugar', 'brown sugar', 'honey', 'maple syrup', 'agave', 'agave nectar']
    },
    'potato': {
        'allowed': ['sweet potato', 'sweet potatoes'],
        'forbidden': ['potato', 'white potato', 'russet potato', 'yukon gold', 'red potato', 'potatoes']
    },
    'flour': {
        'allowed': ['almond flour', 'oat flour', 'coconut flour'],
        'forbidden': ['wheat flour', 'white flour', 'all-purpose flour', 'bread flour', 'all purpose flour']
    },
    'bread': {
        'allowed': ['flatbread', 'lentil flatbread', 'almond flatbread', 'oat flatbread'],
        'forbidden': ['bread', 'bun', 'buns', 'roll', 'rolls', 'loaf', 'loaves', 'baguette', 'bagel', 'toast']
    }
}

# Build forbidden ingredients set for quick lookup
FORBIDDEN_INGREDIENTS = set()
for category, items in CRITICAL_SUBSTITUTIONS.items():
    FORBIDDEN_INGREDIENTS.update(items['forbidden'])

# Ingredient aliases (comprehensive mapping)
INGREDIENT_ALIASES = {
    'zucchini': ['courgette', 'zucchinis'],
    'potato': ['potatoes', 'white potato'],
    'sweet potato': ['yam', 'yams', 'sweet potatoes', 'sweetpotato'],
    'chickpea': ['garbanzo', 'garbanzo beans', 'chickpeas', 'garbanzos'],
    'bell pepper': ['capsicum', 'red pepper', 'green pepper', 'yellow pepper', 'bell peppers', 'sweet pepper'],
    'scallion': ['green onion', 'spring onion', 'scallions', 'green onions', 'spring onions'],
    'coriander': ['cilantro', 'fresh cilantro', 'coriander leaves'],
    'aubergine': ['eggplant'],
    'oatmeal': ['rolled oats', 'porridge oats', 'oats'],
    'quinoa': ['quinua'],
    'tomato': ['tomatoes'],
    'onion': ['onions'],
    'garlic': ['garlic cloves', 'clove garlic', 'garlic clove'],
    'olive oil': ['extra virgin olive oil', 'evoo'],
    'chicken': ['chicken breast', 'chicken breasts', 'chicken thighs'],
    'salmon': ['salmon fillet', 'salmon fillets'],
    'lemon': ['lemons', 'lemon juice'],
    'lime': ['limes', 'lime juice'],
}

# Build reverse alias map
ALIAS_MAP = {}
for canonical, variants in INGREDIENT_ALIASES.items():
    ALIAS_MAP[canonical] = canonical
    for variant in variants:
        ALIAS_MAP[variant] = canonical

# Comprehensive ignore/stopwords list
IGNORE_ITEMS = {
    # Common ingredients that don't need strict checking
    'water', 'salt', 'pepper', 'black pepper', 'sea salt', 'kosher salt',
    'oil', 'cooking spray', 'olive oil',
    
    # Descriptors and modifiers (from stopwords config)
    'fresh', 'dried', 'optional', 'to taste', 'chopped', 'sliced', 
    'ground', 'organic', 'raw', 'cooked', 'minced', 'diced',
    'small', 'medium', 'large',
    
    # Additional common descriptors
    'and', 'or', 'the', 'a', 'an', 'in', 'to', 'for', 'with', 'on', 'at',
    'from', 'by', 'frozen', 'canned',
    
    # Units
    'cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
    'tbsp', 'tsp', 'oz', 'lb', 'lbs', 'gram', 'grams', 'ml', 'kg',
    'pinch', 'dash', 'handful', 'slice', 'slices', 'piece', 'pieces',
    
    # Medical/health terms that aren't ingredients
    'blood', 'sugar', 'glucose', 'insulin', 'diabetes', 'glycemic',
    'carbohydrate', 'carbohydrates', 'protein', 'fiber', 'nutrients',
    'metabolism', 'health', 'healthy', 'nutrition', 'nutritional',
    'benefits', 'compounds', 'antioxidants', 'vitamins', 'minerals',
    
    # Cooking terms
    'baking', 'cooking', 'roasting', 'grilling', 'sauteing', 'boiling',
    'method', 'methods', 'technique', 'techniques', 'preparation',
    
    # General descriptive words
    'traditional', 'classic', 'authentic', 'delicious', 'perfect',
    'excellent', 'superior', 'optimal', 'quality', 'premium',
}

# Critical ingredients to flag (high-GI items that shouldn't appear in low-GI recipes)
CRITICAL_INGREDIENTS = {
    'potato', 'potatoes', 'rice', 'pasta', 'bread', 'cream', 'butter', 
    'cheese', 'sugar', 'honey', 'maple syrup'
}

# Substitution pattern regex
SUBSTITUTION_PATTERNS = [
    # Match: "use X instead of Y", "substitute X for Y"
    r'(?i)\b(?:use|using|substitute|swap|replace)\s+([a-z\s-]+?)\s+(?:instead\s+of|for)\s+([a-z\s-]+?)(?:\s|,|\.|;|$)',
    # Match: "X instead of Y"
    r'(?i)\b([a-z\s-]+?)\s+instead\s+of\s+([a-z\s-]+?)(?:\s|,|\.|;|$)',
    # Match: "replace Y with X"
    r'(?i)\breplace\s+([a-z\s-]+?)\s+with\s+([a-z\s-]+?)(?:\s|,|\.|;|$)',
]

# ============================================================================
# NORMALIZATION UTILITIES
# ============================================================================

def normalize_text(text: str) -> str:
    """Lowercase and basic cleanup"""
    if not text:
        return ""
    return text.lower().strip()

def is_food_ingredient(word: str) -> bool:
    """Check if a word is likely a food ingredient vs descriptive text"""
    if word in IGNORE_ITEMS:
        return False
    if len(word) < 3:
        return False
    # Filter out common non-ingredient words
    non_food_words = {
        'which', 'while', 'where', 'when', 'what', 'that', 'this', 'these',
        'those', 'them', 'their', 'there', 'here', 'have', 'has', 'had',
        'instead', 'using', 'used', 'make', 'makes', 'made', 'add', 'adds',
        'serve', 'serves', 'serving', 'cook', 'cooks', 'cooking',
        'provides', 'supports', 'reduces', 'helps', 'maintains',
    }
    return word not in non_food_words

def tokenize_ingredients(text: str) -> Set[str]:
    """Extract food words from text, normalized"""
    # Extract multi-word phrases up to 3 words
    words = re.findall(r'\b[a-z]{3,}(?:\s+[a-z]{3,}){0,2}\b', normalize_text(text))
    
    # Filter and apply aliases
    result = set()
    for word in words:
        word = word.strip()
        if not is_food_ingredient(word):
            continue
        # Apply alias mapping
        canonical = ALIAS_MAP.get(word, word)
        if canonical not in IGNORE_ITEMS:
            result.add(canonical)
    
    return result

def extract_ingredient_names(ingredients_list: List[str]) -> Set[str]:
    """Extract normalized ingredient names from ingredient list"""
    names = set()
    for ingredient in ingredients_list:
        if not ingredient:
            continue
        ingredient_lower = normalize_text(ingredient)
        
        # Check for forbidden ingredients (exact match or contains)
        for forbidden in FORBIDDEN_INGREDIENTS:
            if forbidden in ingredient_lower:
                names.add(forbidden)
        
        # Remove quantities and units
        text = re.sub(r'\d+(?:\.\d+)?(?:/\d+)?', '', ingredient)
        text = re.sub(r'\b(?:cup|tbsp|tsp|oz|lb|gram|ml|kg)s?\b', '', text, flags=re.IGNORECASE)
        
        # Extract words
        tokens = tokenize_ingredients(text)
        names.update(tokens)
    
    return names

def extract_substitutions(description: str) -> List[Tuple[str, str]]:
    """Extract (new_ingredient, old_ingredient) substitution pairs from description"""
    if not description:
        return []
    
    substitutions = []
    desc_lower = normalize_text(description)
    
    for pattern in SUBSTITUTION_PATTERNS:
        matches = re.finditer(pattern, desc_lower)
        for match in matches:
            new_item = match.group(1).strip()
            old_item = match.group(2).strip()
            
            # Clean up
            new_words = [w for w in new_item.split() if is_food_ingredient(w)]
            old_words = [w for w in old_item.split() if is_food_ingredient(w)]
            
            new_item = ' '.join(new_words) if new_words else ''
            old_item = ' '.join(old_words) if old_words else ''
            
            if new_item and old_item and len(new_item) > 2 and len(old_item) > 2:
                # Apply aliases
                new_item = ALIAS_MAP.get(new_item, new_item)
                old_item = ALIAS_MAP.get(old_item, old_item)
                
                # Only include if both are actual food items
                if (new_item in CRITICAL_INGREDIENTS or old_item in CRITICAL_INGREDIENTS or
                    new_item not in IGNORE_ITEMS or old_item not in IGNORE_ITEMS):
                    substitutions.append((new_item, old_item))
    
    return substitutions

# ============================================================================
# CHECK A: Description ↔ Ingredients
# ============================================================================

def check_description_ingredients(recipe: Dict[str, Any]) -> List[Dict[str, str]]:
    """Check for description-ingredient inconsistencies"""
    issues = []
    
    description = recipe.get('description', '') or ''
    ingredients = recipe.get('ingredients', []) or []
    
    if not description:
        return issues
    
    ingredient_names = extract_ingredient_names(ingredients)
    substitutions = extract_substitutions(description)
    
    # Check substitution conflicts - only for actual food items
    for new_item, old_item in substitutions:
        # Only flag if these are recognized food ingredients
        if new_item in CRITICAL_INGREDIENTS or old_item in CRITICAL_INGREDIENTS:
            has_new = new_item in ingredient_names
            has_old = old_item in ingredient_names
            
            if has_old and not has_new:
                issues.append({
                    'code': 'DESC_SUB_CONFLICT',
                    'severity': 'P0',
                    'where': 'description+ingredients',
                    'evidence': f"Description says '{new_item} instead of {old_item}' but ingredients still contain '{old_item}'",
                    'fix': f"Replace {old_item} with {new_item} in ingredients list"
                })
    
    return issues

# ============================================================================
# CHECK B: Ingredients ↔ Instructions
# ============================================================================

def check_ingredients_instructions(recipe: Dict[str, Any]) -> List[Dict[str, str]]:
    """Check for ingredient-instruction inconsistencies"""
    issues = []
    
    ingredients = recipe.get('ingredients', []) or []
    instructions = recipe.get('instructions', '') or ''
    
    if not ingredients or not instructions:
        return issues
    
    ingredient_names = extract_ingredient_names(ingredients)
    instruction_mentions = tokenize_ingredients(instructions)
    
    # Find ghost ingredients (CRITICAL only)
    ghost = instruction_mentions - ingredient_names
    critical_ghost = ghost & CRITICAL_INGREDIENTS
    
    if critical_ghost:
        issues.append({
            'code': 'STEP_GHOST_ING',
            'severity': 'P0',
            'where': 'instructions',
            'evidence': f"Instructions mention '{', '.join(sorted(critical_ghost))}' not in ingredients",
            'fix': f"Add {', '.join(sorted(critical_ghost))} to ingredients or remove from instructions"
        })
    
    # Find unused ingredients (less critical)
    unused = ingredient_names - instruction_mentions
    unused = {i for i in unused if i not in IGNORE_ITEMS and len(i) > 4}
    
    if unused and len(unused) <= 3:
        issues.append({
            'code': 'ING_UNUSED',
            'severity': 'P1',
            'where': 'ingredients+instructions',
            'evidence': f"Ingredients possibly not used in instructions: {', '.join(sorted(unused))}",
            'fix': f"Verify {', '.join(sorted(unused))} is used in instructions or remove from ingredients"
        })
    
    return issues

# ============================================================================
# CHECK C: Image ↔ Recipe
# ============================================================================

def check_image_recipe(recipe: Dict[str, Any]) -> List[Dict[str, str]]:
    """Check for image-recipe inconsistencies (lightweight heuristics)"""
    issues = []
    
    name = recipe.get('name', '') or ''
    image_url = recipe.get('image_url', '') or ''
    ingredients = recipe.get('ingredients', []) or []
    
    if not image_url:
        issues.append({
            'code': 'IMG_MISSING',
            'severity': 'P1',
            'where': 'image',
            'evidence': 'No image URL',
            'fix': 'Add image for recipe'
        })
        return issues
    
    # Extract filename
    filename = os.path.basename(image_url).lower()
    filename_base = os.path.splitext(filename)[0]
    
    # Check if generic timestamp filename
    if filename.startswith('image_') and filename_base.replace('image_', '').replace('_', '').isdigit():
        issues.append({
            'code': 'IMG_GENERIC_NAME',
            'severity': 'P2',
            'where': 'image',
            'evidence': f"Generic image filename: {filename}",
            'fix': f"Verify image matches recipe visually"
        })
    
    # Check for conflicting ingredients in filename
    ingredient_names = extract_ingredient_names(ingredients)
    filename_words = set(re.findall(r'[a-z]+', filename_base))
    
    # Common conflicting pairs for low-glycemic recipes
    conflicts = [
        (['potato', 'potatoes'], ['zucchini', 'cauliflower']),
        (['rice'], ['cauliflower', 'quinoa']),
        (['pasta'], ['zucchini', 'spaghetti']),
        (['bread'], ['lettuce', 'almond']),
    ]
    
    for high_gi, low_gi in conflicts:
        has_high_in_filename = any(word in filename_words for word in high_gi)
        has_low_in_ingredients = any(ing in ingredient_names for ing in low_gi)
        has_high_in_ingredients = any(ing in ingredient_names for ing in high_gi)
        
        if has_high_in_filename and has_low_in_ingredients and not has_high_in_ingredients:
            issues.append({
                'code': 'IMG_META_MISMATCH',
                'severity': 'P0',
                'where': 'image',
                'evidence': f"Image filename suggests '{', '.join(high_gi)}' but recipe uses '{', '.join([i for i in low_gi if i in ingredient_names])}'",
                'fix': f"Replace image - should show {', '.join([i for i in low_gi if i in ingredient_names])} not {', '.join(high_gi)}"
            })
    
    return issues

# ============================================================================
# CHECK D: Critical Substitutions (Low-GI Compliance)
# ============================================================================

def check_critical_substitutions(recipe: Dict[str, Any]) -> List[Dict[str, str]]:
    """Check if recipe uses forbidden high-GI ingredients instead of allowed alternatives"""
    issues = []
    
    ingredients = recipe.get('ingredients', []) or []
    instructions = recipe.get('instructions', '') or ''
    
    # Combine ingredients and instructions for comprehensive check (NEVER descriptions)
    all_text = ' '.join(ingredients) + ' ' + instructions
    all_text_lower = normalize_text(all_text)
    
    # Protected medical/health phrases that should NOT trigger violations
    protected_contexts = [
        'blood sugar',
        'blood sugar stabilization',
        'blood sugar levels',
        'blood sugar control',
        'blood sugar spike',
        'blood sugar management',
    ]
    
    # Check each substitution category
    for category, rules in CRITICAL_SUBSTITUTIONS.items():
        forbidden_found = []
        
        # Check for forbidden ingredients
        for forbidden_item in rules['forbidden']:
            # Use word boundary to avoid partial matches
            pattern = r'\b' + re.escape(forbidden_item) + r'\b'
            matches = list(re.finditer(pattern, all_text_lower))
            
            for match in matches:
                # Check if this match is in a protected context
                is_protected = False
                
                # Get context around the match (50 chars before and after)
                context_start = max(0, match.start() - 50)
                context_end = min(len(all_text_lower), match.end() + 50)
                context = all_text_lower[context_start:context_end]
                
                # Check if any protected phrase appears in this context
                for protected in protected_contexts:
                    if protected in context:
                        is_protected = True
                        break
                
                # Only flag if not in protected context
                if not is_protected and forbidden_item not in forbidden_found:
                    forbidden_found.append(forbidden_item)
        
        # Flag if forbidden items found
        if forbidden_found:
            # Get suggested alternatives
            alternatives = ', '.join(rules['allowed'][:2])  # Show first 2 alternatives
            
            issues.append({
                'code': 'FORBIDDEN_INGREDIENT',
                'severity': 'P0',
                'where': f'ingredients+instructions ({category})',
                'evidence': f"Recipe contains forbidden {category}: {', '.join(forbidden_found)}",
                'fix': f"Replace with low-GI alternative: {alternatives}"
            })
    
    return issues

# ============================================================================
# MAIN CHECKER
# ============================================================================

def check_recipe(recipe: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Run all checks on a recipe and return list of issues"""
    all_issues = []
    
    # Run all checks
    all_issues.extend(check_description_ingredients(recipe))
    all_issues.extend(check_ingredients_instructions(recipe))
    all_issues.extend(check_image_recipe(recipe))
    all_issues.extend(check_critical_substitutions(recipe))
    
    # Add recipe metadata to each issue
    for issue in all_issues:
        issue['recipe_id'] = recipe['id']
        issue['title'] = recipe['name']
        issue['category'] = recipe.get('category', '')
        issue['updated_at'] = datetime.now().isoformat()
    
    return all_issues

def main():
    """Main function"""
    print("🔍 GlycoGuide Production Recipe Consistency Checker")
    print("=" * 70)
    
    # Connect to database
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ ERROR: DATABASE_URL not set")
        sys.exit(1)
    
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    
    # Fetch all recipes
    print("\n📥 Fetching recipes from database...")
    cursor.execute("""
        SELECT id, name, description, category, ingredients, instructions, image_url
        FROM meals
        ORDER BY name
    """)
    
    recipes = cursor.fetchall()
    print(f"✅ Found {len(recipes)} recipes")
    
    # Run checks
    print("\n🔎 Running consistency checks...")
    print("   ✓ Description ↔ Ingredients")
    print("   ✓ Ingredients ↔ Instructions")
    print("   ✓ Image ↔ Recipe content")
    print("   ✓ Critical substitutions (low-GI compliance)")
    
    all_issues = []
    
    for recipe in recipes:
        issues = check_recipe(dict(recipe))
        all_issues.extend(issues)
    
    # Sort by severity
    severity_order = {'P0': 0, 'P1': 1, 'P2': 2}
    all_issues.sort(key=lambda x: (severity_order.get(x['severity'], 3), x['title']))
    
    # Count by severity and issue type
    p0_count = len([i for i in all_issues if i['severity'] == 'P0'])
    p1_count = len([i for i in all_issues if i['severity'] == 'P1'])
    p2_count = len([i for i in all_issues if i['severity'] == 'P2'])
    
    forbidden_count = len([i for i in all_issues if i['code'] == 'FORBIDDEN_INGREDIENT'])
    ghost_count = len([i for i in all_issues if i['code'] == 'STEP_GHOST_ING'])
    
    # Generate CSV report
    output_file = 'scripts/audit_reports/recipe_consistency_report.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['severity', 'recipe_id', 'title', 'category', 'issue_code', 'where', 'evidence', 'suggested_fix', 'updated_at']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        for issue in all_issues:
            writer.writerow({
                'severity': issue['severity'],
                'recipe_id': issue['recipe_id'],
                'title': issue['title'],
                'category': issue['category'],
                'issue_code': issue['code'],
                'where': issue['where'],
                'evidence': issue['evidence'],
                'suggested_fix': issue['fix'],
                'updated_at': issue['updated_at']
            })
    
    # Print summary
    print("\n" + "=" * 70)
    print("📊 CONSISTENCY CHECK RESULTS")
    print("=" * 70)
    print(f"\n✅ Total recipes analyzed: {len(recipes)}")
    print(f"⚠️  Total issues found: {len(all_issues)}")
    print(f"\n🚨 P0 Critical: {p0_count}")
    print(f"   - Forbidden ingredients (low-GI violations): {forbidden_count}")
    print(f"   - Ghost ingredients in instructions: {ghost_count}")
    print(f"⚠️  P1 High: {p1_count}")
    print(f"📋 P2 Medium: {p2_count}")
    
    # Show P0 issues by type
    if p0_count > 0:
        print("\n" + "=" * 70)
        print("🚨 P0 CRITICAL ISSUES (Immediate Action Required)")
        print("=" * 70)
        
        # Show forbidden ingredients first
        forbidden_issues = [i for i in all_issues if i['code'] == 'FORBIDDEN_INGREDIENT']
        if forbidden_issues:
            print(f"\n🚫 FORBIDDEN INGREDIENTS ({len(forbidden_issues)} recipes)")
            print("   Low-GI violations - using high-glycemic items:")
            for i, issue in enumerate(forbidden_issues[:15], 1):
                print(f"\n{i}. {issue['title']} ({issue['category']})")
                print(f"   Issue: {issue['evidence']}")
                print(f"   Fix: {issue['fix']}")
            if len(forbidden_issues) > 15:
                print(f"\n... and {len(forbidden_issues) - 15} more forbidden ingredient issues")
        
        # Show ghost ingredients
        ghost_issues = [i for i in all_issues if i['code'] == 'STEP_GHOST_ING']
        if ghost_issues and len(ghost_issues) <= 10:
            print(f"\n👻 GHOST INGREDIENTS ({len(ghost_issues)} recipes)")
            for i, issue in enumerate(ghost_issues, 1):
                print(f"{i}. {issue['title']}: {issue['evidence']}")
    
    # Save report
    print(f"\n💾 Full CSV report saved to: {output_file}")
    print("   Open in Excel/Sheets for easy triage and filtering")
    
    cursor.close()
    conn.close()
    
    print("\n✅ Consistency check complete!\n")
    
    return 0 if p0_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
