import type { Request, Response, NextFunction } from "express";

interface PerformanceLog {
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  user_id?: string;
  timestamp: number;
  query_params?: any;
  slow_threshold_exceeded: boolean;
}

// Stage 15: Performance monitoring middleware  
export function performanceMonitor(slowThreshold: number = 800) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Use res.on('finish') to capture completion
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const userId = (req as any).user?.id;
      
      const performanceData: PerformanceLog = {
        method: req.method,
        path: req.route?.path || req.path,
        status: res.statusCode,
        duration_ms: duration,
        user_id: userId,
        timestamp: Date.now(),
        query_params: Object.keys(req.query).length > 0 ? req.query : undefined,
        slow_threshold_exceeded: duration > slowThreshold
      };
      
      // Always log slow requests (>800ms) and errors (>=400 status)
      if (duration > slowThreshold || res.statusCode >= 400) {
        console.warn("[performance]", performanceData);
      }
      
      // Log all requests in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log("[request]", performanceData);
      }
    });
    
    next();
  };
}

// Stage 15: Database performance monitoring helper
export function logDatabaseQuery(operation: string, tableName: string, duration: number, recordCount?: number) {
  const queryLog = {
    type: "database",
    operation,
    table: tableName,
    duration_ms: duration,
    record_count: recordCount,
    timestamp: Date.now(),
    slow: duration > 200 // Flag slow DB queries (>200ms)
  };
  
  if (duration > 200) {
    console.warn("[slow-db]", queryLog);
  } else if (process.env.NODE_ENV === 'development') {
    console.log("[db-query]", queryLog);
  }
}