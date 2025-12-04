import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * Development Login Route
 * Only enabled when ENABLE_DEV_LOGIN=1 and NODE_ENV=development
 * Allows testing authentication without going through OAuth flow
 */

// Guard: Only enable if ENABLE_DEV_LOGIN=1 and in development
if (process.env.ENABLE_DEV_LOGIN === '1' && process.env.NODE_ENV === 'development') {
  
  router.post('/api/dev/login-as', (req, res) => {
    try {
      const { userId, email, plan } = req.body;
      
      // Validate required fields
      if (!userId || !email) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'userId and email are required'
        });
      }

      // Default to pro plan if not specified
      const userPlan = plan || 'pro';
      
      // Generate JWT token  
      const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-development-only';
      const token = jwt.sign(
        {
          sub: userId,
          email,
          plan: userPlan,
          subscriptionTier: userPlan
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        message: 'Development login successful',
        user: {
          id: userId,
          email,
          plan: userPlan
        }
      });

    } catch (error) {
      console.error('Dev login error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Failed to create development login'
      });
    }
  });

  // Logout endpoint
  router.post('/api/dev/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

} else {
  // If dev login is disabled, return 404 for these routes
  router.all('/api/dev/*', (req, res) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Development endpoints are disabled'
    });
  });
}

export default router;