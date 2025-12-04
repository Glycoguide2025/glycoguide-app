import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const queryResult = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchInterval: 5 * 60 * 1000, // 5 minutes - keep session warm
    staleTime: 2 * 60 * 1000, // 2 minutes - consider fresh
    queryFn: async () => {
      const response = await fetch("/api/auth/user", { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated, return null instead of throwing
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    }
  });

  const { data: user, isLoading, isFetching, status } = queryResult;

  // Critical fix: Consider loading if:
  // 1. Initial load (isLoading is true)
  // 2. Currently fetching AND we don't have user data yet
  // 3. Query hasn't been attempted yet (status === 'pending')
  const actuallyLoading = isLoading || (isFetching && user === undefined) || status === 'pending';

  // Calculate isPro status - only set to true when we KNOW user is Pro/Premium
  // While loading, default to false but components should check isLoading first
  const isPro = !actuallyLoading && (user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'premium');

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
    isPro, // Stable Premium status check
  };
}
