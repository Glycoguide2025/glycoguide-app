// server/middleware/requirePlan.ts
import { hasProEntitlement } from '../entitlements';

type Plan = "free" | "pro" | "premium";
const rank: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

export function requirePlan(min: Plan = 'pro') {
  return async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    // Fetch user's subscription tier from database for custom auth users
    let dbUser = null;
    try {
      const { storage } = await import('../storage.js');
      const userId = req.user.id || req.user.claims?.sub;
      if (userId) {
        dbUser = await storage.getUser(userId);
      }
    } catch (error) {
      console.error('[REQUIRE_PLAN] Failed to fetch user plan:', error);
    }
    
    // Populate user plan from database
    if (dbUser) {
      req.user.planTier = dbUser.subscriptionTier;
      req.user.plan = dbUser.subscriptionTier;
    }

    const ok = hasProEntitlement(req.user);
    console.log('PLAN CHECK', {
      userId: req.user.id || req.user?.claims?.sub,
      email: req.user.email || req.user?.claims?.email,
      seenPlan: req.user?.plan ?? req.user?.planTier ?? req.user?.org?.plan,
      ok,
      path: req.path,
    });

    if (!ok) return res.status(402).json({ error: 'UPGRADE_REQUIRED' });
    next();
  };
}

// Stage 17: Wearables require Pro+ (pro or premium plans)
export function requireProPlus() {
  return async (req: any, res: any, next: any) => {
    console.log('REQUIRE_PRO_PLUS: Starting check', { 
      hasUser: !!req.user, 
      userStructure: req.user ? Object.keys(req.user) : 'no user',
      path: req.path 
    });
    
    if (!req.user) {
      console.log('REQUIRE_PRO_PLUS: No user object, returning 401');
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    // Fetch user's subscription tier from database for custom auth users
    let dbUser = null;
    try {
      const { storage } = await import('../storage.js');
      const userId = req.user.id || req.user.claims?.sub;
      if (userId) {
        dbUser = await storage.getUser(userId);
      }
    } catch (error) {
      console.error('[REQUIRE_PRO_PLUS] Failed to fetch user plan:', error);
    }
    
    // Populate user plan from database
    if (dbUser) {
      req.user.planTier = dbUser.subscriptionTier;
      req.user.plan = dbUser.subscriptionTier;
    }

    const ok = hasProEntitlement(req.user);
    console.log('PLAN CHECK (WEARABLES)', {
      userId: req.user.id || req.user?.claims?.sub,
      email: req.user.email || req.user?.claims?.email,
      seenPlan: req.user?.plan ?? req.user?.planTier ?? req.user?.org?.plan,
      ok,
      path: req.path,
    });

    if (!ok) {
      console.log('REQUIRE_PRO_PLUS: Plan check failed, returning 402');
      return res.status(402).json({ 
        error: "UPGRADE_REQUIRED", 
        need: "pro",
        feature: "wearables_import",
        message: "Wearables data import requires Pro or Premium plan"
      });
    }
    
    console.log('REQUIRE_PRO_PLUS: Plan check passed, proceeding');
    next();
  };
}