import { db } from '../server/db';
import { meals } from '@shared/schema';
import * as fs from 'fs';
import * as path from 'path';

async function seedMealsToProduction() {
  console.log('🌱 Seeding meals to production database...');
  
  try {
    // Check if meals already exist
    const existingMealsCount = await db.select().from(meals);
    
    if (existingMealsCount.length > 0) {
      console.log(`⚠️  Database already has ${existingMealsCount.length} meals`);
      console.log('Skipping seed to avoid duplicates.');
      console.log('If you want to re-seed, first run: DELETE FROM meals;');
      return;
    }
    
    // Load meals JSON data
    const mealsDataPath = path.join(__dirname, 'meals_data.json');
    const mealsData = JSON.parse(fs.readFileSync(mealsDataPath, 'utf-8'));
    
    console.log(`📦 Found ${mealsData.length} meals to import`);
    
    // Insert in batches of 50 for better performance
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < mealsData.length; i += batchSize) {
      const batch = mealsData.slice(i, i + batchSize);
      await db.insert(meals).values(batch);
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${mealsData.length} meals`);
    }
    
    console.log(`🎉 Successfully seeded ${inserted} meals to production!`);
    
  } catch (error) {
    console.error('❌ Error seeding meals:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedMealsToProduction();
