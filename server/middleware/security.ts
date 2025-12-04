// Stage 8 RC Hardening: Security Middleware
import { Request, Response, NextFunction } from 'express';

// Security headers middleware for production hardening
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy - Strict but functional for the app
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.replit.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.replit.dev wss://*.replit.dev https://api.anthropic.com https://api.openai.com",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Security headers
  res.setHeader('Content-Security-Policy', cspDirectives);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

// Rate limiting for API endpoints
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowKey = `${clientId}:${Math.floor(now / windowMs)}`;

    const current = requestCounts.get(windowKey) || { count: 0, resetTime: now + windowMs };
    
    if (current.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
      return;
    }

    current.count++;
    requestCounts.set(windowKey, current);

    // Cleanup old entries
    if (requestCounts.size > 1000) {
      const keysToDelete: string[] = [];
      requestCounts.forEach((data, key) => {
        if (data.resetTime < now) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => requestCounts.delete(key));
    }

    next();
  };
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  next();
}

function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip potentially dangerous keys
    if (key.startsWith('__') || key.includes('prototype') || key.includes('constructor')) {
      continue;
    }

    if (typeof value === 'string') {
      // Basic HTML/script tag removal
      sanitized[key] = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    } else {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
}

// Request validation middleware
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  // Check for required headers in API requests
  if (req.path.startsWith('/api/')) {
    // Validate Content-Type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        res.status(400).json({ error: 'Content-Type must be application/json' });
        return;
      }
    }

    // Validate request size
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      res.status(413).json({ error: 'Request too large' });
      return;
    }
  }

  next();
}

// Error logging middleware for production
export function errorLogger(err: any, req: Request, res: Response, next: NextFunction) {
  // Log errors in production for monitoring
  if (process.env.NODE_ENV === 'production') {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      error: {
        message: err.message,
        stack: err.stack?.substring(0, 500), // Truncate stack trace
        status: err.status || 500
      }
    };

    // In a real production app, this would go to a logging service
    console.error('Production Error:', JSON.stringify(errorInfo));
  }

  next(err);
}