// data/moodToInsightMap.ts
// 🌿 GlycoGuide — Mood to Insight Mapping

import { insights } from "@/data/insights";

export const moodToInsightMap: Record<string, string[]> = {
  happy: ["Simplicity & Joy", "Kindness & Compassion"],
  calm: ["Mindfulness & Presence", "Simplicity & Joy"],
  sleepy: ["Patience & Timing", "Mindfulness & Presence"],
  sad: ["Kindness & Compassion", "Resilience & Growth"],
  anxious: ["Mindfulness & Presence", "Courage & Purpose"],
  angry: ["Change & Letting Go", "Wisdom & Perspective"],
  depressed: ["Resilience & Growth", "Kindness & Compassion"],
  lonely: ["Kindness & Compassion", "Wisdom & Perspective"],
  overwhelmed: ["Patience & Timing", "Change & Letting Go"],
  inspired: ["Courage & Purpose", "Simplicity & Joy"],
  frustrated: ["Change & Letting Go", "Wisdom & Perspective"],
  hopeful: ["Courage & Purpose", "Resilience & Growth"],
  bored: ["Simplicity & Joy", "Courage & Purpose"],
  neutral: ["Mindfulness & Presence", "Simplicity & Joy"],
  proud: ["Courage & Purpose", "Kindness & Compassion"],
  loved: ["Kindness & Compassion", "Simplicity & Joy"],
  grateful: ["Kindness & Compassion", "Simplicity & Joy"]
};

export function getInsightForMood(mood: string) {
  const themes = moodToInsightMap[mood.toLowerCase()];
  if (!themes) return insights[Math.floor(Math.random() * insights.length)];
  const matched = insights.filter((i) => themes.includes(i.theme));
  return matched[Math.floor(Math.random() * matched.length)];
}
