import { db } from "../db";
import { sql } from "drizzle-orm";

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 15 * 60 }); // 15 minutes

export interface SleepEntry {
  id: string;
  userId: string;
  bedtime: string;    // ISO date
  waketime: string;   // ISO date
  quality: number;    // 1..5
  notes?: string;
  createdAt: string;  // ISO
}

export interface EnergyCheckin {
  id: string;
  userId: string;
  date: string;       // YYYY-MM-DD
  energyLevel: number; // 1..3 (1 = tired, 2 = ok, 3 = energized)
  createdAt: string;  // ISO
}

export async function recomputeInsightsOnWriteSimple(userId: string): Promise<void> {
  try {
    // 1) Pull bounded recent data (cap 300 events, analyze last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgoStr = fourteenDaysAgo.toISOString();

    const [sleepResult, energyResult] = await Promise.all([
      db.execute(sql`
        SELECT id, user_id as "userId", bedtime, wake_time as waketime, quality, notes, created_at as "createdAt"
        FROM sleep_logs_simple
        WHERE user_id = ${userId} AND created_at >= ${fourteenDaysAgoStr}
        ORDER BY created_at DESC
        LIMIT 300
      `),
      db.execute(sql`
        SELECT id, user_id as "userId", date, energy_level as "energyLevel", created_at as "createdAt"
        FROM energy_checkins
        WHERE user_id = ${userId} AND created_at >= ${fourteenDaysAgoStr}
        ORDER BY created_at DESC
        LIMIT 300
      `)
    ]);

    const sleep = sleepResult.rows as unknown as SleepEntry[];
    const energy = energyResult.rows as unknown as EnergyCheckin[];

    // 2) Compute sleep insights (new rules)
    const sleepInsights = await computeSleepInsightsSimple({ userId, sleep, energy });

    // 3) Cache by 7d range (minimum required)
    cache.set(`insights:${userId}:7d`, { 
      ok: true, 
      items: sleepInsights, 
      cachedAt: new Date().toISOString() 
    });

    console.log(`✅ Simple insights recomputed for user ${userId}: ${sleepInsights.length} sleep insights generated`);
  } catch (error) {
    console.error('❌ Error recomputing simple insights on write:', error);
  }
}

interface SleepInsightsContext {
  userId: string;
  sleep: SleepEntry[];
  energy: EnergyCheckin[];
}

export async function computeSleepInsightsSimple(ctx: SleepInsightsContext): Promise<any[]> {
  const items: any[] = [];

  if (!ctx.sleep?.length || !ctx.energy?.length) {
    return items;
  }

  // Rule A — "More energy after earlier bedtimes"
  const early = ctx.sleep.filter(s => {
    const bedtimeHour = new Date(s.bedtime).getHours();
    return bedtimeHour < 23;
  });

  const late = ctx.sleep.filter(s => {
    const bedtimeHour = new Date(s.bedtime).getHours();
    return bedtimeHour >= 23;
  });

  const byDate = (arr: SleepEntry[]) => {
    const map = new Map<string, SleepEntry>();
    arr.forEach(s => {
      const d = new Date(s.waketime).toISOString().slice(0, 10); // wake-up day
      map.set(d, s);
    });
    return map;
  };

  const earlyMap = byDate(early);
  const lateMap = byDate(late);

  const energyByDay = new Map<string, number>();
  ctx.energy.forEach(e => {
    energyByDay.set(e.date, e.energyLevel);
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
  const hours = (bedtime: string, waketime: string) => {
    return (new Date(waketime).getTime() - new Date(bedtime).getTime()) / (1000 * 60 * 60);
  };
  
  const shortNights = ctx.sleep.filter(s => hours(s.bedtime, s.waketime) < 6.5);
  const shortDays = new Set(shortNights.map(s => new Date(s.waketime).toISOString().slice(0, 10)));

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

  return items.slice(0, 3);
}