import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { storage } from "../storage";

export const stripeWebhook = Router();

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

// Webhook endpoint - MUST use raw body for signature verification
stripeWebhook.post(
  "/webhook",
  async (req: Request, res: Response) => {
    if (!stripe) {
      console.error('[STRIPE WEBHOOK] Stripe not configured');
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      console.error('[STRIPE WEBHOOK] No signature provided');
      return res.status(400).json({ error: 'No signature' });
    }

    if (!webhookSecret) {
      console.error('[STRIPE WEBHOOK] Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        webhookSecret
      );
    } catch (err: any) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    console.log('[STRIPE WEBHOOK] Event received:', event.type, event.id);

    try {
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentSucceeded(invoice);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentSucceeded(paymentIntent);
          break;
        }

        default:
          console.log('[STRIPE WEBHOOK] Unhandled event type:', event.type);
      }

      // Always return 200 to acknowledge receipt
      res.json({ received: true, eventId: event.id });
    } catch (error: any) {
      console.error('[STRIPE WEBHOOK] Error processing event:', error);
      // Still return 200 to prevent retries
      res.json({ received: true, error: error.message });
    }
  }
);

// Event handlers
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[STRIPE WEBHOOK] Checkout completed:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('[STRIPE WEBHOOK] No userId in session metadata');
    return;
  }

  // Expand subscription to get details
  if (!stripe) return;
  
  const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['subscription']
  });

  const subscription = expandedSession.subscription as Stripe.Subscription;
  if (!subscription) {
    console.error('[STRIPE WEBHOOK] No subscription in session');
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  console.log('[STRIPE WEBHOOK] Updating user subscription:', { userId, plan, priceId });

  // Get user before update to check previous plan
  const user = await storage.getUser(userId);
  const previousPlan = user?.subscriptionTier || 'free';

  await storage.updateUser(userId, {
    subscriptionTier: plan,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
    stripeCustomerId: subscription.customer as string
  });

  // Send upgrade email (checkout is always an upgrade from free)
  if (user?.email && plan !== 'free') {
    try {
      const { sendEmail, upgradeEmailTemplate } = await import('../utils/emailTemplates');
      const userName = user.firstName || 'there';
      await sendEmail(user.email, "Your GlycoGuide Plan Has Been Upgraded 🚀", upgradeEmailTemplate(userName));
    } catch (error) {
      console.error('[EMAIL] Failed to send upgrade email:', error);
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('[STRIPE WEBHOOK] Subscription updated:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) {
    // Try to find user by stripeSubscriptionId
    const user = await storage.getUserByStripeSubscriptionId(subscription.id);
    if (!user) {
      console.error('[STRIPE WEBHOOK] Cannot find user for subscription:', subscription.id);
      return;
    }
    
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanFromPriceId(priceId);
    const previousPlan = user.subscriptionTier || 'free';

    await storage.updateUser(user.id, {
      subscriptionTier: plan,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
    });

    // Send upgrade/downgrade email based on plan change
    if (user.email && plan !== previousPlan) {
      await sendPlanChangeEmail(user.email, user.firstName || 'there', previousPlan, plan);
    }
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);
  
  // Get user before update
  const user = await storage.getUser(userId);
  const previousPlan = user?.subscriptionTier || 'free';

  await storage.updateUser(userId, {
    subscriptionTier: plan,
    subscriptionStatus: subscription.status,
    subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
  });

  // Send upgrade/downgrade email based on plan change
  if (user?.email && plan !== previousPlan) {
    await sendPlanChangeEmail(user.email, user.firstName || 'there', previousPlan, plan);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[STRIPE WEBHOOK] Subscription deleted:', subscription.id);
  
  const user = await storage.getUserByStripeSubscriptionId(subscription.id);
  if (!user) {
    console.error('[STRIPE WEBHOOK] Cannot find user for subscription:', subscription.id);
    return;
  }

  const previousPlan = user.subscriptionTier || 'free';

  await storage.updateUser(user.id, {
    subscriptionTier: 'free',
    subscriptionStatus: 'canceled',
    stripeSubscriptionId: null
  });

  // Send downgrade email when subscription is canceled
  if (user.email && previousPlan !== 'free') {
    try {
      const { sendEmail, downgradeEmailTemplate } = await import('../utils/emailTemplates');
      const userName = user.firstName || 'there';
      await sendEmail(user.email, "Your GlycoGuide Plan Has Been Downgraded ⚙️", downgradeEmailTemplate(userName));
    } catch (error) {
      console.error('[EMAIL] Failed to send downgrade email:', error);
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[STRIPE WEBHOOK] Payment succeeded:', invoice.id);
  
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
  if (!user) {
    console.error('[STRIPE WEBHOOK] Cannot find user for subscription:', subscriptionId);
    return;
  }

  // Update subscription status to active on successful payment
  await storage.updateUser(user.id, {
    subscriptionStatus: 'active'
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[STRIPE WEBHOOK] Payment failed:', invoice.id);
  
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
  if (!user) {
    console.error('[STRIPE WEBHOOK] Cannot find user for subscription:', subscriptionId);
    return;
  }

  // Update subscription status to past_due
  await storage.updateUser(user.id, {
    subscriptionStatus: 'past_due'
  });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('[STRIPE WEBHOOK] Payment Intent succeeded:', paymentIntent.id);
  
  const userId = paymentIntent.metadata?.userId;
  const tier = paymentIntent.metadata?.tier as 'premium' | 'pro';
  
  if (!userId || !tier) {
    console.error('[STRIPE WEBHOOK] Missing userId or tier in payment intent metadata');
    return;
  }

  // Find the user's subscription
  const user = await storage.getUser(userId);
  if (!user) {
    console.error('[STRIPE WEBHOOK] User not found:', userId);
    return;
  }

  const subscriptionId = user.stripeSubscriptionId;
  if (!subscriptionId) {
    console.error('[STRIPE WEBHOOK] No subscription found for user:', userId);
    return;
  }

  // Retrieve subscription to get period end date
  if (!stripe) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  console.log('[STRIPE WEBHOOK] Activating subscription:', { userId, tier, subscriptionId });

  // Update user subscription to active
  await storage.updateUser(userId, {
    subscriptionTier: tier,
    subscriptionStatus: 'active',
    subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
  });
}

// Helper function to send upgrade/downgrade email based on plan change
async function sendPlanChangeEmail(email: string, userName: string, previousPlan: string, newPlan: string) {
  const planTiers = { free: 0, premium: 1, pro: 2 };
  const previousTier = planTiers[previousPlan as keyof typeof planTiers] || 0;
  const newTier = planTiers[newPlan as keyof typeof planTiers] || 0;
  
  try {
    if (newTier > previousTier) {
      // Upgrade
      const { sendEmail, upgradeEmailTemplate } = await import('../utils/emailTemplates');
      await sendEmail(email, "Your GlycoGuide Plan Has Been Upgraded 🚀", upgradeEmailTemplate(userName));
    } else if (newTier < previousTier) {
      // Downgrade
      const { sendEmail, downgradeEmailTemplate } = await import('../utils/emailTemplates');
      await sendEmail(email, "Your GlycoGuide Plan Has Been Downgraded ⚙️", downgradeEmailTemplate(userName));
    }
  } catch (error) {
    console.error('[EMAIL] Failed to send plan change email:', error);
  }
}

// Helper function to map price ID to plan
function getPlanFromPriceId(priceId: string): 'free' | 'premium' | 'pro' {
  const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_CARE_PRICE_ID;
  const PRO_PRICE_ID = process.env.STRIPE_CARE_PLAN_PRICE_ID;

  if (priceId === PREMIUM_PRICE_ID) return 'premium';
  if (priceId === PRO_PRICE_ID) return 'pro';
  
  console.error('[STRIPE WEBHOOK] Unknown price ID:', priceId);
  return 'free';
}
