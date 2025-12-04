import { db } from './db';
import { educationContent } from '@shared/schema';
import { educationContentData } from './education-content-data';

export async function seedProductionEducation() {
  try {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SEED EDUCATION] Skipping - not in production environment');
      return;
    }

    // Check if education content already exists
    const existingContent = await db.select().from(educationContent);
    
    if (existingContent.length > 0) {
      console.log(`[SEED EDUCATION] Production already has ${existingContent.length} education articles - skipping seed`);
      return;
    }

    console.log('[SEED EDUCATION] 🌱 Production education_content table is empty - seeding now...');
    console.log(`[SEED EDUCATION] 📦 Found ${educationContentData.length} articles to import`);
    
    // Transform data to match schema (snake_case to camelCase)
    const transformedData = educationContentData.map((article: any) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      type: article.type,
      category: article.category,
      difficulty: article.difficulty,
      estimatedDurationMinutes: article.estimated_duration_minutes,
      imageUrl: article.image_url,
      videoUrl: article.video_url,
      audioUrl: article.audio_url,
      isPro: article.is_pro,
      tags: article.tags,
      prerequisites: article.prerequisites,
      learningObjectives: article.learning_objectives,
      author: article.author,
      quizQuestions: article.quiz_questions,
    }));
    
    // Insert all articles
    await db.insert(educationContent).values(transformedData);
    console.log(`[SEED EDUCATION] ✅ Inserted ${transformedData.length} education articles`);
    
    console.log('[SEED EDUCATION] 🎉 Successfully seeded production with all education content!');
  } catch (error) {
    console.error('[SEED EDUCATION] ❌ Error seeding production education content:', error);
    // Don't throw - let the app start anyway
  }
}
