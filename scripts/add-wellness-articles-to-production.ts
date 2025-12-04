import { db } from '../server/db';
import { educationContent } from '../shared/schema';
import educationContentJson from '../server/education-content-data.json';

async function addWellnessArticles() {
  try {
    console.log('🔍 Checking current education content in production...');
    
    const existing = await db.select().from(educationContent);
    console.log(`📊 Found ${existing.length} existing articles`);
    
    // Get the last 6 articles from our JSON (these are the wellness articles we just added)
    const wellnessArticles = educationContentJson.slice(13, 19);
    console.log(`📦 Wellness articles to add: ${wellnessArticles.length}`);
    
    // Check which ones are already in the database
    const existingIds = new Set(existing.map(a => a.id));
    const articlesToAdd = wellnessArticles.filter(a => !existingIds.has(a.id));
    
    if (articlesToAdd.length === 0) {
      console.log('✅ All wellness articles already exist in production!');
      return;
    }
    
    console.log(`➕ Adding ${articlesToAdd.length} new wellness articles...`);
    
    // Transform to match schema
    const transformedData = articlesToAdd.map((article: any) => ({
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
    
    // Insert
    await db.insert(educationContent).values(transformedData);
    
    console.log(`✅ Successfully added ${articlesToAdd.length} wellness articles!`);
    console.log('📚 Total articles now:', existing.length + articlesToAdd.length);
    
    // List what was added
    articlesToAdd.forEach((article: any) => {
      console.log(`  - ${article.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding wellness articles:', error);
    throw error;
  }
}

addWellnessArticles()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
