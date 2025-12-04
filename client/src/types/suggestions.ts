// Type definitions for smart suggestions
export interface SuggestionData {
  id: string;
  title: string;
  carbsG: number;
  fiberG: number;
  imageUrl: string;
}

export type TimeOfDay = 'breakfast' | 'lunch' | 'dinner';

export interface SuggestionContext {
  timeOfDay: TimeOfDay;
  carbsRemaining: number;
}

export interface SuggestionPlaceholders {
  timeOfDay: string;
  carbsRemaining: number;
  carbs: number;
  fiber: number;
}