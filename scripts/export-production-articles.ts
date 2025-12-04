import { db } from '../server/db';
import { educationContent } from '../shared/schema';
import { writeFileSync } from 'fs';

async function exportOriginal() {
  const articles = await db.select().from(educationContent);
  console.log('✅ Fetched', articles.length, 'articles from production');
  
  // Convert to the JSON format (camelCase to snake_case)
  const jsonFormat = articles.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    content: a.content,
    type: a.type,
    category: a.category,
    difficulty: a.difficulty,
    estimated_duration_minutes: a.estimatedDurationMinutes,
    image_url: a.imageUrl,
    video_url: a.videoUrl,
    audio_url: a.audioUrl,
    is_pro: a.isPro,
    tags: a.tags,
    prerequisites: a.prerequisites,
    learning_objectives: a.learningObjectives,
    author: a.author,
    quiz_questions: a.quizQuestions,
    created_at: a.createdAt,
    updated_at: a.updatedAt
  }));
  
  writeFileSync('./server/education-content-original.json', JSON.stringify(jsonFormat, null, 2));
  console.log('💾 Saved to education-content-original.json');
  process.exit(0);
}

exportOriginal().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
