import type { Request, Response, NextFunction } from "express";

/**
 * Middleware that ensures all protected API routes return JSON {error:"UNAUTHENTICATED"} 
 * instead of HTML redirects when user is not authenticated.
 * 
 * Usage:
 * app.use("/api/protected-route", requireAuth, protectedRouter);
 */
export function requireAuth(req: any, res: Response, next: NextFunction) {
  // Check if user is authenticated (user.id should be set by auth middleware)
  console.log('REQUIRE_AUTH: Checking authentication', { 
    hasUser: !!req.user, 
    userId: req.user?.id,
    userStructure: req.user ? Object.keys(req.user) : 'no user'
  });
  
  if (!req.user?.id) {
    console.log('REQUIRE_AUTH: Authentication failed - no user or user ID');
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
  
  console.log('REQUIRE_AUTH: Authentication successful', { userId: req.user.id });
  next();
}

/**
 * Alternative helper for inline auth checking within route handlers
 */
export function checkAuth(req: any, res: Response): boolean {
  if (!req.user?.id) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return false;
  }
  return true;
}