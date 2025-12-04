import { storage } from "../storage";
import type { SleepLog, EnergyLog, MealLog, GlucoseReading } from "@shared/schema";

// Import the existing cache instance from routes.ts
// We'll access it through a getter function to avoid circular imports

export interface SleepInsight {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  severity: 'info' | 'warn';
  createdAt: string;
  links: Record<string, any>;
}

export async function recomputeInsightsOnWrite(userId: string): Promise<void> {
  try {
    // 1) Pull bounded recent data (cap 300 events, analyze last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const [sleep, energy, meals, readings] = await Promise.all([
      storage.getUserSleepLogs(userId, fourteenDaysAgo, new Date()).then(logs => logs.slice(0, 300)),
      storage.getUserEnergyLogs(userId, fourteenDaysAgo, new Date()).then(logs => logs.slice(0, 300)),
      storage.getUserMealLogs(userId, fourteenDaysAgo, new Date()).then(logs => logs.slice(0, 300)),
      storage.getUserGlucoseReadings(userId, fourteenDaysAgo, new Date()).then(readings => readings.slice(0, 300))
    ]);

    // 2) Compute sleep insights (new rules)
    const sleepInsights = await computeSleepInsights({ 
      userId, 
      sleep, 
      energy, 
      meals, 
      readings 
    });

    // 3) Merge with existing insights logic would go here
    // For now, we'll just cache the sleep insights
    // In a real implementation, you'd merge with existing insights and pick top 3

    // 4) Cache by 7d range (minimum required) using NodeCache directly
    // We'll create a simple cache instance to avoid circular imports
    const NodeCache = require('node-cache');
    const insightsCache = new NodeCache({ stdTTL: 15 * 60 }); // 15 minutes
    
    insightsCache.set(`insights:${userId}:7d`, { 
      ok: true, 
      items: sleepInsights, 
      cachedAt: new Date().toISOString() 
    });

    console.log(`✅ Insights recomputed for user ${userId}: ${sleepInsights.length} sleep insights generated`);
  } catch (error) {
    console.error('❌ Error recomputing insights on write:', error);
  }
}

interface SleepInsightsContext {
  userId: string;
  sleep: SleepLog[];
  energy: EnergyLog[];
  meals: MealLog[];
  readings: GlucoseReading[];
}

export async function computeSleepInsights(ctx: SleepInsightsContext): Promise<SleepInsight[]> {
  const items: SleepInsight[] = [];

  if (!ctx.sleep?.length || !ctx.energy?.length) {
    return items;
  }

  // Rule A — "More energy after earlier bedtimes"
  // Heuristic: avg energy score is higher on days with bedtime before 23:00
  const energyScore = (level: string) => {
    switch (level) {
      case 'very_low': return 0;
      case 'low': return 1;
      case 'moderate': return 2;
      case 'high': return 3;
      case 'very_high': return 4;
      default: return 1;
    }
  };

  const early = ctx.sleep.filter(s => {
    if (!s.bedtime) return false;
    return new Date(s.bedtime).getHours() < 23;
  });

  const late = ctx.sleep.filter(s => {
    if (!s.bedtime) return false;
    return new Date(s.bedtime).getHours() >= 23;
  });

  const byDate = (arr: SleepLog[]) => {
    const map = new Map<string, SleepLog>();
    arr.forEach(s => {
      if (s.wakeTime) {
        const d = new Date(s.wakeTime).toISOString().slice(0, 10); // day the user wakes up
        map.set(d, s);
      }
    });
    return map;
  };

  const earlyMap = byDate(early);
  const lateMap = byDate(late);

  const energyByDay = new Map<string, number>();
  ctx.energy.forEach(e => {
    if (e.loggedAt && e.energyLevel) {
      const d = new Date(e.loggedAt).toISOString().slice(0, 10);
      energyByDay.set(d, energyScore(e.energyLevel));
    }
  });

  const earlyScores: number[] = [];
  for (const d of Array.from(earlyMap.keys())) {
    if (energyByDay.has(d)) {
      earlyScores.push(energyByDay.get(d)!);
    }
  }

  const lateScores: number[] = [];
  for (const d of Array.from(lateMap.keys())) {
    if (energyByDay.has(d)) {
      lateScores.push(energyByDay.get(d)!);
    }
  }

  const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const earlyAvg = avg(earlyScores);
  const lateAvg = avg(lateScores);

  if (earlyScores.length >= 3 && earlyAvg > lateAvg + 0.3) {
    items.push({
      id: `sleep_early_energy_${Date.now()}`,
      userId: ctx.userId,
      type: "sleep_early_energy",
      title: "Rest pattern noticed",
      body: "You often feel more energized after earlier bedtimes. Consider a gentle wind-down to help you sleep sooner.",
      severity: "info",
      createdAt: new Date().toISOString(),
      links: {},
    });
  }

  // Rule B — "Energy dips after <6.5h sleep"
  const hours = (b: Date, w: Date) => (w.getTime() - b.getTime()) / (1000 * 60 * 60);
  
  const shortNights = ctx.sleep.filter(s => {
    if (!s.bedtime || !s.wakeTime) return false;
    const bedtime = new Date(s.bedtime);
    const waketime = new Date(s.wakeTime);
    return hours(bedtime, waketime) < 6.5;
  });

  const shortDays = new Set(shortNights.map(s => {
    if (s.wakeTime) {
      return new Date(s.wakeTime).toISOString().slice(0, 10);
    }
    return null;
  }).filter(Boolean) as string[]);

  const energyOnShort = Array.from(shortDays)
    .map(d => energyByDay.get(d))
    .filter(v => v !== undefined) as number[];

  const energyOnOther = Array.from(energyByDay.entries())
    .filter(([d]) => !shortDays.has(d))
    .map(([_, v]) => v);

  const shortAvg = avg(energyOnShort);
  const otherAvg = avg(energyOnOther);

  if (energyOnShort.length >= 3 && shortAvg + 0.3 < otherAvg) {
    items.push({
      id: `sleep_short_energy_${Date.now()}`,
      userId: ctx.userId,
      type: "sleep_short_energy",
      title: "Short-sleep pattern noticed",
      body: "Energy tends to dip after shorter nights. A steady wind-down routine may help.",
      severity: "info",
      createdAt: new Date().toISOString(),
      links: {},
    });
  }

  // Keep total insights bounded; caller will merge & pick top 3
  return items.slice(0, 3);
}