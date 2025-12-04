import { db } from '../server/db';
import { meals, mealLogs, mealPlanItems } from '../shared/schema';
import { mealsData } from '../server/meals-data';

async function forceReseedProduction() {
  try {
    console.log('[PRODUCTION RESEED] Starting...');
    console.log('[PRODUCTION RESEED] Environment:', process.env.NODE_ENV);
    
    // Check current meal count
    const currentMeals = await db.select().from(meals);
    console.log(`[PRODUCTION RESEED] Current meals in database: ${currentMeals.length}`);
    console.log(`[PRODUCTION RESEED] Target meals from JSON: ${mealsData.length}`);
    
    if (currentMeals.length === mealsData.length) {
      console.log('[PRODUCTION RESEED] ✅ Database already has correct number of meals. Skipping.');
      process.exit(0);
    }
    
    // Delete related data first (foreign key constraints)
    console.log('[PRODUCTION RESEED] Deleting meal plan items...');
    await db.delete(mealPlanItems);
    console.log('[PRODUCTION RESEED] ✅ Meal plan items deleted');
    
    console.log('[PRODUCTION RESEED] Deleting meal logs...');
    await db.delete(mealLogs);
    console.log('[PRODUCTION RESEED] ✅ Meal logs deleted');
    
    // Now delete all meals
    console.log('[PRODUCTION RESEED] Deleting all existing meals...');
    await db.delete(meals);
    console.log('[PRODUCTION RESEED] ✅ All meals deleted');
    
    console.log(`[PRODUCTION RESEED] Importing ${mealsData.length} meals from JSON...`);
    
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
      console.log(`[PRODUCTION RESEED] ✅ Inserted ${Math.min(i + batchSize, transformedData.length)}/${transformedData.length} meals`);
    }
    
    console.log('[PRODUCTION RESEED] 🎉 Successfully reseeded production with all 570 meals!');
    
    // Verify final count
    const finalMeals = await db.select().from(meals);
    console.log(`[PRODUCTION RESEED] ✅ Final count: ${finalMeals.length} meals in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('[PRODUCTION RESEED] ❌ Error:', error);
    process.exit(1);
  }
}

forceReseedProduction();
