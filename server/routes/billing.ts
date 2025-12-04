import { Router } from "express";
import Stripe from "stripe";
import NodeCache from "node-cache";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";

export const billing = Router();

// Initialize Stripe (optional for development)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
  
  // Log Stripe configuration on startup
  const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 8);
  const mode = keyPrefix.startsWith('sk_live_') ? '🟢 LIVE MODE' : keyPrefix.startsWith('sk_test_') ? '🟡 TEST MODE' : '❓ UNKNOWN MODE';
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 STRIPE CONFIGURATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Mode: ${mode}`);
  console.log(`   Key Prefix: ${keyPrefix}...`);
  console.log(`   Premium Price ID: ${process.env.STRIPE_PREMIUM_CARE_PRICE_ID || 'NOT SET'}`);
  console.log(`   Pro Price ID: ${process.env.STRIPE_CARE_PLAN_PRICE_ID || 'NOT SET'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 1-minute billing cache for fast status checks
const cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache

// Plan mapping - Stripe price IDs to plan names
const PLAN_MAPPING = {
  [process.env.STRIPE_PREMIUM_CARE_PRICE_ID || '']: 'premium',
  [process.env.STRIPE_CARE_PLAN_PRICE_ID || '']: 'pro'
} as const;

const PRICE_TO_PLAN = PLAN_MAPPING;
const PLAN_TO_PRICES = {
  premium: [process.env.STRIPE_PREMIUM_CARE_PRICE_ID || ''],
  pro: [process.env.STRIPE_CARE_PLAN_PRICE_ID || '']
};

// Helper functions for enriched billing status
function getFeaturesByPlan(plan: string) {
  const features = {
    free: ['Basic meal tracking', 'Recipe browsing', 'Glucose logging', 'Basic insights'],
    premium: ['CSV data exports', 'Advanced insights & trends', '14-day data range', 'PDF meal reports', 'Priority support'],
    pro: ['Everything in Premium', 'CGM data import', 'Advanced meal planning', '30-day data range', 'Advanced PDF reports', 'Community access']
  };
  return features[plan as keyof typeof features] || features.free;
}

function getLimitsByPlan(plan: string) {
  const limits = {
    free: { dataExport: false, pdfReports: false, dataRange: '7 days', cgmImport: false },
    premium: { dataExport: true, pdfReports: true, dataRange: '14 days', cgmImport: false },
    pro: { dataExport: true, pdfReports: true, dataRange: '30 days', cgmImport: true }
  };
  return limits[plan as keyof typeof limits] || limits.free;
}

// Gating middleware
export function requirePlan(requiredPlan: 'premium' | 'pro') {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const userId = req.user.id;
      const cacheKey = `billing:status:${userId}`;
      
      // Check cache first - get full status object
      let cachedStatus = cache.get(cacheKey) as any;
      let userPlan = cachedStatus?.plan;
      
      if (!userPlan) {
        // Fetch from database and create status object
        const user = await storage.getUser(userId);
        userPlan = user?.subscriptionTier || 'free';
        
        // Create and cache full status object for consistency
        const status = {
          plan: userPlan,
          subscriptionId: user?.stripeSubscriptionId,
          status: 'unknown', // Will be updated by full status check if needed
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          cached: false
        };
        
        cache.set(cacheKey, status);
      }

      // Check if user has required plan
      const planHierarchy = { 'free': 0, 'premium': 1, 'pro': 2 };
      const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
      const requiredLevel = planHierarchy[requiredPlan];

      if (userLevel < requiredLevel) {
        return res.status(402).json({ 
          error: 'UPGRADE_REQUIRED',
          message: `${requiredPlan} plan required`,
          currentPlan: userPlan,
          requiredPlan
        });
      }

      next();
    } catch (error) {
      console.error('Plan gating error:', error);
      res.status(500).json({ error: 'Failed to verify plan' });
    }
  };
}

// Helper function to normalize plan names
function normalizePlan(rawPlan: string | null | undefined): 'free' | 'premium' | 'pro' {
  if (!rawPlan) return 'free';
  const clean = rawPlan.toLowerCase().replace(/[^a-z]/g, '');
  if (clean === 'premium' || clean === 'premiumplus') return 'premium';
  if (clean === 'pro' || clean === 'proplus') return 'pro';
  return 'free';
}

// Helper function to get user plan from database
async function getUserPlanFromDB(userId: string): Promise<string> {
  const user = await storage.getUser(userId);
  return user?.subscriptionTier || 'free';
}

// GET /status - return user's current plan + entitlements
billing.get("/status", requireAuth, async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "UNAUTHENTICATED" });

  // Force no-cache to prevent 304 issues
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  // Get user plan from database and normalize it
  const rawPlan = await getUserPlanFromDB(userId);
  const plan = normalizePlan(rawPlan);
  
  // Temporary debug logging
  console.log(`[BILLING DEBUG] User ID: ${userId}, Raw Plan: ${rawPlan}, Normalized: ${plan}`);

  // Map entitlements by plan - Premium is the HIGHEST tier (rank 2)
  const rank: Record<string, number> = { free: 0, pro: 1, premium: 2 };
  const entitlements = {
    rangeMax: plan === "premium" || plan === "pro" ? "30d" : "7d",
    exportCSV: rank[plan] >= rank.pro,
    exportPDF: rank[plan] >= rank.pro,
    cgmImport: rank[plan] >= rank.pro,
    wearablesImport: rank[plan] >= rank.premium, // Premium-only
    aiCoaching: rank[plan] >= rank.pro,
    communityAccess: rank[plan] >= rank.premium, // Premium-only (Community Hub)
    advancedInsights: rank[plan] >= rank.pro,
    prioritySupport: rank[plan] >= rank.premium, // Premium gets 24hr support
    dataRetention: plan === "premium" ? "unlimited" : plan === "pro" ? "1y" : "30d",
    maxMealLogs: plan === "premium" ? -1 : plan === "pro" ? 1000 : 100
  };

  const response = {
    plan,
    entitlements,
    rank: rank[plan]
  };

  res.json(response);
});

// POST /checkout - create Checkout Session
billing.post('/checkout', requireAuth, async (req: any, res: any) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured', skipped: true });
    }

    const { tier, priceId: legacyPriceId } = req.body;
    const userId = req.user.id;
    const user = await storage.getUser(userId);

    console.log('[CHECKOUT DEBUG] Request body:', { tier, legacyPriceId, userId });
    console.log('[CHECKOUT DEBUG] Env vars:', { 
      premium: process.env.STRIPE_PREMIUM_CARE_PRICE_ID,
      pro: process.env.STRIPE_CARE_PLAN_PRICE_ID
    });

    // Support both tier-based (new) and priceId-based (legacy) requests
    let priceId: string;
    if (tier) {
      // New approach: map tier to price ID
      const tierToPriceId = {
        premium: process.env.STRIPE_PREMIUM_CARE_PRICE_ID,
        pro: process.env.STRIPE_CARE_PLAN_PRICE_ID
      };
      priceId = tierToPriceId[tier as keyof typeof tierToPriceId] || '';
      console.log('[CHECKOUT DEBUG] Mapped tier to priceId:', { tier, priceId });
      if (!priceId) {
        return res.status(400).json({ error: 'Invalid tier or price ID not configured' });
      }
    } else if (legacyPriceId) {
      // Legacy approach: use provided price ID
      priceId = legacyPriceId;
      console.log('[CHECKOUT DEBUG] Using legacy priceId:', priceId);
      if (!PRICE_TO_PLAN[priceId as keyof typeof PRICE_TO_PLAN]) {
        return res.status(400).json({ error: 'Invalid price ID' });
      }
    } else {
      return res.status(400).json({ error: 'Either tier or priceId must be provided' });
    }

    // Create or get Stripe customer
    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || '',
        metadata: { userId }
      });
      customerId = customer.id;
      await storage.updateUser(userId, { stripeCustomerId: customerId });
    }

    const appUrl = process.env.APP_URL || process.env.REPL_URL || 'http://localhost:5000';
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/profile`,
      metadata: { userId }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /confirm - verify after redirect and persist plan data
billing.post('/confirm', requireAuth, async (req: any, res: any) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured', skipped: true });
    }

    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.metadata?.userId !== userId) {
      return res.status(403).json({ error: 'Session does not belong to user' });
    }

    const subscription = session.subscription as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price.id;
    const plan = PRICE_TO_PLAN[priceId as keyof typeof PRICE_TO_PLAN] || 'free';

    // Update user plan and subscription info
    await storage.updateUser(userId, {
      subscriptionTier: plan,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
    });

    // Clear billing cache (fix key mismatch)
    cache.del(`billing:status:${userId}`);

    res.json({
      success: true,
      plan,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
      }
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});

// POST /portal - Stripe Customer Portal link
billing.post('/portal', requireAuth, async (req: any, res: any) => {
  try {
    if (!stripe) {
      console.error('[PORTAL] Stripe not configured');
      return res.status(503).json({ error: 'Stripe not configured', skipped: true });
    }

    const userId = req.user.id;
    console.log('[PORTAL] User ID:', userId);
    console.log('[PORTAL] Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 8));
    
    const user = await storage.getUser(userId);
    console.log('[PORTAL] User data:', { id: user?.id, email: user?.email, stripeCustomerId: user?.stripeCustomerId });

    if (!user?.stripeCustomerId) {
      console.error('[PORTAL] No Stripe customer ID found for user:', userId);
      return res.status(400).json({ error: 'No Stripe customer found. Please subscribe first.' });
    }

    // Construct return URL with multiple fallbacks
    const baseUrl = process.env.CLIENT_URL || process.env.APP_URL || process.env.REPL_URL || 'http://localhost:5000';
    const returnUrl = `${baseUrl}/profile`;
    console.log('[PORTAL] Return URL:', returnUrl);
    console.log('[PORTAL] Creating portal session for customer:', user.stripeCustomerId);
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    console.log('[PORTAL] Portal session created successfully:', portalSession.id);
    console.log('[PORTAL] Portal URL:', portalSession.url);
    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('[PORTAL] Portal error:', error);
    console.error('[PORTAL] Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });
    res.status(500).json({ 
      error: 'Failed to create portal session', 
      details: error.message,
      code: error.code 
    });
  }
});

// GET /products - return plan names + price IDs for UI
billing.get('/products', async (req: any, res: any) => {
  try {
    const products = [
      {
        id: 'premium',
        name: 'Premium',
        description: 'Enhanced diabetes management with CSV exports and advanced insights',
        prices: [
          { id: 'price_premium_monthly', interval: 'month', amount: 1999 }, // $19.99
          { id: 'price_premium_yearly', interval: 'year', amount: 19999 }   // $199.99
        ]
      },
      {
        id: 'pro', 
        name: 'Pro',
        description: 'Full platform access with PDF reports and priority support',
        prices: [
          { id: 'price_pro_monthly', interval: 'month', amount: 1500 }, // $15.00
          { id: 'price_pro_yearly', interval: 'year', amount: 15000 }   // $150.00
        ]
      }
    ];

    res.json({ products });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});