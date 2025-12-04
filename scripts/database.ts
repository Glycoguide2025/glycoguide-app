// Database connection helper for scripts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { meals } from '../shared/schema.js';

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
  }
  
  return { db, meals };
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  category: string;
  image_url: string;
  glycemic_index: string;
  glycemic_value?: number;
}

export async function fetchAllRecipes(): Promise<Recipe[]> {
  const { db, meals } = getDatabase();
  
  console.log('📡 Fetching all recipes from database...');
  const allRecipes = await db.select().from(meals);
  
  return allRecipes.map(meal => ({
    id: meal.id,
    name: meal.name,
    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
    category: meal.category || 'general',
    image_url: meal.imageUrl || '',
    glycemic_index: meal.glycemicIndex || 'low',
    glycemic_value: meal.glycemicValue || undefined
  }));
}

export async function updateMealImage(recipeId: string, newImageUrl: string): Promise<void> {
  const { db, meals } = getDatabase();
  const { eq } = await import('drizzle-orm');
  
  await db.update(meals)
    .set({ imageUrl: newImageUrl })
    .where(eq(meals.id, recipeId));
}