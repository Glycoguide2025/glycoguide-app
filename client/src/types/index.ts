export interface DailyStats {
  totalCarbs: number;
  totalMeals: number;
  averageGlucose: number;
  exerciseMinutes: number;
}

export interface MealWithDetails {
  id: string;
  name: string;
  description?: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  glycemicIndex: 'low' | 'medium' | 'high';
  glycemicValue?: number;
  carbohydrates?: string;
  calories?: number;
  protein?: string;
  fat?: string;
  fiber?: string;
  imageUrl?: string;
  imageLocked?: boolean;
  imageVersion?: number;
  ingredients?: string[];
  instructions?: string;
  prepTime?: number;
}

export interface MealLogWithMeal {
  id: string;
  userId: string;
  mealId?: string;
  meal?: MealWithDetails;
  customMealName?: string;
  customCarbs?: string;
  customCalories?: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: string;
  notes?: string;
}

export interface GlucoseLevel {
  value: number;
  timestamp: Date;
  category?: 'normal' | 'high' | 'critical';
}
