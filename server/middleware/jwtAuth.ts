import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Validates JWT tokens from Cookie or Authorization header
 * Sets req.user for authenticated requests
 */
export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Skip if user is already authenticated via session
    if ((req as any).user) {
      console.log('JWT_AUTH: User already authenticated via session', { userId: (req as any).user.id });
      return next();
    }

    let token: string | undefined;

    // Check for token in cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check Authorization header as fallback
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // No token found, continue without authentication
    if (!token) {
      // Only log for API routes that might need authentication
      if (req.path.startsWith('/api/') && !req.path.includes('/api/auth/')) {
        console.log('JWT_AUTH: No token found for API route:', req.path);
      }
      return next();
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-development-only';
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Set req.user with the same structure as session auth
    (req as any).user = {
      id: decoded.sub,
      email: decoded.email,
      plan: decoded.plan || decoded.subscriptionTier,
      planTier: decoded.plan || decoded.subscriptionTier,
      subscriptionTier: decoded.subscriptionTier || decoded.plan,
      // Add session auth compatibility fields
      expires_at: decoded.exp, // JWT expiration time
      // Add claims structure for compatibility with existing endpoints
      claims: {
        sub: decoded.sub,
        email: decoded.email,
        plan: decoded.plan || decoded.subscriptionTier,
        subscriptionTier: decoded.subscriptionTier || decoded.plan
      }
    };

    // Add isAuthenticated method compatibility for session-based middleware
    (req as any).isAuthenticated = () => true;

    console.log('JWT_AUTH: User authenticated via JWT', { 
      userId: decoded.sub, 
      email: decoded.email, 
      plan: decoded.plan || decoded.subscriptionTier 
    });
    next();
  } catch (error) {
    // JWT verification failed, continue without authentication
    // This allows the requireAuth middleware to handle the 401 response
    console.log('JWT_AUTH: JWT verification failed', { error: (error as Error).message });
    next();
  }
}