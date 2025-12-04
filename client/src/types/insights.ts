// Type definitions for insights with placeholder validation
export interface InsightType {
  post_meal_rise: {
    delta: number;
    mealName: string;
    carbs: number;
  };
  carb_budget_trend: {
    avgCarbs: number;
    dailyGoal: number;
  };
  evening_pattern: Record<string, never>; // No placeholders needed
}

export type InsightTypeName = keyof InsightType;

export interface InsightData {
  id: string;
  type: InsightTypeName;
  title: string;
  body: string;
  severity: 'info' | 'warn';
  mealId?: string;
  readingId?: string;
  createdAt?: string;
}

// Type-safe placeholder data for each insight type
export type InsightPlaceholders<T extends InsightTypeName> = InsightType[T];

// Validation that ensures placeholder types match the insight type
export type ValidatedInsight<T extends InsightTypeName> = {
  type: T;
  placeholders: InsightPlaceholders<T>;
};