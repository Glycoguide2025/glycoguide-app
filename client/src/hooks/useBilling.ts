import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackCheckoutStarted, trackCheckoutCompleted } from '@/utils/analytics';
import { useAuth } from '@/hooks/useAuth';

interface BillingStatus {
  plan: string;
  subscriptionId?: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cached: boolean;
}

interface CheckoutResponse {
  url: string;
}

interface ConfirmResponse {
  success: boolean;
  plan: string;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
  };
}

export function useBillingStatus() {
  return useQuery<BillingStatus>({
    queryKey: ['/api/billing/status'],
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // No refetch on focus
    refetchInterval: false, // No polling
    retry: 2
  });
}

export function useCheckout() {
  return useMutation<CheckoutResponse, Error, { tier: string }>({
    mutationFn: async ({ tier }) => {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier })
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Checkout failed: ${error}`);
      }

      return res.json();
    }
  });
}

export function useConfirmSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation<ConfirmResponse, Error, { sessionId: string }>({
    mutationFn: async ({ sessionId }) => {
      const res = await fetch('/api/billing/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId })
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Confirm failed: ${error}`);
      }

      return res.json();
    },
    onSuccess: () => {
      // Refresh billing status after successful confirmation (no polling)
      queryClient.invalidateQueries({ queryKey: ['/api/billing/status'] });
    }
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['/api/billing/products'],
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  });
}

// Plan entitlements helper
export function entitlements(plan: string) {
  const planLevels = { 'free': 0, 'basic': 0, 'premium': 1, 'pro': 2 };
  const userLevel = planLevels[plan as keyof typeof planLevels] || 0;

  return {
    // Insights full view: plan !== "basic" (so Premium+ and Pro+)
    insightsFull: userLevel >= 1,
    
    // CSV export: Pro+ only (level 2)
    csv: userLevel >= 2,
    
    // PDF export: Premium+ (level 1+)
    pdf: userLevel >= 1,
    
    // Range selector max days
    rangeMax: userLevel === 0 ? '7d' : userLevel === 1 ? '14d' : '30d'
  };
}

// Helper to check if an action is allowed
export function isAllowed(plan: string, feature: keyof ReturnType<typeof entitlements>): boolean {
  return entitlements(plan)[feature] as boolean;
}

// Error types for 402 handling
export interface UpgradeRequiredError {
  error: 'UPGRADE_REQUIRED';
  message: string;
  currentPlan: string;
  requiredPlan: string;
}

export function isUpgradeRequiredError(error: any): error is UpgradeRequiredError {
  return error?.error === 'UPGRADE_REQUIRED';
}