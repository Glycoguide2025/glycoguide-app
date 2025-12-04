import { db } from '../server/db';
import { meals, mealLogs, mealPlanItems } from '../shared/schema';
import { mealsData } from '../server/meals-data';
import { sql } from 'drizzle-orm';

async function forceReseed() {
  try {
    console.log('[FORCE RESEED] Starting...');
    
    // Delete related data first (foreign key constraints)
    console.log('[FORCE RESEED] Deleting meal plan items...');
    await db.delete(mealPlanItems);
    console.log('[FORCE RESEED] ✅ Meal plan items deleted');
    
    console.log('[FORCE RESEED] Deleting meal logs...');
    await db.delete(mealLogs);
    console.log('[FORCE RESEED] ✅ Meal logs deleted');
    
    // Now delete meals
    console.log('[FORCE RESEED] Deleting all existing meals...');
    await db.delete(meals);
    console.log('[FORCE RESEED] ✅ All meals deleted');
    
    console.log(`[FORCE RESEED] Found ${mealsData.length} meals in JSON file`);
    
    // Transform data to match schema
    const transformedData = mealsData.map((meal: any) => ({
      id: meal.id,
      name: meal.name,
      description: meal.description,
      category: meal.category,
      glycemicIndex: meal.glycemic_index,
      glycemicValue: meal.glycemic_value,
      carbohydrates: meal.carbohydrates?.toString(),
      calories: meal.calories,
      protein: meal.protein?.toString(),
      fat: meal.fat?.toString(),
      fiber: meal.fiber?.toString(),
      imageUrl: meal.image_url,
      imageLocked: meal.image_locked,
      imageVersion: meal.image_version,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      prepTime: meal.prep_time_minutes,
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      await db.insert(meals).values(batch);
      console.log(`[FORCE RESEED] ✅ Inserted ${Math.min(i + batchSize, transformedData.length)}/${transformedData.length} meals`);
    }
    
    console.log('[FORCE RESEED] 🎉 Successfully reseeded all 570 meals!');
    process.exit(0);
  } catch (error) {
    console.error('[FORCE RESEED] ❌ Error:', error);
    process.exit(1);
  }
}

forceReseed();
