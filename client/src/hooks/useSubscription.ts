import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
  endDate?: string;
  stripeSubscriptionId?: string;
}

export function useSubscription() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["/api/subscriptions/status"],
    enabled: !authLoading && !!isAuthenticated, // CRITICAL: Wait for auth loading to complete
  });

  const subscriptionData = subscription as SubscriptionStatus;
  const isLoading = authLoading || subLoading;

  return {
    subscription: subscriptionData,
    tier: subscriptionData?.tier || 'free',
    status: subscriptionData?.status || 'active',
    isPremium: subscriptionData?.tier === 'premium' || subscriptionData?.tier === 'pro',
    isPro: subscriptionData?.tier === 'pro',
    isLoading,
  };
}

export function checkFeatureAccess(
  requiredTier: 'free' | 'premium' | 'pro',
  userTier: 'free' | 'premium' | 'pro'
): boolean {
  const tierLevels = { free: 0, premium: 1, pro: 2 };
  return tierLevels[userTier] >= tierLevels[requiredTier];
}