// Stage 15: Rate limiting middleware
// 30 requests per 5 minutes per user (memory store for cost efficiency)

import { Request, Response, NextFunction } from 'express';

const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(limit = 30, windowMs = 5 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${(req as any).user?.id || req.ip}:${req.path}`;
    const now = Date.now();
    const slot = hits.get(key) ?? { count: 0, reset: now + windowMs };
    
    if (now > slot.reset) { 
      slot.count = 0; 
      slot.reset = now + windowMs; 
    }
    
    slot.count++; 
    hits.set(key, slot);
    
    if (slot.count > limit) {
      return res.status(429).json({ 
        error: "RATE_LIMITED",
        message: "You're moving fast! Take a short pause and try again in a few minutes.",
        retryAfter: Math.ceil((slot.reset - now) / 1000)
      });
    }
    
    next();
  };
}

// Cleanup function to prevent memory leaks (optional periodic cleanup)
export function cleanupRateLimitStore() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  hits.forEach((slot, key) => {
    if (now > slot.reset) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => hits.delete(key));
}