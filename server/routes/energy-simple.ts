import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { isAuthenticated } from "../customAuth";

export const energySimple = Router();

const energyBody = z.object({
  physical: z.number().int().min(0).max(10),
  mental: z.number().int().min(0).max(10),
  emotional: z.number().int().min(0).max(10),
  drain: z.enum(["sleep", "stress", "overwhelm", "hunger", "screen", "other"]),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid().optional()
});

// POST /energy-checkin - Create energy check-in
energySimple.post("/energy-checkin", isAuthenticated, async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ code: "UNAUTHENTICATED", message: "Sign in required" });
  }

  const parsed = energyBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      code: "VALIDATION_ERROR", 
      message: "Invalid input", 
      fields: parsed.error.format() 
    });
  }

  const { physical, mental, emotional, drain, notes } = parsed.data;
  const idempotencyKey = parsed.data.idempotencyKey ?? randomUUID();

  try {
    // Check for existing entry with same idempotency key
    const existingCheck = await db.execute(sql`
      SELECT id, created_at
      FROM energy_checkins
      WHERE user_id = ${userId} AND idempotency_key = ${idempotencyKey}
      LIMIT 1
    `);

    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0] as any;
      return res.status(200).json({ 
        checkinId: existing.id, 
        savedAt: existing.created_at 
      });
    }

    // Create new entry
    const result = await db.execute(sql`
      INSERT INTO energy_checkins (user_id, physical, mental, emotional, drain, notes, idempotency_key, created_at)
      VALUES (${userId}, ${physical}, ${mental}, ${emotional}, ${drain}, ${notes || null}, ${idempotencyKey}, NOW())
      RETURNING id, created_at
    `);

    const checkin = result.rows[0] as any;
    console.log('✅ Energy checkin created for user:', userId);

    return res.status(201).json({ 
      checkinId: checkin.id, 
      savedAt: checkin.created_at 
    });
  } catch (error: any) {
    // Handle unique constraint violations (duplicate protection)
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ code: "CONFLICT", message: "Duplicate check-in" });
    }
    console.error('Error creating energy checkin:', error);
    res.status(500).json({ code: "SERVER_ERROR", message: "Could not save check-in" });
  }
});

// GET /energy-checkin - Get recent energy check-ins
energySimple.get("/energy-checkin", isAuthenticated, async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ code: "UNAUTHENTICATED", message: "Sign in required" });

  try {
    const result = await db.execute(sql`
      SELECT id, physical, mental, emotional, drain, notes, created_at
      FROM energy_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching energy checkins:', error);
    res.status(500).json({ code: "SERVER_ERROR", message: "Could not fetch check-ins" });
  }
});

// GET /energy-checkin/today - Get today's energy check-in
energySimple.get("/energy-checkin/today", isAuthenticated, async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ code: "UNAUTHENTICATED", message: "Sign in required" });

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.execute(sql`
      SELECT id, physical, mental, emotional, drain, notes, created_at
      FROM energy_checkins
      WHERE user_id = ${userId} AND DATE(created_at) = ${today}
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const checkin = result.rows[0] || null;
    res.json(checkin);
  } catch (error) {
    console.error('Error fetching today\'s energy checkin:', error);
    res.status(500).json({ code: "SERVER_ERROR", message: "Could not fetch today's check-in" });
  }
});