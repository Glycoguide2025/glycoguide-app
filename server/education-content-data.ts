import educationContentJson from './education-content-data.json';

export const educationContentData = educationContentJson as Array<{
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  category: string;
  difficulty: string;
  estimated_duration_minutes: number;
  image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  is_pro: boolean;
  tags: string[] | null;
  prerequisites: string[] | null;
  learning_objectives: string[] | null;
  author: string | null;
  created_at: string;
  updated_at: string;
  quiz_questions: any;
}>;
