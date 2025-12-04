import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BACKEND_URL = '';

function getFullUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const fullUrl = `${BACKEND_URL}${path}`;
  console.log('[API URL]', { path, BACKEND_URL, fullUrl, origin: window.location.origin });
  return fullUrl;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        errorMessage = json.message || json.error || errorMessage;
      } else {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      // If parsing fails, use statusText
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const fullUrl = getFullUrl(url);
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('[API Request Error]', {
      method,
      url,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
      const params = new URLSearchParams();
      Object.entries(queryKey[1] as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const fullUrl = getFullUrl(url);
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false, // Don't refetch on every focus (battery drain)
      refetchOnReconnect: true, // CRITICAL: Refetch when connection restored
      refetchOnMount: true, // CRITICAL: Always refetch on mount to ensure fresh data
      retry: 1, // Retry once on failure
      staleTime: 60 * 1000, // Consider data stale after 1 minute (was 30 mins)
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (was 60 mins)
    },
    mutations: { retry: 0 },
  },
});
