import { Request, Response, NextFunction } from 'express';

/**
 * API Boundary Middleware
 * Enforces JSON-only responses for all /api/* routes
 * Prevents HTML redirects and ensures consistent API behavior
 */
export function apiBoundary(req: Request, res: Response, next: NextFunction) {
  // Exclude OAuth routes from apiBoundary - they need to redirect
  const isOAuthRoute = req.path === '/api/login' || req.path === '/api/callback';
  
  // Only apply to API routes (excluding OAuth routes)
  if (req.path.startsWith('/api/') && !isOAuthRoute) {
    // Override res.redirect to prevent HTML redirects on API routes
    const originalRedirect = res.redirect;
    res.redirect = function(url: string | number, status?: string | number) {
      // If first argument is a number, it's the status code
      const statusCode = typeof url === 'number' ? url : (typeof status === 'number' ? status : 401);
      
      return res.status(statusCode as number).json({
        error: "UNAUTHENTICATED",
        message: "Authentication required for API access"
      });
    };

    // Override res.render to prevent template rendering on API routes
    const originalRender = res.render;
    res.render = function(view: string, options?: any, callback?: any) {
      return res.status(500).json({
        error: "INVALID_RESPONSE_TYPE",
        message: "API routes must return JSON responses only"
      });
    };

    // Set JSON content type by default for API routes
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }

  next();
}