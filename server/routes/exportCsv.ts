import { Router } from "express";
import { storage } from "../storage";
import { requirePlan } from "./billing";
export const exportCsv = Router();

function csvEscape(s: any) {
  const v = s ?? "";
  const str = typeof v === "string" ? v : String(v);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

exportCsv.get("/export/csv", requirePlan("pro"), async (req: any, res: any) => {
  try {
    const { start, end } = req.query; // optional ISO strings
    const userId = req.user.claims.sub;

    // Parse date range if provided
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    // Fetch data from storage
    const mealLogs = await storage.getUserMealLogs(userId, startDate, endDate);
    const glucoseReadings = await storage.getUserGlucoseReadings(userId, startDate, endDate);
    const reflections = await storage.getUserReflectionsForWeek(userId, startDate || new Date(Date.now() - 30*24*60*60*1000));

    const rows: string[] = [];
    // Exact header as specified
    rows.push("date,time,type,recipe_title,carbs_g,fiber_g,calories_kcal,notes,value,context,linked_meal_title");

    // Process meals - map to exact schema
    for (const mealLog of mealLogs) {
      if (!mealLog.loggedAt) continue; // Skip entries without date
      const d = new Date(mealLog.loggedAt);
      const meal = await storage.getMeal(mealLog.mealId || '');
      
      rows.push([
        d.toISOString().slice(0,10), // date (YYYY-MM-DD)
        d.toTimeString().slice(0,5), // time (HH:mm local)
        "meal", // type
        meal?.name || mealLog.customMealName || "", // recipe_title
        mealLog.customCarbs?.toString() || meal?.carbohydrates?.toString() || "", // carbs_g
        meal?.fiber?.toString() || "", // fiber_g
        meal?.calories?.toString() || "", // calories_kcal
        mealLog.notes || "", // notes
        "", // value (blank for meals)
        "", // context (blank for meals)
        "" // linked_meal_title (blank for meals)
      ].map(csvEscape).join(","));
    }

    // Process glucose readings - map to exact schema
    for (const reading of glucoseReadings) {
      if (!reading.recordedAt) continue; // Skip entries without date
      const d = new Date(reading.recordedAt);
      
      rows.push([
        d.toISOString().slice(0,10), // date (YYYY-MM-DD)
        d.toTimeString().slice(0,5), // time (HH:mm local)  
        "entry", // type
        "", // recipe_title (blank for readings)
        "", // carbs_g (blank for readings)
        "", // fiber_g (blank for readings)
        "", // calories_kcal (blank for readings)
        "", // notes (blank for readings)
        reading.value.toString(), // value (numeric reading, no units)
        reading.readingType || "any", // context (use readingType field)
        reading.relatedMealLogId || "" // linked_meal_title (use relatedMealLogId)
      ].map(csvEscape).join(","));
    }

    // Process reflections (Option A: include as type=reflection)
    for (const reflection of reflections) {
      const d = new Date(reflection.date + 'T21:30:00'); // Default to evening reflection time
      
      // Create formatted value string: "mood=Good;stress=2;sleep=7h"
      const valueItems = [];
      if (reflection.mood) valueItems.push(`mood=${reflection.mood}`);
      if (reflection.stress) valueItems.push(`stress=${reflection.stress}`);
      if (reflection.sleep) valueItems.push(`sleep=${reflection.sleep}`);
      if (reflection.energy) valueItems.push(`energy=${reflection.energy}`);
      const valueString = valueItems.join(';');
      
      rows.push([
        d.toISOString().slice(0,10), // date (YYYY-MM-DD)
        d.toTimeString().slice(0,5), // time (HH:mm local)
        "reflection", // type
        "", // recipe_title (blank for reflections)
        "", // carbs_g (blank for reflections)
        "", // fiber_g (blank for reflections)
        "", // calories_kcal (blank for reflections)
        "", // notes (blank for reflections)
        valueString, // value (formatted reflection data)
        "reflection", // context
        "" // linked_meal_title (blank for reflections)
      ].map(csvEscape).join(","));
    }

    const csv = rows.join("\n");
    const fname = `GlycoGuide_Export_${new Date().toISOString().slice(0,10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error("CSV export failed:", err);
    res.status(500).json({ error: "CSV_EXPORT_FAILED" });
  }
});