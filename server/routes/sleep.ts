import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requirePlan } from "../middleware/requirePlan";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const sleep = Router();

// POST /sleep → log bedtime/wake/quality
sleep.post("/sleep", requireAuth, async (req: any, res) => {
  const { bedtime, wake_time, quality, notes } = req.body;
  const userId = req.user.claims?.sub;

  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  try {
    await db.execute(sql`
      INSERT INTO sleep_logs (user_id, bedtime, wake_time, sleep_quality, notes, logged_at)
      VALUES (${userId}, ${bedtime}, ${wake_time}, ${quality}, ${notes || null}, NOW())
    `);

    // Trigger on-write insights recomputation for cost-efficient analysis
    const { recomputeInsightsOnWriteSimple } = await import('../services/insights-onwrite-simple');
    await recomputeInsightsOnWriteSimple(userId);

    res.json({ ok: true, message: "Sleep log created successfully" });
  } catch (error) {
    console.error('Error creating sleep log:', error);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// GET /sleep → get recent sleep logs
sleep.get("/sleep", requireAuth, async (req: any, res) => {
  const userId = req.user.claims?.sub;

  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  try {
    const result = await db.execute(sql`
      SELECT id, bedtime, wake_time, sleep_quality as quality, notes, logged_at
      FROM sleep_logs
      WHERE user_id = ${userId}
      ORDER BY logged_at DESC
      LIMIT 30
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sleep logs:', error);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// GET /sleep/insights → get sleep insights (premium feature)
sleep.get("/sleep/insights", requireAuth, requirePlan('premium'), async (req: any, res) => {
  const userId = req.user.claims?.sub;

  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  try {
    // Get cached insights from our cost-efficient system
    const NodeCache = require('node-cache');
    const cache = new NodeCache({ stdTTL: 15 * 60 }); // 15 minutes
    
    const cached = cache.get(`insights:${userId}:7d`);
    if (cached) {
      return res.json(cached);
    }

    // If no cache, trigger recomputation
    const { recomputeInsightsOnWriteSimple } = await import('../services/insights-onwrite-simple');
    await recomputeInsightsOnWriteSimple(userId);
    
    const insights = cache.get(`insights:${userId}:7d`) || { ok: true, items: [], cachedAt: new Date().toISOString() };
    res.json(insights);
  } catch (error) {
    console.error('Error fetching sleep insights:', error);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});