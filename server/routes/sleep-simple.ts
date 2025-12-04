import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";
// Auth is handled inline - we'll check the user token directly

export const sleepSimple = Router();

const sleepBody = z.object({
  bedtime: z.string(),   // ISO timestamp
  waketime: z.string(),  // ISO timestamp
  quality: z.number().min(1).max(5),
  notes: z.string().optional(),
});

// POST /sleep - Create sleep log
sleepSimple.post("/sleep", async (req: any, res) => {
  const parsed = sleepBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_BODY" });
  
  const userId = req.user?.claims?.sub;
  if (!userId) return res.status(401).json({ error: "UNAUTHENTICATED" });

  try {
    const now = new Date().toISOString();
    
    // Insert into simple sleep_logs table
    const result = await db.execute(sql`
      INSERT INTO sleep_logs_simple (user_id, bedtime, wake_time, quality, notes, created_at)
      VALUES (${userId}, ${parsed.data.bedtime}, ${parsed.data.waketime}, ${parsed.data.quality}, ${parsed.data.notes || null}, ${now})
      RETURNING id
    `);

    const entryId = (result.rows[0] as any)?.id || 'unknown';

    // On-write recompute (bounded) - temporarily disabled for testing
    // const { recomputeInsightsOnWriteSimple } = await import('../services/insights-onwrite-simple');
    // await recomputeInsightsOnWriteSimple(userId);
    console.log('✅ Sleep log created for user:', userId);

    res.json({ ok: true, id: entryId });
  } catch (error) {
    console.error('Error creating sleep log:', error);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// GET /sleep - Get recent sleep logs
sleepSimple.get("/sleep", async (req: any, res) => {
  const userId = req.user?.claims?.sub;
  if (!userId) return res.status(401).json({ error: "UNAUTHENTICATED" });

  try {
    const result = await db.execute(sql`
      SELECT id, bedtime, wake_time, quality, notes, created_at
      FROM sleep_logs_simple
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sleep logs:', error);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});