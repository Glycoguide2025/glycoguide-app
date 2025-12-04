import type { Request } from "express";

/**
 * Standardized session/user extraction helper.
 * Extracts user information from request and provides consistent error handling.
 */

export interface SessionResult {
  user?: {
    id: string;
    email?: string;
    plan?: string;
    planTier?: string;
    [key: string]: any;
  };
  isAuthenticated: boolean;
}

/**
 * Extracts user/session from request object
 * @param req Express request object
 * @returns SessionResult with user info and authentication status
 */
export function getSession(req: any): SessionResult {
  // Check if user is set by authentication middleware
  if (req.user?.id) {
    return {
      user: req.user,
      isAuthenticated: true
    };
  }
  
  return {
    isAuthenticated: false
  };
}

/**
 * Throws standardized authentication error if user is not authenticated
 * @param req Express request object
 * @throws Error with "UNAUTHENTICATED" message if not authenticated
 * @returns User object if authenticated
 */
export function requireSessionOrThrow(req: any) {
  const session = getSession(req);
  
  if (!session.isAuthenticated || !session.user) {
    const error = new Error("UNAUTHENTICATED");
    (error as any).status = 401;
    throw error;
  }
  
  return session.user;
}

/**
 * Helper to get user ID safely
 * @param req Express request object
 * @returns User ID string or null if not authenticated
 */
export function getUserId(req: any): string | null {
  const session = getSession(req);
  return session.isAuthenticated && session.user ? session.user.id : null;
}

/**
 * Helper to check if user has specific plan
 * @param req Express request object
 * @param requiredPlan Plan name to check for
 * @returns Boolean indicating if user has the required plan
 */
export function userHasPlan(req: any, requiredPlan: string): boolean {
  const session = getSession(req);
  if (!session.isAuthenticated || !session.user) return false;
  
  const userPlan = session.user.plan || session.user.planTier || 'free';
  return userPlan === requiredPlan;
}