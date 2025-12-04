import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireProPlus } from "../middleware/requirePlan";
import { storage } from "../storage";
import { z } from "zod";

export const wearables = Router();

const rangeSchema = z.object({ 
  from: z.string().optional(), 
  to: z.string().optional(),
  limit: z.string().optional()
});

// POST /api/wearables/import - import wearable data from CSV/JSON files (Pro+ only)
wearables.post("/api/wearables/import", requireAuth, requireProPlus(), async (req: any, res) => {
  try {
    const { filename, contentBase64, source, device } = req.body ?? {};
    if (!filename || !contentBase64 || !source || !device) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "filename, contentBase64, source, and device are required" });
    }

    const userId = req.user.id || req.user.claims?.sub;
    const buf = Buffer.from(contentBase64, "base64");
    const text = buf.toString("utf8");
    
    // Check file size - max 2MB for cost control
    if (buf.length > 2 * 1024 * 1024) {
      return res.status(413).json({ error: "FILE_TOO_LARGE", message: "File must be under 2MB" });
    }

    const lower = filename.toLowerCase();
    let rawSamples: any[] = [];
    let skippedCount = 0;

    try {
      if (lower.endsWith(".json")) {
        rawSamples = JSON.parse(text);
      } else if (lower.endsWith(".csv")) {
        // Parse CSV - support both single-metric (timestamp,metric,value) and multi-metric (timestamp,steps,calories,etc) formats
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0); // Handle CRLF and skip empty lines
        if (lines.length < 2) {
          return res.status(400).json({ 
            error: "INVALID_CSV", 
            message: "CSV must have header row and at least one data row" 
          });
        }
        
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const timestampCol = headers.findIndex(h => h.includes('time') || h.includes('date'));
        
        if (timestampCol === -1) {
          return res.status(400).json({ 
            error: "INVALID_CSV", 
            message: "CSV must have a timestamp column" 
          });
        }

        // Check if it's single-metric format (has explicit metric and value columns)
        const metricCol = headers.findIndex(h => h.includes('metric') || h.includes('type'));
        const valueCol = headers.findIndex(h => h.includes('value') || h.includes('amount'));
        
        if (metricCol !== -1 && valueCol !== -1) {
          // Single-metric format: timestamp, metric, value
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const cols = line.split(',').map(c => c.trim());
            if (cols.length > Math.max(timestampCol, metricCol, valueCol)) {
              rawSamples.push({
                timestamp: cols[timestampCol],
                metric: cols[metricCol],
                value: cols[valueCol]
              });
            }
          }
        } else {
          // Multi-metric format: timestamp, steps, calories, heartRate, etc.
          const metricColumns: Array<{index: number, metric: string}> = [];
          const validMetrics = ['steps', 'heart_rate', 'calories', 'sleep_duration', 'distance', 'active_minutes'];
          
          // Map header names to our metric names
          const metricMapping: Record<string, string> = {
            'steps': 'steps',
            'heartrate': 'heart_rate',
            'heart_rate': 'heart_rate', 
            'calories': 'calories',
            'sleep_duration': 'sleep_duration',
            'sleepduration': 'sleep_duration',
            'sleep': 'sleep_duration',
            'distance': 'distance',
            'active_minutes': 'active_minutes',
            'activeminutes': 'active_minutes',
            'activity_minutes': 'active_minutes'
          };
          
          // Find metric columns
          headers.forEach((header, index) => {
            if (index === timestampCol) return; // Skip timestamp column
            
            const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
            const mappedMetric = metricMapping[normalizedHeader] || metricMapping[header];
            
            if (mappedMetric && validMetrics.includes(mappedMetric)) {
              metricColumns.push({ index, metric: mappedMetric });
            }
          });
          
          if (metricColumns.length === 0) {
            return res.status(400).json({ 
              error: "INVALID_CSV", 
              message: "No valid metric columns found. Supported: steps, calories, heartRate, sleep_duration, distance, active_minutes" 
            });
          }
          
          // Parse data rows - create one sample per metric per row
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const cols = line.split(',').map(c => c.trim());
            if (cols.length <= timestampCol) continue; // Skip incomplete rows
            
            const timestamp = cols[timestampCol];
            
            // Create a sample for each metric column that has data
            metricColumns.forEach(({ index, metric }) => {
              if (index < cols.length && cols[index] && cols[index] !== '0' && cols[index] !== '') {
                rawSamples.push({
                  timestamp,
                  metric,
                  value: cols[index]
                });
              }
            });
          }
        }
      } else {
        return res.status(400).json({ error: "UNSUPPORTED_FORMAT", message: "Only CSV and JSON files are supported" });
      }
    } catch (parseError) {
      return res.status(400).json({ error: "PARSE_FAILED", message: "Unable to parse file content" });
    }

    // Normalize and validate samples
    const validMetrics = ['steps', 'heart_rate', 'calories', 'sleep_duration', 'distance', 'active_minutes'];
    const normalized: any[] = [];

    for (const sample of rawSamples) {
      try {
        const timestamp = new Date(sample.timestamp || sample.ts || sample.time);
        const metric = (sample.metric || sample.type)?.toLowerCase()?.replace(/[^a-z_]/g, '_');
        const value = parseFloat(sample.value || sample.amount || 0);

        // Validate data
        if (!isFinite(timestamp.getTime())) {
          skippedCount++;
          continue;
        }
        if (!validMetrics.includes(metric)) {
          skippedCount++;
          continue;
        }
        if (!isFinite(value) || value < 0) {
          skippedCount++;
          continue;
        }

        normalized.push({
          ts: timestamp.toISOString(),
          metric,
          value: value.toString()
        });
      } catch (error) {
        skippedCount++;
      }
    }

    // Cost guardrails - cap at 500 samples per import, use last N for recency (like CGM)
    const capped = normalized.slice(-500);
    
    if (capped.length === 0) {
      return res.status(400).json({ 
        error: "NO_VALID_DATA", 
        message: "No valid wearable data found in file",
        skipped: skippedCount
      });
    }

    // Create import batch first
    const batch = await storage.createWearableImportBatch(userId, {
      source,
      device,
      filename,
      rowCount: capped.length,
      skippedCount
    });

    // Insert samples linked to batch
    await storage.upsertWearableSamples(batch.id, capped);

    res.json({ 
      success: true, 
      imported: capped.length, 
      skipped: skippedCount,
      batchId: batch.id,
      message: `Successfully imported ${capped.length} wearable data points`
    });

  } catch (error) {
    console.error("Error importing wearable data:", error);
    res.status(500).json({ error: "IMPORT_FAILED", message: "Failed to import wearable data" });
  }
});

// GET /api/wearables/series/:metric - get time series data for a specific metric (Pro+ only)
wearables.get("/api/wearables/series/:metric", requireAuth, requireProPlus(), async (req: any, res) => {
  try {
    const { metric } = req.params;
    const q = rangeSchema.safeParse(req.query);
    if (!q.success) {
      return res.status(400).json({ error: "BAD_RANGE", message: "Invalid query parameters" });
    }

    const { from, to, limit } = q.data;
    const userId = req.user.id || req.user.claims?.sub;
    
    // Validate metric
    const validMetrics = ['steps', 'heart_rate', 'calories', 'sleep_duration', 'distance', 'active_minutes'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ error: "INVALID_METRIC", message: `Metric must be one of: ${validMetrics.join(', ')}` });
    }

    // Add cost guardrails - validate and cap limit
    let effectiveLimit: number | undefined;
    if (limit) {
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ error: "INVALID_LIMIT", message: "Limit must be a positive integer" });
      }
      // Cap at 1000 max, default 500
      effectiveLimit = Math.min(parsedLimit, 1000);
    } else {
      effectiveLimit = 500; // default limit
    }

    const samples = await storage.getWearableSeries(userId, metric, {
      from,
      to,
      limit: effectiveLimit
    });

    res.json({
      success: true,
      metric,
      count: samples.length,
      samples: samples.map(s => ({
        timestamp: s.ts,
        value: parseFloat(s.value)
        // source and device are stored in batch, not individual samples
      }))
    });

  } catch (error) {
    console.error("Error fetching wearable series:", error);
    res.status(500).json({ error: "FETCH_FAILED", message: "Failed to fetch wearable series data" });
  }
});

// GET /api/wearables/summary - get aggregated summary of wearable data (Pro+ only)
wearables.get("/api/wearables/summary", requireAuth, requireProPlus(), async (req: any, res) => {
  try {
    const userId = req.user.id || req.user.claims?.sub;
    const { range = '7d' } = req.query;
    
    // Validate range
    const validRanges = ['7d', '14d', '30d'];
    if (!validRanges.includes(range as string)) {
      return res.status(400).json({ error: "INVALID_RANGE", message: `Range must be one of: ${validRanges.join(', ')}` });
    }

    const summary = await storage.getWearableSummary(userId, range as string);

    res.json({
      success: true,
      range,
      summary: {
        totalSteps: summary.steps,
        averageHeartRate: summary.heartRate,
        totalCalories: summary.calories,
        totalSleepMinutes: summary.sleepMinutes,
        // Convert sleep minutes to hours for better UX
        totalSleepHours: summary.sleepMinutes ? Math.round((summary.sleepMinutes / 60) * 10) / 10 : 0
      }
    });

  } catch (error) {
    console.error("Error fetching wearable summary:", error);
    res.status(500).json({ error: "FETCH_FAILED", message: "Failed to fetch wearable summary" });
  }
});

// GET /api/wearables/status - get import status and data availability (Pro+ only) 
wearables.get("/api/wearables/status", requireAuth, requireProPlus(), async (req: any, res) => {
  try {
    const userId = req.user.id || req.user.claims?.sub;
    
    // Get sample counts for each metric to show data availability
    const metrics = ['steps', 'heart_rate', 'calories', 'sleep_duration', 'distance', 'active_minutes'];
    const status: any = { available: {}, totalSamples: 0 };
    
    for (const metric of metrics) {
      try {
        const samples = await storage.getWearableSeries(userId, metric, { limit: 1 });
        status.available[metric] = samples.length > 0;
        if (samples.length > 0) {
          status.totalSamples++;
        }
      } catch (error) {
        status.available[metric] = false;
      }
    }

    res.json({
      success: true,
      status: {
        hasData: status.totalSamples > 0,
        availableMetrics: Object.keys(status.available).filter(m => status.available[m]),
        metricsStatus: status.available
      }
    });

  } catch (error) {
    console.error("Error fetching wearable status:", error);
    res.status(500).json({ error: "STATUS_FAILED", message: "Failed to fetch wearable status" });
  }
});