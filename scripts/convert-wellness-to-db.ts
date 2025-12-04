import wellnessArticles from '../client/src/data/wellness-articles.json';
import existingContent from '../server/education-content-original.json';
import { writeFileSync } from 'fs';

// Convert wellness articles to education content format
const convertedArticles = wellnessArticles.articles.slice(0, 6).map((article: any) => {
  // Build HTML content from sections
  let htmlContent = `<h2>Introduction</h2>\n<p>${article.content.introduction}</p>\n\n`;
  
  article.content.sections.forEach((section: any) => {
    htmlContent += `<h3>${section.heading}</h3>\n<p>${section.body}</p>\n\n`;
  });
  
  htmlContent += `<h3>Conclusion</h3>\n<p>${article.content.conclusion}</p>`;
  
  // Map section names to categories
  const categoryMap: Record<string, string> = {
    'Hydration': 'nutrition',
    'Mindfulness': 'mindful_eating',
    'Exercise': 'movement',
    'Energy Check-In': 'blood_sugar',
    'Digestive Health': 'nutrition',
    'Sleep': 'sleep_hygiene'
  };
  
  return {
    id: crypto.randomUUID(),
    title: article.title,
    description: article.content.introduction.substring(0, 200),
    content: htmlContent,
    type: 'article',
    category: categoryMap[article.section] || 'wellness',
    difficulty: 'beginner',
    estimated_duration_minutes: 10,
    image_url: null,
    video_url: null,
    audio_url: null,
    is_pro: false,
    tags: [article.section.toLowerCase()],
    prerequisites: null,
    learning_objectives: null,
    author: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    quiz_questions: null
  };
});

// Combine both
const allContent = [...existingContent, ...convertedArticles];

// Write back
writeFileSync('../server/education-content-data.json', JSON.stringify(allContent, null, 2));

console.log(`✅ Added ${convertedArticles.length} wellness articles to education-content-data.json`);
console.log(`📊 Total: ${allContent.length} articles`);
