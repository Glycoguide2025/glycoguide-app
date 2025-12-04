import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { queryClient } from "@/lib/queryClient";

type Plan = "free" | "premium" | "pro";
type Entitlements = {
  rangeMax: "7d" | "30d" | "90d";
  exportCSV: boolean;
  exportPDF: boolean;
  cgmImport: boolean;
  wearablesImport: boolean;
  aiCoaching: boolean;
  communityAccess: boolean;
  advancedInsights: boolean;
  prioritySupport: boolean;
  dataRetention: "30d" | "1y" | "unlimited";
  maxMealLogs: number;
};

export interface BillingStatus {
  plan: Plan;
  entitlements: Entitlements;
  rank: number;
}

// localStorage key for persisting billing status
const BILLING_CACHE_KEY = 'billing:lastKnown';

// Helper to get last known billing status from localStorage
function getLastKnownBilling(): BillingStatus | null {
  try {
    const stored = localStorage.getItem(BILLING_CACHE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Helper to persist billing status to localStorage
function setLastKnownBilling(status: BillingStatus) {
  try {
    localStorage.setItem(BILLING_CACHE_KEY, JSON.stringify(status));
  } catch {
    // Ignore localStorage errors (e.g., storage quota)
  }
}

/**
 * Hook for checking user's billing status and subscription tier
 * Fetches real data from /api/billing/status endpoint
 * Includes localStorage backup to survive temporary auth failures
 */
export function useBillingStatus() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery<BillingStatus>({
    queryKey: ['/api/billing/status'],
    queryFn: async () => {
      const res = await fetch('/api/billing/status', { 
        credentials: 'include',
        cache: 'no-store'
      });
      
      // Handle 304 gracefully - return cached data
      if (res.status === 304) {
        const cached = queryClient.getQueryData(['/api/billing/status']);
        if (cached) return cached;
      }
      
      // Handle 401 - don't throw, preserve existing data with localStorage backup
      if (res.status === 401) {
        // First try query cache
        const cached = queryClient.getQueryData(['/api/billing/status']);
        if (cached) return cached;
        
        // Then try localStorage backup for Pro users who lost session
        const lastKnown = getLastKnownBilling();
        if (lastKnown) {
          return lastKnown;
        }
        
        // Final fallback for truly new/free users
        return {
          plan: 'free' as const,
          entitlements: {
            rangeMax: '7d' as const,
            exportCSV: false,
            exportPDF: false,
            cgmImport: false,
            wearablesImport: false,
            aiCoaching: false,
            communityAccess: false,
            advancedInsights: false,
            prioritySupport: false,
            dataRetention: '30d' as const,
            maxMealLogs: 100
          },
          rank: 0
        };
      }
      
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      
      // Persist successful billing data to localStorage
      setLastKnownBilling(data);
      
      // Temporary debug logging to see what we're getting
      console.log('[BILLING API DEBUG] Status:', res.status, 'Data:', data);
      return data;
    },
    enabled: true, // Always enabled - handles 401 gracefully
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // No auto-refresh for cost control
  });

  const plan = data?.plan || 'free';
  const entitlements = data?.entitlements;

  // Helper functions for common checks
  const hasFeature = (feature: keyof Entitlements) => entitlements?.[feature] ?? false;
  const isPlanAtLeast = (requiredPlan: Plan) => {
    const ranks = { free: 0, premium: 1, pro: 2 };
    const userRank = data?.rank ?? 0;
    const requiredRank = ranks[requiredPlan];
    return userRank >= requiredRank;
  };

  return {
    data,
    plan,
    entitlements,
    isLoading,
    error,
    hasFeature,
    isPlanAtLeast,
    // Convenience methods
    isFree: plan === 'free',
    isPremium: plan === 'premium',
    isPro: plan === 'pro',
    isPaid: plan !== 'free',
  };
}

/**
 * Legacy hook for backwards compatibility
 * @deprecated Use useBillingStatus() instead
 */
export function useEntitlements() {
  const billing = useBillingStatus();
  
  return {
    plan: billing.plan,
    isLoading: billing.isLoading,
    // Map new entitlements to old format for compatibility
    csv: billing.hasFeature('exportCSV'),
    pdf: billing.hasFeature('exportPDF'),
    rangeMax: billing.entitlements?.rangeMax || '7d',
    canExportData: billing.hasFeature('exportCSV') || billing.hasFeature('exportPDF'),
    canAccessAdvancedInsights: billing.hasFeature('advancedInsights'),
    canAccessCoaching: billing.hasFeature('aiCoaching'),
    hasPrioritySupport: billing.hasFeature('prioritySupport'),
  };
}