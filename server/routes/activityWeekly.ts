import { Router } from "express";
import { db } from "../db";
import { activityWeekly } from "../../shared/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { isoYearWeek, weeksBackForPlan, getWeekHistory, type IsoWeek } from "../lib/isoWeek";
import { z } from "zod";
import { requirePlan } from "../middleware/requirePlan";

// Validation schema for weekly activity payload
const ActivityPayloadSchema = z.record(
  z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  z.record(
    z.enum(["energy", "mindfulness", "movement", "sleep", "hydration", "bm"]),
    z.boolean()
  )
);

const PostWeeklyActivitySchema = z.object({
  payload: ActivityPayloadSchema
});

export const activityWeeklyRoutes = Router();

/**
 * GET /api/activity/weekly
 * Returns up to N weeks (by plan) of weekly activity payloads, newest first.
 * Response: { weeks: [{ isoYear, isoWeek, payload, updatedAt }], current: { isoYear, isoWeek } }
 */
activityWeeklyRoutes.get("/activity/weekly", requirePlan("pro"), async (req: any, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  // Determine user's plan from subscription tier
  const plan: "free" | "pro" | "premium" = req.user?.subscriptionTier === "premium" ? "premium" 
    : req.user?.subscriptionTier === "pro" ? "pro" 
    : "free";

  const current = isoYearWeek();
  const weeksToFetch = weeksBackForPlan(plan);
  const weekHistory = getWeekHistory(weeksToFetch);

  try {
    // Query the allowed weeks for this user
    const yearValues = Array.from(new Set(weekHistory.map(w => w.isoYear)));
    const weekValues = Array.from(new Set(weekHistory.map(w => w.isoWeek)));

    const rows = await db
      .select()
      .from(activityWeekly)
      .where(
        and(
          eq(activityWeekly.userId, userId),
          inArray(activityWeekly.isoYear, yearValues),
          inArray(activityWeekly.isoWeek, weekValues)
        )
      )
      .orderBy(desc(activityWeekly.isoYear), desc(activityWeekly.isoWeek));

    // Filter the results to only include weeks we actually want (for exact matching)
    const filteredRows = rows.filter(row => 
      weekHistory.some(week => week.isoYear === row.isoYear && week.isoWeek === row.isoWeek)
    );

    res.json({ 
      current, 
      weeks: filteredRows,
      plan,
      weeksAllowed: weeksToFetch
    });

  } catch (error) {
    console.error("Error fetching weekly activity:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

/**
 * POST /api/activity/weekly  
 * Upsert the current week's activity payload (the dot grid).
 * Body: { payload: Record<DayKey, Record<CategoryKey, boolean>> }
 */
activityWeeklyRoutes.post("/activity/weekly", requirePlan("pro"), async (req: any, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  const body = req.body ?? {};
  
  // Validate payload structure with Zod
  const validation = PostWeeklyActivitySchema.safeParse(body);
  if (!validation.success) {
    console.warn("Invalid weekly activity payload:", validation.error.issues);
    return res.status(400).json({ 
      error: "INVALID_PAYLOAD", 
      details: validation.error.issues 
    });
  }

  const { isoYear, isoWeek } = isoYearWeek();

  try {
    // Upsert current week using raw SQL for better control
    // Note: This approach works around potential Drizzle upsert limitations
    await db.execute(sql`
      INSERT INTO activity_weekly (user_id, iso_year, iso_week, payload, updated_at)
      VALUES (${userId}, ${isoYear}, ${isoWeek}, ${JSON.stringify(validation.data.payload)}, NOW())
      ON CONFLICT (user_id, iso_year, iso_week)
      DO UPDATE SET 
        payload = EXCLUDED.payload, 
        updated_at = NOW()
    `);

    res.json({ 
      ok: true, 
      isoYear, 
      isoWeek,
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error saving weekly activity:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

/**
 * GET /api/activity/weekly/:year/:week
 * Get a specific week's activity data (if within user's plan limits)
 */
activityWeeklyRoutes.get("/activity/weekly/:year/:week", async (req: any, res) => {
  const userId = req.user?.id;
  const isoYear = parseInt(req.params.year);
  const isoWeek = parseInt(req.params.week);
  
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  if (!isoYear || !isoWeek || isoYear < 2020 || isoYear > 2030 || isoWeek < 1 || isoWeek > 53) {
    return res.status(400).json({ error: "INVALID_WEEK" });
  }

  // Check if requested week is within user's plan limits
  const plan: "free" | "pro" | "premium" = req.user?.subscriptionTier === "premium" ? "premium" 
    : req.user?.subscriptionTier === "pro" ? "pro" 
    : "free";
  
  const weeksToFetch = weeksBackForPlan(plan);
  const weekHistory = getWeekHistory(weeksToFetch);
  
  const isAllowed = weekHistory.some(week => 
    week.isoYear === isoYear && week.isoWeek === isoWeek
  );

  if (!isAllowed) {
    return res.status(403).json({ 
      error: "WEEK_NOT_ACCESSIBLE", 
      message: `Plan ${plan} only allows access to last ${weeksToFetch} weeks` 
    });
  }

  try {
    const row = await db
      .select()
      .from(activityWeekly)
      .where(
        and(
          eq(activityWeekly.userId, userId),
          eq(activityWeekly.isoYear, isoYear),
          eq(activityWeekly.isoWeek, isoWeek)
        )
      )
      .limit(1);

    if (row.length === 0) {
      return res.status(404).json({ error: "WEEK_NOT_FOUND" });
    }

    res.json(row[0]);

  } catch (error) {
    console.error("Error fetching specific week:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});