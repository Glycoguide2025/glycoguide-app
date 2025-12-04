import { db } from './db';
import { meals } from '@shared/schema';
import { mealsData } from './meals-data';

export async function seedProductionMeals() {
  try {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SEED] Skipping - not in production environment');
      return;
    }

    // Check if meals already exist
    const existingMealsCount = await db.select().from(meals);
    
    if (existingMealsCount.length > 0) {
      console.log(`[SEED] Production already has ${existingMealsCount.length} meals - skipping seed`);
      return;
    }

    console.log('[SEED] 🌱 Production meals table is empty - seeding now...');
    console.log(`[SEED] 📦 Found ${mealsData.length} meals to import`);
    
    // Transform data to match schema (snake_case to camelCase)
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
      console.log(`[SEED] ✅ Inserted ${Math.min(i + batchSize, transformedData.length)}/${transformedData.length} meals`);
    }
    
    console.log('[SEED] 🎉 Successfully seeded production with all meals!');
  } catch (error) {
    console.error('[SEED] ❌ Error seeding production meals:', error);
    // Don't throw - let the app start anyway
  }
}
