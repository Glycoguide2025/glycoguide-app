import { Router } from "express";
import { isAuthenticated } from "../auth0";
import { requirePlan } from "../middleware/requirePlan";
import { storage } from "../storage";
import { CGMSimulationService } from "../cgm-simulation-service";
import { parseDexcomCsv, parseLibreCsv, parseGenericCsv, toMgdl } from "../services/cgm-parse";
import { z } from "zod";

export const cgm = Router();

const cgmService = new CGMSimulationService(storage);

const rangeSchema = z.object({ 
  start: z.string().optional(), 
  end: z.string().optional() 
});

// GET /api/cgm/readings - fetch CGM readings with optional filtering
cgm.get("/api/cgm/readings", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { start, end, source } = req.query;

    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    const readings = await storage.getUserGlucoseReadings(userId, startDate, endDate);

    // Filter by source if specified (manual, cgm, imported)
    const filteredReadings = source 
      ? readings.filter(reading => reading.source === source)
      : readings;

    // Bound window to 500 readings for cost control
    const boundedReadings = filteredReadings.slice(0, 500);

    res.json(boundedReadings);
  } catch (error) {
    console.error("Error fetching CGM readings:", error);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

// POST /api/cgm/readings - bulk insert CGM readings (Pro+ only)
cgm.post("/api/cgm/readings", isAuthenticated, requirePlan("pro"), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { values } = req.body;

    if (!Array.isArray(values)) {
      return res.status(400).json({ error: "INVALID_INPUT" });
    }

    // Validate and transform readings
    const readings = values.map((v: any) => ({
      userId,
      value: v.value,
      recordedAt: new Date(v.takenAt),
      source: 'cgm',
      unit: 'mg/dL'
    }));

    const result = await storage.bulkInsertCgmSamples(userId, readings);

    res.status(201).json({ inserted: readings.length });
  } catch (error) {
    console.error("Error bulk inserting CGM readings:", error);
    res.status(500).json({ error: "INSERT_FAILED" });
  }
});

// POST /api/cgm/simulate - generate simulated CGM data
cgm.post("/api/cgm/simulate", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { hours = 24 } = req.body;

    // Limit to 72 hours max for cost control
    const limitedHours = Math.min(hours, 72);

    const readings = await cgmService.generateDemoData(userId, limitedHours);

    res.json({
      message: `Generated ${readings.length} simulated CGM readings for ${limitedHours} hours`,
      readings: readings.slice(0, 10), // Return first 10 for preview
      totalGenerated: readings.length
    });
  } catch (error) {
    console.error("Error generating CGM simulation:", error);
    res.status(500).json({ error: "SIMULATION_FAILED" });
  }
});

// GET /api/cgm/status - get CGM device status and latest reading
cgm.get("/api/cgm/status", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const allReadings = await storage.getUserGlucoseReadings(userId, undefined, undefined);
    const cgmReadings = allReadings.filter(reading => reading.source === 'cgm');
    const latestCGM = cgmReadings[0]; // Most recent first

    const timeSinceLastReading = latestCGM 
      ? new Date().getTime() - new Date(latestCGM.recordedAt!).getTime()
      : null;

    const status = {
      isConnected: latestCGM && timeSinceLastReading && timeSinceLastReading < 15 * 60 * 1000, // Connected if reading within 15 mins
      latestReading: latestCGM,
      timeSinceLastReading: timeSinceLastReading ? Math.floor(timeSinceLastReading / 60000) : null, // minutes
      totalCGMReadings: cgmReadings.length,
      deviceId: latestCGM?.cgmDeviceId || null
    };

    res.json(status);
  } catch (error) {
    console.error("Error fetching CGM status:", error);
    res.status(500).json({ error: "STATUS_FAILED" });
  }
});

// POST /api/cgm/import - import CGM data from CSV/JSON files (Pro+ only)
cgm.post("/api/cgm/import", isAuthenticated, requirePlan("pro"), async (req: any, res) => {
  try {
    const { filename, contentBase64 } = req.body ?? {};
    if (!filename || !contentBase64) {
      return res.status(400).json({ error: "BAD_FILE" });
    }

    const userId = req.user.claims.sub;
    const buf = Buffer.from(contentBase64, "base64");
    const text = buf.toString("utf8");
    const lower = filename.toLowerCase();

    let samples;
    if (lower.includes("dexcom")) {
      samples = parseDexcomCsv(text);
    } else if (lower.includes("libre")) {
      samples = parseLibreCsv(text);
    } else if (lower.endsWith(".json")) {
      samples = JSON.parse(text); // expects { value, unit, ts }
    } else {
      samples = parseGenericCsv(text);
    }

    // Normalize & clamp
    const normalized = samples
      .map((s: any) => ({ 
        value_mgdl: toMgdl(s.value, s.unit), 
        takenAt: new Date(s.ts).toISOString(), 
        source: s.source ?? "csv" 
      }))
      .filter((s: any) => Number.isFinite(s.value_mgdl) && s.value_mgdl > 20 && s.value_mgdl < 500);

    // Bounded write: last 3k samples only
    const capped = normalized.slice(-3000);

    await storage.bulkInsertCgmSamples(userId, capped);
    await storage.createCgmImportBatch(userId, {
      source: filename,
      count: capped.length
    });

    res.json({ ok: true, imported: capped.length });
  } catch (error) {
    console.error("Error importing CGM data:", error);
    res.status(500).json({ error: "IMPORT_FAILED" });
  }
});

// GET /api/cgm/samples - get CGM samples with range queries and downsampling
cgm.get("/api/cgm/samples", isAuthenticated, async (req: any, res) => {
  try {
    const q = rangeSchema.safeParse(req.query);
    if (!q.success) {
      return res.status(400).json({ error: "BAD_RANGE" });
    }
    const { start, end } = q.data;
    const userId = req.user.claims.sub;

    // Bounded read with limit
    const rows = await storage.getCgmSamples(userId, { start, end, limit: 3000 });

    // Simple 5-min downsample to keep charts light
    const downsampled: any[] = [];
    let lastBucket = "";
    for (const r of rows) {
      const bucket = new Date(r.takenAt).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      if (bucket !== lastBucket) { 
        downsampled.push(r); 
        lastBucket = bucket; 
      }
    }

    res.json({ ok: true, count: downsampled.length, samples: downsampled });
  } catch (error) {
    console.error("Error fetching CGM samples:", error);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

// DELETE /api/cgm - delete all CGM data for user (Pro+ only)
cgm.delete("/api/cgm", isAuthenticated, requirePlan("pro"), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteAllCgmData(userId);
    res.json({ ok: true, deleted: true });
  } catch (error) {
    console.error("Error deleting CGM data:", error);
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});