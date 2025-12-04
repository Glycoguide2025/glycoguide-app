import type { GlucoseReading, InsertGlucoseReading } from '@shared/schema';
import type { IStorage } from './storage';

// CGM Simulation Parameters
const CGM_READING_INTERVAL_MINUTES = 5; // CGM reads every 5 minutes
const NORMAL_GLUCOSE_RANGE = { min: 80, max: 120 }; // mg/dL
const MEAL_SPIKE_RANGE = { min: 140, max: 180 }; // Post-meal spike
const EXERCISE_DROP_RANGE = { min: 70, max: 90 }; // Exercise-induced drop

interface CGMSimulationOptions {
  userId: string;
  startDate: Date;
  endDate: Date;
  includeBasalPattern?: boolean;
  includeMealSpikes?: boolean;
  includeExerciseDrops?: boolean;
  includeSleep?: boolean;
}

interface MealEvent {
  time: Date;
  carbsGrams: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface ExerciseEvent {
  time: Date;
  duration: number; // minutes
  intensity: 'light' | 'moderate' | 'vigorous';
}

export class CGMSimulationService {
  constructor(private storage: IStorage) {}

  /**
   * Generate simulated CGM data for a user over a time period
   */
  async generateSimulatedCGMData(options: CGMSimulationOptions): Promise<GlucoseReading[]> {
    const { userId, startDate, endDate } = options;
    const readings: InsertGlucoseReading[] = [];
    
    // Generate meal and exercise events for realistic patterns
    const mealEvents = this.generateMealEvents(startDate, endDate);
    const exerciseEvents = this.generateExerciseEvents(startDate, endDate);
    
    let currentTime = new Date(startDate);
    let currentGlucose = this.getBasalGlucose(currentTime);
    
    while (currentTime <= endDate) {
      // Check for meal spikes
      const nearbyMeal = this.findNearbyEvent(currentTime, mealEvents, 180); // 3 hours window
      const nearbyExercise = this.findNearbyEvent(currentTime, exerciseEvents, 120); // 2 hours window
      
      // Calculate glucose based on events and circadian rhythm
      currentGlucose = this.calculateGlucoseReading(
        currentTime,
        currentGlucose,
        nearbyMeal,
        nearbyExercise
      );
      
      // Add some natural variance
      const variance = (Math.random() - 0.5) * 10; // ±5 mg/dL
      const finalGlucose = Math.max(60, Math.min(300, currentGlucose + variance));
      
      // Determine trend and alert type
      const trend = this.calculateTrend(readings.slice(-3), finalGlucose);
      const alertType = this.determineAlertType(finalGlucose);
      
      const reading: InsertGlucoseReading = {
        userId,
        value: (Math.round(finalGlucose * 100) / 100).toString(), // Round to 2 decimals and convert to string
        unit: 'mg/dL',
        readingType: 'cgm_continuous',
        source: 'cgm',
        cgmDeviceId: 'sim-cgm-001',
        trend,
        alertType,
        isLive: true,
        notes: this.generateReadingNotes(nearbyMeal, nearbyExercise)
      };
      
      readings.push(reading);
      
      // Advance time by CGM interval
      currentTime = new Date(currentTime.getTime() + CGM_READING_INTERVAL_MINUTES * 60 * 1000);
    }
    
    // Insert readings into database
    const savedReadings: GlucoseReading[] = [];
    for (const reading of readings) {
      try {
        const saved = await this.storage.createGlucoseReading(reading);
        savedReadings.push(saved);
      } catch (error) {
        console.error('Failed to save CGM reading:', error);
      }
    }
    
    return savedReadings;
  }

  /**
   * Generate realistic meal events throughout the day
   */
  private generateMealEvents(startDate: Date, endDate: Date): MealEvent[] {
    const events: MealEvent[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Breakfast (7-9 AM)
      const breakfast = new Date(currentDate);
      breakfast.setHours(7 + Math.random() * 2, Math.random() * 60);
      events.push({
        time: breakfast,
        carbsGrams: 30 + Math.random() * 20, // 30-50g carbs
        type: 'breakfast'
      });
      
      // Lunch (12-2 PM)
      const lunch = new Date(currentDate);
      lunch.setHours(12 + Math.random() * 2, Math.random() * 60);
      events.push({
        time: lunch,
        carbsGrams: 40 + Math.random() * 30, // 40-70g carbs
        type: 'lunch'
      });
      
      // Dinner (6-8 PM)
      const dinner = new Date(currentDate);
      dinner.setHours(18 + Math.random() * 2, Math.random() * 60);
      events.push({
        time: dinner,
        carbsGrams: 35 + Math.random() * 25, // 35-60g carbs
        type: 'dinner'
      });
      
      // Optional snack (50% chance, 3-4 PM)
      if (Math.random() > 0.5) {
        const snack = new Date(currentDate);
        snack.setHours(15 + Math.random(), Math.random() * 60);
        events.push({
          time: snack,
          carbsGrams: 10 + Math.random() * 15, // 10-25g carbs
          type: 'snack'
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }

  /**
   * Generate realistic exercise events
   */
  private generateExerciseEvents(startDate: Date, endDate: Date): ExerciseEvent[] {
    const events: ExerciseEvent[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // 70% chance of exercise per day
      if (Math.random() > 0.3) {
        const exerciseTime = new Date(currentDate);
        
        // Morning exercise (6-8 AM) or evening (5-7 PM)
        if (Math.random() > 0.5) {
          exerciseTime.setHours(6 + Math.random() * 2, Math.random() * 60);
        } else {
          exerciseTime.setHours(17 + Math.random() * 2, Math.random() * 60);
        }
        
        const intensities: ExerciseEvent['intensity'][] = ['light', 'moderate', 'vigorous'];
        const intensity = intensities[Math.floor(Math.random() * intensities.length)];
        
        events.push({
          time: exerciseTime,
          duration: 20 + Math.random() * 40, // 20-60 minutes
          intensity
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }

  /**
   * Calculate basal glucose based on time of day (circadian rhythm)
   */
  private getBasalGlucose(time: Date): number {
    const hour = time.getHours();
    
    // Dawn phenomenon (4-8 AM): slightly elevated
    if (hour >= 4 && hour <= 8) {
      return NORMAL_GLUCOSE_RANGE.min + 15;
    }
    
    // Daytime (9 AM - 6 PM): normal range
    if (hour >= 9 && hour <= 18) {
      return NORMAL_GLUCOSE_RANGE.min + Math.random() * (NORMAL_GLUCOSE_RANGE.max - NORMAL_GLUCOSE_RANGE.min);
    }
    
    // Evening/Night (7 PM - 3 AM): slightly lower
    return NORMAL_GLUCOSE_RANGE.min + 5;
  }

  /**
   * Calculate glucose reading based on current state and nearby events
   */
  private calculateGlucoseReading(
    currentTime: Date,
    baselineGlucose: number,
    nearbyMeal?: { event: MealEvent; minutesAgo: number },
    nearbyExercise?: { event: ExerciseEvent; minutesAgo: number }
  ): number {
    let adjustedGlucose = baselineGlucose;
    
    // Meal spike effect
    if (nearbyMeal) {
      const { event: meal, minutesAgo } = nearbyMeal;
      const peakTime = 60; // Peak at 60 minutes post-meal
      const duration = 180; // Effect lasts 3 hours
      
      if (minutesAgo <= duration) {
        // Gaussian curve for meal response
        const timeRatio = minutesAgo / peakTime;
        const spikeIntensity = Math.exp(-Math.pow(timeRatio - 1, 2) / 0.5);
        const maxSpike = (meal.carbsGrams / 15) * 30; // ~30mg/dL per 15g carbs
        adjustedGlucose += maxSpike * spikeIntensity;
      }
    }
    
    // Exercise drop effect
    if (nearbyExercise) {
      const { event: exercise, minutesAgo } = nearbyExercise;
      const effectDuration = exercise.duration + 60; // Effect lasts duration + 1 hour
      
      if (minutesAgo <= effectDuration) {
        const intensityMultiplier = exercise.intensity === 'vigorous' ? 1.5 : 
                                  exercise.intensity === 'moderate' ? 1.0 : 0.5;
        const drop = 20 * intensityMultiplier * Math.exp(-minutesAgo / 90);
        adjustedGlucose -= drop;
      }
    }
    
    return Math.max(60, Math.min(300, adjustedGlucose)); // Clamp to realistic range
  }

  /**
   * Find nearby events within a time window
   */
  private findNearbyEvent<T extends { time: Date }>(
    currentTime: Date,
    events: T[],
    windowMinutes: number
  ): { event: T; minutesAgo: number } | undefined {
    for (const event of events) {
      const minutesAgo = (currentTime.getTime() - event.time.getTime()) / (1000 * 60);
      if (minutesAgo >= 0 && minutesAgo <= windowMinutes) {
        return { event, minutesAgo };
      }
    }
    return undefined;
  }

  /**
   * Calculate glucose trend based on recent readings
   */
  private calculateTrend(
    recentReadings: InsertGlucoseReading[],
    currentValue: number
  ): 'stable' | 'rising_slowly' | 'rising' | 'rising_rapidly' | 'falling_slowly' | 'falling' | 'falling_rapidly' {
    if (recentReadings.length < 2) return 'stable';
    
    const lastValue = Number(recentReadings[recentReadings.length - 1]?.value || currentValue);
    const changeRate = (currentValue - lastValue) / CGM_READING_INTERVAL_MINUTES; // mg/dL per minute
    
    if (Math.abs(changeRate) < 0.5) return 'stable';
    if (changeRate >= 2) return 'rising_rapidly';
    if (changeRate >= 1) return 'rising';
    if (changeRate > 0) return 'rising_slowly';
    if (changeRate <= -2) return 'falling_rapidly';
    if (changeRate <= -1) return 'falling';
    return 'falling_slowly';
  }

  /**
   * Determine alert type based on glucose value
   */
  private determineAlertType(glucose: number): 'none' | 'low' | 'high' | 'urgent_low' | 'urgent_high' {
    if (glucose < 55) return 'urgent_low';
    if (glucose < 70) return 'low';
    if (glucose > 300) return 'urgent_high';
    if (glucose > 180) return 'high';
    return 'none';
  }

  /**
   * Generate contextual notes for readings
   */
  private generateReadingNotes(
    nearbyMeal?: { event: MealEvent; minutesAgo: number },
    nearbyExercise?: { event: ExerciseEvent; minutesAgo: number }
  ): string | undefined {
    const notes: string[] = [];
    
    if (nearbyMeal && nearbyMeal.minutesAgo <= 120) {
      notes.push(`${Math.round(nearbyMeal.minutesAgo)}min post-${nearbyMeal.event.type}`);
    }
    
    if (nearbyExercise && nearbyExercise.minutesAgo <= 90) {
      notes.push(`${Math.round(nearbyExercise.minutesAgo)}min post-${nearbyExercise.event.intensity} exercise`);
    }
    
    return notes.length > 0 ? notes.join(', ') : undefined;
  }

  /**
   * Generate a quick demo dataset for the current user
   */
  async generateDemoData(userId: string, hours: number = 24): Promise<GlucoseReading[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
    
    return this.generateSimulatedCGMData({
      userId,
      startDate,
      endDate,
      includeBasalPattern: true,
      includeMealSpikes: true,
      includeExerciseDrops: true,
      includeSleep: true
    });
  }
}