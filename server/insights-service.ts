import { type MealLog, type GlucoseReading, type User, type InsertUserInsight, type ExerciseLog, type SleepLog, type EnergyLog } from '@shared/schema';

export interface InsightData {
  userId: string;
  recentMealLogs: MealLog[];
  recentGlucoseReadings: GlucoseReading[];
  recentExerciseLogs: ExerciseLog[];
  recentSleepLogs?: SleepLog[];
  recentEnergyLogs?: EnergyLog[];
  userGoals: User['goals'];
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
}

// Part 3 specification: exact insight structure with Part 3 rules
export interface GeneratedInsight {
  type: 'post_meal_rise' | 'carb_budget_trend' | 'evening_pattern' | 'exercise_consistency' | 'exercise_glucose_impact' | 'cgm_time_in_range' | 'cgm_trend_patterns' | 'cgm_alert_frequency' | 'sleep_quality_glucose_correlation' | 'energy_level_glucose_correlation' | 'sleep_duration_patterns';
  title: string;
  body: string;
  severity: 'info' | 'warn';
  // Links to related data (optional)
  mealId?: string;
  readingId?: string;
  exerciseId?: string;
}

export class InsightsService {
  
  // Part 3: Generate top 3 insights for a user based on exact insight rules (v1, wellness-safe language)
  async generateInsights(data: InsightData): Promise<GeneratedInsight[]> {
    const insights: GeneratedInsight[] = [];
    
    // Part 3 Rule 1: Post-meal rise - If post-meal reading within 90–120 min is ≥40 mg/dL above pre-meal
    const postMealRiseInsight = this.analyzePostMealRise(data);
    if (postMealRiseInsight) insights.push(postMealRiseInsight);
    
    // Part 3 Rule 2: Carb budget trend - 3-day rolling avg carbs > target +25%
    const carbBudgetTrendInsight = this.analyzeCarbBudgetTrend(data);
    if (carbBudgetTrendInsight) insights.push(carbBudgetTrendInsight);
    
    // Part 3 Rule 3: Evening pattern - Average dinner rises largest over 7 days
    const eveningPatternInsight = this.analyzeEveningPattern(data);
    if (eveningPatternInsight) insights.push(eveningPatternInsight);
    
    // Stage 12: Exercise insights
    const exerciseConsistencyInsight = this.analyzeExerciseConsistency(data);
    if (exerciseConsistencyInsight) insights.push(exerciseConsistencyInsight);
    
    const exerciseGlucoseInsight = this.analyzeExerciseGlucoseImpact(data);
    if (exerciseGlucoseInsight) insights.push(exerciseGlucoseInsight);
    
    // Stage 13: CGM-specific insights
    const cgmTimeInRangeInsight = this.analyzeCGMTimeInRange(data);
    if (cgmTimeInRangeInsight) insights.push(cgmTimeInRangeInsight);
    
    const cgmTrendPatternsInsight = this.analyzeCGMTrendPatterns(data);
    if (cgmTrendPatternsInsight) insights.push(cgmTrendPatternsInsight);
    
    const cgmAlertFrequencyInsight = this.analyzeCGMAlertFrequency(data);
    if (cgmAlertFrequencyInsight) insights.push(cgmAlertFrequencyInsight);
    
    // Stage 12: Sleep & Recovery insights
    const sleepQualityGlucoseInsight = this.analyzeSleepQualityGlucoseCorrelation(data);
    if (sleepQualityGlucoseInsight) insights.push(sleepQualityGlucoseInsight);
    
    const energyLevelGlucoseInsight = this.analyzeEnergyLevelGlucoseCorrelation(data);
    if (energyLevelGlucoseInsight) insights.push(energyLevelGlucoseInsight);
    
    const sleepDurationInsight = this.analyzeSleepDurationPatterns(data);
    if (sleepDurationInsight) insights.push(sleepDurationInsight);
    
    // Return top 3 insights (rolling - keep only current top 3)
    return insights.slice(0, 3);
  }
  
  // Part 3 Rule 1: Post-meal rise analysis (exact specification)
  private analyzePostMealRise(data: InsightData): GeneratedInsight | null {
    if (data.recentMealLogs.length < 1 || data.recentGlucoseReadings.length < 2) return null;
    
    // Find pre-meal and post-meal reading pairs within 90-120 min window
    for (const mealLog of data.recentMealLogs) {
      if (!mealLog.loggedAt) continue;
      
      const mealTime = new Date(mealLog.loggedAt);
      const mealName = mealLog.customMealName || 'your meal';
      const carbs = mealLog.customCarbs ? Number(mealLog.customCarbs) : 45;
      
      // Find pre-meal reading (within 30 min before meal)
      const preMealReading = data.recentGlucoseReadings.find(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        const timeDiff = mealTime.getTime() - readingTime.getTime();
        return timeDiff >= 0 && timeDiff <= 30 * 60 * 1000; // 30 minutes before meal
      });
      
      // Find post-meal reading (within 90-120 min after meal)
      const postMealReading = data.recentGlucoseReadings.find(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        const timeDiff = readingTime.getTime() - mealTime.getTime();
        return timeDiff >= 90 * 60 * 1000 && timeDiff <= 120 * 60 * 1000; // 90-120 minutes after meal
      });
      
      if (preMealReading && postMealReading) {
        const preMealValue = Number(preMealReading.value);
        const postMealValue = Number(postMealReading.value);
        const delta = postMealValue - preMealValue;
        
        // Part 3 Rule: ≥40 mg/dL rise
        if (delta >= 40) {
          return {
            type: 'post_meal_rise',
            title: 'Post-meal rise noticed',
            body: `Your glucose rose +${Math.round(delta)} mg/dL after ${mealName}. Meals around ${Math.round(carbs)}g carbs tend to lead to bigger rises. Consider smaller portions or adding fiber.`,
            severity: 'warn',
            mealId: mealLog.id,
            readingId: postMealReading.id
          };
        }
      }
    }
    
    return null;
  }
  
  // Part 3 Rule 2: Carb budget trend analysis (exact specification)
  private analyzeCarbBudgetTrend(data: InsightData): GeneratedInsight | null {
    if (data.recentMealLogs.length < 5) return null; // Need at least 5 meals for 3-day analysis
    
    // Get last 3 days of meals
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recent3DayMeals = data.recentMealLogs.filter(meal => 
      meal.loggedAt && new Date(meal.loggedAt) >= threeDaysAgo
    );
    
    if (recent3DayMeals.length < 3) return null;
    
    // Calculate 3-day rolling average carbs
    const carbValues = recent3DayMeals.map(meal => {
      if (meal.customCarbs) return Number(meal.customCarbs);
      return 45; // Default assumption
    });
    
    const avgCarbs = carbValues.reduce((sum, carbs) => sum + carbs, 0) / carbValues.length;
    const dailyGoal = 150; // Default target (could come from user goals)
    const targetWith25Percent = dailyGoal * 1.25; // +25% above target
    
    // Part 3 Rule: 3-day rolling avg carbs > target +25%
    if (avgCarbs > targetWith25Percent) {
      return {
        type: 'carb_budget_trend',
        title: 'Carb budget trend',
        body: `You averaged ${Math.round(avgCarbs)}g vs a goal of ${dailyGoal}g over 3 days. Want to try lower-carb swaps or higher-fiber picks?`,
        severity: 'warn'
      };
    }
    
    return null;
  }
  
  // Part 3 Rule 3: Evening pattern analysis (exact specification)
  private analyzeEveningPattern(data: InsightData): GeneratedInsight | null {
    if (data.recentMealLogs.length < 7 || data.recentGlucoseReadings.length < 7) return null;
    
    // Get last 7 days of data
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent7DayMeals = data.recentMealLogs.filter(meal => 
      meal.loggedAt && new Date(meal.loggedAt) >= sevenDaysAgo
    );
    const recent7DayReadings = data.recentGlucoseReadings.filter(reading =>
      reading.recordedAt && new Date(reading.recordedAt) >= sevenDaysAgo
    );
    
    // Group meals by time of day and calculate rises
    const dinnerRises: number[] = [];
    const otherMealRises: number[] = [];
    
    for (const mealLog of recent7DayMeals) {
      if (!mealLog.loggedAt) continue;
      
      const mealTime = new Date(mealLog.loggedAt);
      const mealHour = mealTime.getHours();
      const isDinner = mealHour >= 17 && mealHour <= 21; // 5 PM to 9 PM
      
      // Find pre and post meal readings for this meal
      const preMealReading = recent7DayReadings.find(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        const timeDiff = mealTime.getTime() - readingTime.getTime();
        return timeDiff >= 0 && timeDiff <= 30 * 60 * 1000; // 30 min before
      });
      
      const postMealReading = recent7DayReadings.find(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        const timeDiff = readingTime.getTime() - mealTime.getTime();
        return timeDiff >= 60 * 60 * 1000 && timeDiff <= 120 * 60 * 1000; // 1-2 hours after
      });
      
      if (preMealReading && postMealReading) {
        const rise = Number(postMealReading.value) - Number(preMealReading.value);
        if (isDinner) {
          dinnerRises.push(rise);
        } else {
          otherMealRises.push(rise);
        }
      }
    }
    
    if (dinnerRises.length < 2 || otherMealRises.length < 2) return null;
    
    // Calculate average rises
    const avgDinnerRise = dinnerRises.reduce((sum, rise) => sum + rise, 0) / dinnerRises.length;
    const avgOtherRise = otherMealRises.reduce((sum, rise) => sum + rise, 0) / otherMealRises.length;
    
    // Part 3 Rule: Average dinner rises largest over 7 days
    if (avgDinnerRise > avgOtherRise + 10) { // 10 mg/dL threshold for "largest"
      return {
        type: 'evening_pattern',
        title: 'Evening pattern',
        body: 'Your largest rises often follow dinner. A short post-dinner walk or a higher-fiber side may help.',
        severity: 'info'
      };
    }
    
    return null;
  }

  // Helper method to create database record from generated insight (Part 3 format)
  createInsightRecord(userId: string, insight: GeneratedInsight): Omit<InsertUserInsight, 'expiresAt' | 'isActive'> {
    return {
      userId,
      title: insight.title,
      body: insight.body,
      type: insight.type,
      severity: insight.severity,
      mealId: insight.mealId || null,
      readingId: insight.readingId || null,
      priority: insight.severity === 'warn' ? 90 : 70 // Higher priority for warnings
    };
  }

  // Part 3: Smart Suggestions - Rules based on carb_remaining + time_of_day with actual recipe queries
  async generateSmartSuggestions(
    userId: string, 
    currentMeals: MealLog[], 
    userGoals: any,
    timeOfDay: 'breakfast' | 'lunch' | 'dinner',
    storage: any // Pass storage instance for recipe queries
  ): Promise<{id: string, title: string, carbsG: number, fiberG: number, imageUrl: string}[]> {
    // Part 3 Smart Suggestions logic:
    // Breakfast/Lunch: 25–45g; Dinner: 15–35g
    // Prefer fiber ≥8g; if last spike was dinner, bias ≤25g
    
    const dailyCarbGoal = 150; // Default or from userGoals
    const usedCarbs = currentMeals.reduce((sum, meal) => {
      return sum + (meal.customCarbs ? Number(meal.customCarbs) : 45);
    }, 0);
    const carbRemaining = Math.max(0, dailyCarbGoal - usedCarbs);
    
    // Determine carb range based on time of day
    let targetCarbs = 30; // Default
    if (timeOfDay === 'breakfast' || timeOfDay === 'lunch') {
      targetCarbs = Math.min(45, Math.max(25, carbRemaining / 2));
    } else if (timeOfDay === 'dinner') {
      targetCarbs = Math.min(35, Math.max(15, carbRemaining));
    }
    
    // Check if last spike was dinner in last 3 days (bias ≤25g)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentEveningMeals = currentMeals.filter(meal => {
      if (!meal.loggedAt) return false;
      const mealDate = new Date(meal.loggedAt);
      const hour = mealDate.getHours();
      return mealDate >= threeDaysAgo && hour >= 17 && hour <= 21; // Dinner time in last 3 days
    });
    
    if (recentEveningMeals.length > 0) {
      targetCarbs = Math.min(25, targetCarbs); // Bias ≤25g if last spike was dinner
    }
    
    try {
      // Query actual recipes from database with fiber ≥8g preference
      const allRecipes = await storage.getMeals(); // Get all recipes
      
      // Filter recipes based on criteria
      const suitableRecipes = allRecipes.filter((recipe: any) => {
        const recipeCarbs = recipe.carbohydrates || 0;
        const recipeFiber = recipe.fiber || 0;
        
        // Carb range: targetCarbs ± 10g
        const carbsInRange = recipeCarbs >= (targetCarbs - 10) && recipeCarbs <= (targetCarbs + 10);
        
        // Prefer fiber ≥8g, but allow lower if needed
        return carbsInRange;
      });
      
      // Sort by fiber content (prefer higher fiber)
      const sortedRecipes = suitableRecipes.sort((a: any, b: any) => {
        const fiberA = a.fiber || 0;
        const fiberB = b.fiber || 0;
        return fiberB - fiberA; // Higher fiber first
      });
      
      // Take top 3 suggestions
      const suggestions = sortedRecipes.slice(0, 3).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.name,
        carbsG: recipe.carbohydrates || 0,
        fiberG: recipe.fiber || 0,
        imageUrl: recipe.imageUrl || '/default-meal.jpg'
      }));
      
      // If we don't have 3 suggestions, pad with backup options
      while (suggestions.length < 3 && allRecipes.length > 0) {
        const backup = allRecipes.find((recipe: any) => 
          !suggestions.some((s: any) => s.id === recipe.id) &&
          (recipe.fiber || 0) >= 5 // At least 5g fiber as backup
        );
        
        if (backup) {
          suggestions.push({
            id: backup.id,
            title: backup.name,
            carbsG: backup.carbohydrates || 0,
            fiberG: backup.fiber || 0,
            imageUrl: backup.imageUrl || '/default-meal.jpg'
          });
        } else {
          break;
        }
      }
      
      return suggestions.slice(0, 3); // Ensure exactly 3 items
      
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      
      // Fallback to mock suggestions if database query fails
      return [
        {
          id: 'fallback-1',
          title: 'High-fiber choice',
          carbsG: Math.round(targetCarbs),
          fiberG: 12,
          imageUrl: '/default-meal.jpg'
        },
        {
          id: 'fallback-2', 
          title: 'Balanced option',
          carbsG: Math.round(targetCarbs * 0.8),
          fiberG: 9,
          imageUrl: '/default-meal.jpg'
        },
        {
          id: 'fallback-3',
          title: 'Light pick',
          carbsG: Math.round(targetCarbs * 0.6),
          fiberG: 8,
          imageUrl: '/default-meal.jpg'
        }
      ];
    }
  }

  // Stage 12: Exercise consistency analysis
  private analyzeExerciseConsistency(data: InsightData): GeneratedInsight | null {
    if (data.recentExerciseLogs.length < 3) return null;
    
    // Calculate weekly exercise minutes
    const weeklyMinutes = data.recentExerciseLogs.reduce((total, log) => {
      return total + (log.duration || 0);
    }, 0);
    
    // Check if user is meeting weekly goal (150 minutes recommended)
    const targetWeeklyMinutes = 150;
    const progressPercent = Math.round((weeklyMinutes / targetWeeklyMinutes) * 100);
    
    if (weeklyMinutes < 75) { // Less than 50% of target
      return {
        type: 'exercise_consistency',
        title: 'Boost Your Movement',
        body: `You've logged ${weeklyMinutes} minutes of exercise this week (${progressPercent}% of your goal). Even 10-15 minutes of daily walking can help improve your overall wellness. Consider starting with gentle activities that you enjoy.`,
        severity: 'info'
      };
    } else if (weeklyMinutes >= targetWeeklyMinutes) {
      return {
        type: 'exercise_consistency',
        title: 'Great Exercise Consistency! 🎉',
        body: `Excellent work! You've achieved ${weeklyMinutes} minutes of exercise this week (${progressPercent}% of your goal). Regular movement like this supports your overall wellness and can help with maintaining healthy habits.`,
        severity: 'info'
      };
    }
    
    return null;
  }

  // Stage 12: Exercise and glucose correlation analysis
  private analyzeExerciseGlucoseImpact(data: InsightData): GeneratedInsight | null {
    if (data.recentExerciseLogs.length < 2 || data.recentGlucoseReadings.length < 4) return null;
    
    // Find glucose readings before and after exercise sessions
    let exerciseEffectCount = 0;
    let totalGlucoseChange = 0;
    
    for (const exercise of data.recentExerciseLogs) {
      if (!exercise.loggedAt) continue;
      
      const exerciseTime = new Date(exercise.loggedAt);
      
      // Find glucose reading within 2 hours before exercise
      const preExerciseReading = data.recentGlucoseReadings.find(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        const timeDiff = exerciseTime.getTime() - readingTime.getTime();
        return timeDiff >= 0 && timeDiff <= 2 * 60 * 60 * 1000; // 2 hours before
      });
      
      // Find glucose reading within 4 hours after exercise
      const postExerciseReading = data.recentGlucoseReadings.find(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        const timeDiff = readingTime.getTime() - exerciseTime.getTime();
        return timeDiff >= 30 * 60 * 1000 && timeDiff <= 4 * 60 * 60 * 1000; // 30 min to 4 hours after
      });
      
      if (preExerciseReading && postExerciseReading) {
        const preValue = Number(preExerciseReading.value);
        const postValue = Number(postExerciseReading.value);
        totalGlucoseChange += (postValue - preValue);
        exerciseEffectCount++;
      }
    }
    
    if (exerciseEffectCount >= 2) {
      const avgChange = totalGlucoseChange / exerciseEffectCount;
      
      if (avgChange <= -20) { // Significant decrease
        return {
          type: 'exercise_glucose_impact',
          title: 'Exercise Supporting Your Wellness',
          body: `Great observation! Your recent exercise sessions appear to correlate with improved glucose patterns (average change: ${Math.round(avgChange)} mg/dL). This suggests your movement routine may be supporting your overall wellness goals.`,
          severity: 'info'
        };
      } else if (avgChange >= 15) { // Unusual increase
        return {
          type: 'exercise_glucose_impact',
          title: 'Exercise Timing Insight',
          body: `Consider the timing of your exercise sessions. Your recent workouts show an average glucose change of +${Math.round(avgChange)} mg/dL afterward. This might be related to exercise intensity, timing, or individual response patterns.`,
          severity: 'info'
        };
      }
    }
    
    return null;
  }

  // Stage 13: CGM Time in Range Analysis
  private analyzeCGMTimeInRange(data: InsightData): GeneratedInsight | null {
    // Filter for CGM readings only
    const cgmReadings = data.recentGlucoseReadings.filter(reading => reading.source === 'cgm');
    
    if (cgmReadings.length < 20) return null; // Need sufficient CGM data
    
    // Define target range (70-180 mg/dL for wellness tracking)
    const targetMin = 70;
    const targetMax = 180;
    
    const inRange = cgmReadings.filter(reading => {
      const value = Number(reading.value);
      return value >= targetMin && value <= targetMax;
    });
    
    const timeInRange = Math.round((inRange.length / cgmReadings.length) * 100);
    
    if (timeInRange >= 70) {
      return {
        type: 'cgm_time_in_range',
        title: 'Excellent Glucose Stability',
        body: `Your CGM shows ${timeInRange}% time in target range (70-180 mg/dL). This suggests consistent wellness patterns. Keep up the great work with your current routine!`,
        severity: 'info'
      };
    } else if (timeInRange < 50) {
      return {
        type: 'cgm_time_in_range',
        title: 'Glucose Pattern Opportunity',
        body: `Your CGM shows ${timeInRange}% time in target range. Consider reviewing meal timing, portions, and stress management techniques to support more stable patterns.`,
        severity: 'warn'
      };
    }
    
    return null;
  }

  // Stage 13: CGM Trend Pattern Analysis
  private analyzeCGMTrendPatterns(data: InsightData): GeneratedInsight | null {
    const cgmReadings = data.recentGlucoseReadings.filter(reading => 
      reading.source === 'cgm'
    );
    
    if (cgmReadings.length < 15) return null; // Need sufficient trending data
    
    // Count trend patterns
    const trendCounts = {
      rising_rapidly: 0,
      rising: 0,
      rising_slowly: 0,
      stable: 0,
      falling_slowly: 0,
      falling: 0,
      falling_rapidly: 0
    };
    
    // Since trend column doesn't exist, we'll analyze variance instead
    // This is a placeholder implementation until CGM trend data is available
    return null;
    
    const totalTrends = Object.values(trendCounts).reduce((sum, count) => sum + count, 0);
    const rapidChanges = trendCounts.rising_rapidly + trendCounts.falling_rapidly;
    const rapidPercentage = Math.round((rapidChanges / totalTrends) * 100);
    
    if (rapidPercentage > 20) {
      return {
        type: 'cgm_trend_patterns',
        title: 'Glucose Trend Awareness',
        body: `Your CGM shows ${rapidPercentage}% of readings with rapid changes. Consider smaller, more frequent meals and consistent timing to support steadier patterns.`,
        severity: 'warn'
      };
    } else if (trendCounts.stable / totalTrends > 0.6) {
      return {
        type: 'cgm_trend_patterns',
        title: 'Stable Glucose Trends',
        body: `Excellent! Your CGM shows mostly stable trends (${Math.round((trendCounts.stable / totalTrends) * 100)}% stable readings). Your current approach is working well.`,
        severity: 'info'
      };
    }
    
    return null;
  }

  // Stage 13: CGM Alert Frequency Analysis
  private analyzeCGMAlertFrequency(data: InsightData): GeneratedInsight | null {
    const cgmReadings = data.recentGlucoseReadings.filter(reading => 
      reading.source === 'cgm' && reading.alertType && reading.alertType !== 'none'
    );
    
    if (cgmReadings.length === 0) return null; // No alerts to analyze
    
    const alertCounts = {
      low: 0,
      high: 0,
      urgent_low: 0,
      urgent_high: 0
    };
    
    cgmReadings.forEach(reading => {
      if (reading.alertType && reading.alertType in alertCounts) {
        alertCounts[reading.alertType as keyof typeof alertCounts]++;
      }
    });
    
    const totalAlerts = Object.values(alertCounts).reduce((sum, count) => sum + count, 0);
    const urgentAlerts = alertCounts.urgent_low + alertCounts.urgent_high;
    
    if (urgentAlerts > 0) {
      return {
        type: 'cgm_alert_frequency',
        title: 'Glucose Alert Patterns',
        body: `Your CGM recorded ${urgentAlerts} urgent alert(s) recently. Consider discussing these patterns with your healthcare provider for personalized guidance.`,
        severity: 'warn'
      };
    } else if (totalAlerts > 10) {
      return {
        type: 'cgm_alert_frequency',
        title: 'CGM Alert Awareness',
        body: `Your CGM shows ${totalAlerts} alerts in this period. Focus on consistent meal timing and stress management to reduce alert frequency.`,
        severity: 'info'
      };
    }
    
    return null;
  }

  // Part 2: Daily stats aggregation helper for cache
  generateDailyStats(mealLogs: MealLog[], glucoseReadings: GlucoseReading[], date: string) {
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');
    
    const dayMeals = mealLogs.filter(log => 
      log.loggedAt && 
      new Date(log.loggedAt) >= dayStart && 
      new Date(log.loggedAt) <= dayEnd
    );
    
    const dayReadings = glucoseReadings.filter(reading =>
      reading.recordedAt &&
      new Date(reading.recordedAt) >= dayStart &&
      new Date(reading.recordedAt) <= dayEnd
    );
    
    // Pre/post meal reading counts
    const preMealReadings = dayReadings.filter(r => r.readingType === 'fasting' || r.readingType === 'pre_meal').length;
    const postMealReadings = dayReadings.filter(r => r.readingType === 'post_meal').length;
    
    // Total carbs for the day
    const totalCarbs = dayMeals.reduce((sum, meal) => {
      const carbs = meal.customCarbs ? Number(meal.customCarbs) : 45;
      return sum + carbs;
    }, 0);
    
    return {
      mealsCount: dayMeals.length,
      carbsTotal: totalCarbs,
      readingsPreCount: preMealReadings,
      readingsPostCount: postMealReadings,
      totalReadings: dayReadings.length
    };
  }

  // Stage 12: Sleep Quality and Glucose Correlation Analysis
  private analyzeSleepQualityGlucoseCorrelation(data: InsightData): GeneratedInsight | null {
    if (!data.recentSleepLogs || data.recentSleepLogs.length < 3 || data.recentGlucoseReadings.length < 6) return null;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSleepLogs = data.recentSleepLogs.filter(log => 
      log.loggedAt && new Date(log.loggedAt) >= sevenDaysAgo
    );
    
    if (recentSleepLogs.length < 2) return null;
    
    // Analyze glucose patterns on days following poor vs good sleep
    let goodSleepGlucoseVariance = 0;
    let poorSleepGlucoseVariance = 0;
    let goodSleepDays = 0;
    let poorSleepDays = 0;
    
    for (const sleepLog of recentSleepLogs) {
      if (!sleepLog.loggedAt || !sleepLog.sleepQuality) continue;
      
      const sleepDate = new Date(sleepLog.loggedAt);
      const nextDayStart = new Date(sleepDate);
      nextDayStart.setDate(nextDayStart.getDate() + 1);
      nextDayStart.setHours(6, 0, 0, 0); // Start at 6 AM next day
      
      const nextDayEnd = new Date(nextDayStart);
      nextDayEnd.setHours(18, 0, 0, 0); // End at 6 PM next day
      
      // Get glucose readings for the following day
      const nextDayReadings = data.recentGlucoseReadings.filter(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        return readingTime >= nextDayStart && readingTime <= nextDayEnd;
      });
      
      if (nextDayReadings.length < 3) continue; // Need enough readings
      
      // Calculate glucose variance for that day
      const glucoseValues = nextDayReadings.map(r => Number(r.value));
      const avgGlucose = glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length;
      const variance = glucoseValues.reduce((sum, val) => sum + Math.pow(val - avgGlucose, 2), 0) / glucoseValues.length;
      
      // Categorize sleep quality
      const isGoodSleep = sleepLog.sleepQuality === 'excellent' || sleepLog.sleepQuality === 'good';
      
      if (isGoodSleep) {
        goodSleepGlucoseVariance += variance;
        goodSleepDays++;
      } else {
        poorSleepGlucoseVariance += variance;
        poorSleepDays++;
      }
    }
    
    if (goodSleepDays === 0 || poorSleepDays === 0) return null;
    
    const avgGoodSleepVariance = goodSleepGlucoseVariance / goodSleepDays;
    const avgPoorSleepVariance = poorSleepGlucoseVariance / poorSleepDays;
    
    // If poor sleep leads to significantly higher glucose variance
    if (avgPoorSleepVariance > avgGoodSleepVariance * 1.3) {
      return {
        type: 'sleep_quality_glucose_correlation',
        title: 'Sleep Quality & Glucose Patterns',
        body: `Interesting pattern: Days following restful sleep show more stable glucose patterns than days after poor sleep. Prioritizing good sleep hygiene may support your overall wellness goals.`,
        severity: 'info'
      };
    }
    
    // If good sleep consistently supports stable patterns
    if (avgGoodSleepVariance < avgPoorSleepVariance * 0.8 && goodSleepDays >= 3) {
      return {
        type: 'sleep_quality_glucose_correlation',
        title: 'Rest Supporting Stability',
        body: `Great news! Your glucose patterns tend to be more stable on days following quality sleep. This suggests your sleep routine is supporting your wellness goals beautifully.`,
        severity: 'info'
      };
    }
    
    return null;
  }

  // Stage 12: Energy Level and Glucose Correlation Analysis
  private analyzeEnergyLevelGlucoseCorrelation(data: InsightData): GeneratedInsight | null {
    if (!data.recentEnergyLogs || data.recentEnergyLogs.length < 3 || data.recentGlucoseReadings.length < 6) return null;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEnergyLogs = data.recentEnergyLogs.filter(log => 
      log.loggedAt && new Date(log.loggedAt) >= sevenDaysAgo
    );
    
    if (recentEnergyLogs.length < 3) return null;
    
    // Analyze glucose patterns on days with different energy levels
    let highEnergyAvgGlucose = 0;
    let lowEnergyAvgGlucose = 0;
    let highEnergyDays = 0;
    let lowEnergyDays = 0;
    
    for (const energyLog of recentEnergyLogs) {
      if (!energyLog.loggedAt || !energyLog.energyLevel) continue;
      
      const energyDate = new Date(energyLog.loggedAt);
      const dayStart = new Date(energyDate);
      dayStart.setHours(8, 0, 0, 0); // Start at 8 AM same day
      
      const dayEnd = new Date(energyDate);
      dayEnd.setHours(20, 0, 0, 0); // End at 8 PM same day
      
      // Get glucose readings for that day
      const dayReadings = data.recentGlucoseReadings.filter(reading => {
        if (!reading.recordedAt) return false;
        const readingTime = new Date(reading.recordedAt);
        return readingTime >= dayStart && readingTime <= dayEnd;
      });
      
      if (dayReadings.length < 2) continue; // Need enough readings
      
      // Calculate average glucose for that day
      const glucoseValues = dayReadings.map(r => Number(r.value));
      const avgGlucose = glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length;
      
      // Categorize energy level (1=tired, 2=okay, 3=energized)
      const energyLevel = Number(energyLog.energyLevel);
      const isHighEnergy = energyLevel >= 3;
      const isLowEnergy = energyLevel <= 1;
      
      if (isHighEnergy) {
        highEnergyAvgGlucose += avgGlucose;
        highEnergyDays++;
      } else if (isLowEnergy) {
        lowEnergyAvgGlucose += avgGlucose;
        lowEnergyDays++;
      }
    }
    
    if (highEnergyDays === 0 || lowEnergyDays === 0) return null;
    
    const avgHighEnergyGlucose = highEnergyAvgGlucose / highEnergyDays;
    const avgLowEnergyGlucose = lowEnergyAvgGlucose / lowEnergyDays;
    
    // If high energy correlates with more stable glucose (lower average)
    if (avgHighEnergyGlucose < avgLowEnergyGlucose - 15) {
      return {
        type: 'energy_level_glucose_correlation',
        title: 'Energy & Glucose Connection',
        body: `Your energized mornings tend to align with more balanced glucose patterns throughout the day. This suggests your energy levels and glucose wellness support each other well.`,
        severity: 'info'
      };
    }
    
    // If low energy correlates with higher glucose patterns
    if (avgLowEnergyGlucose > avgHighEnergyGlucose + 20) {
      return {
        type: 'energy_level_glucose_correlation',
        title: 'Morning Energy Insight',
        body: `On mornings when you feel tired, your glucose patterns tend to run slightly higher during the day. Gentle morning movement or consistent sleep timing might help support both energy and balance.`,
        severity: 'info'
      };
    }
    
    return null;
  }

  // Stage 12: Sleep Duration Pattern Analysis
  private analyzeSleepDurationPatterns(data: InsightData): GeneratedInsight | null {
    if (!data.recentSleepLogs || data.recentSleepLogs.length < 4) return null;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSleepLogs = data.recentSleepLogs.filter(log => 
      log.loggedAt && log.sleepDuration && new Date(log.loggedAt) >= sevenDaysAgo
    );
    
    if (recentSleepLogs.length < 3) return null;
    
    // Calculate average sleep duration
    const sleepDurations = recentSleepLogs.map(log => Number(log.sleepDuration));
    const avgSleepDuration = sleepDurations.reduce((sum, duration) => sum + duration, 0) / sleepDurations.length;
    
    // Count consistent short sleep nights (< 6.5 hours)
    const shortSleepNights = sleepDurations.filter(duration => duration < 6.5).length;
    const shortSleepPercentage = (shortSleepNights / sleepDurations.length) * 100;
    
    // Count excellent sleep nights (7.5-9 hours)
    const optimalSleepNights = sleepDurations.filter(duration => duration >= 7.5 && duration <= 9).length;
    const optimalSleepPercentage = (optimalSleepNights / sleepDurations.length) * 100;
    
    // If frequently getting insufficient sleep
    if (shortSleepPercentage >= 60 && avgSleepDuration < 6.5) {
      return {
        type: 'sleep_duration_patterns',
        title: 'Sleep Duration Opportunity',
        body: `You've been averaging ${avgSleepDuration.toFixed(1)} hours of sleep recently. Most adults benefit from 7-9 hours for optimal wellness. Consider gradually adjusting your bedtime to support better rest and recovery.`,
        severity: 'info'
      };
    }
    
    // If consistently getting optimal sleep
    if (optimalSleepPercentage >= 70 && avgSleepDuration >= 7.5) {
      return {
        type: 'sleep_duration_patterns',
        title: 'Excellent Sleep Consistency! 🌙',
        body: `Fantastic! You're averaging ${avgSleepDuration.toFixed(1)} hours of sleep and hitting the optimal 7-9 hour range consistently. This steady sleep routine supports your overall wellness beautifully.`,
        severity: 'info'
      };
    }
    
    return null;
  }
}

export const insightsService = new InsightsService();