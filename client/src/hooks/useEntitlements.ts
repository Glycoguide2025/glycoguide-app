// client/src/hooks/useEntitlements.ts
import { useQuery } from '@tanstack/react-query';

interface Entitlements {
  pro: boolean;
  plan: string | null;
}

export async function getEntitlements(): Promise<Entitlements> {
  const r = await fetch('/api/me/entitlements', { 
    credentials: 'include', 
    cache: 'no-store' 
  });
  if (!r.ok) return { pro: false, plan: null };
  return r.json();
}

export function useEntitlements() {
  return useQuery<Entitlements>({
    queryKey: ['/api/me/entitlements'],
    queryFn: getEntitlements,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
  });
}