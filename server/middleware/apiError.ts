import { Request, Response, NextFunction } from 'express';

/**
 * API Error Handler Middleware
 * Ensures all /api/* routes return proper JSON error responses
 * Converts 401 responses to {error:"UNAUTHENTICATED"} format
 */
export function apiError(err: any, req: Request, res: Response, next: NextFunction) {
  // Only handle API route errors
  if (!req.path.startsWith('/api/')) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  
  // Handle specific status codes with standard error formats
  if (status === 401) {
    return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Authentication required"
    });
  }

  if (status === 402) {
    return res.status(402).json({
      error: "SUBSCRIPTION_REQUIRED", 
      message: "Upgrade your plan to access this feature"
    });
  }

  if (status === 403) {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "Insufficient permissions"
    });
  }

  if (status === 404) {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Endpoint not found"
    });
  }

  if (status === 429) {
    return res.status(429).json({
      error: "RATE_LIMITED",
      message: "Too many requests, please try again later"
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: err.message || "Invalid request data",
      details: err.errors || undefined
    });
  }

  // Generic server error
  return res.status(status).json({
    error: "INTERNAL_ERROR",
    message: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
  });
}