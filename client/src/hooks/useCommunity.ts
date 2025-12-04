// client/src/hooks/useCommunity.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** ----- Types ----- */
export type CommunityKind = "tip" | "win" | "question";

export interface CommunityPost {
  id: string;
  kind: CommunityKind;
  title: string;
  body: string;
  createdAt: string; // ISO
}

export interface CommunityFeedResponse {
  items: CommunityPost[];
  nextCursor: string | null; // ISO timestamp or null
}

/** Base path (backend uses /api/community) */
const BASE = "/api/community";

/** Small helper */
async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${msg || res.statusText}`);
  }
  return res.json();
}

/** ----- Queries ----- */

/**
 * Fetch the published community feed.
 * Supports cursor-based pagination (createdAt as cursor).
 */
export function useCommunityFeed(params?: { limit?: number; cursor?: string | null }) {
  const limit = params?.limit ?? 20;
  const cursor = params?.cursor ?? null;

  return useQuery({
    queryKey: ["community", { limit, cursor }],
    queryFn: async (): Promise<CommunityFeedResponse> => {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      if (cursor) qs.set("cursor", cursor);
      return jsonFetch<CommunityFeedResponse>(`${BASE}?${qs.toString()}`);
    },
    // cache for a bit; no background polling
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/** ----- Mutations ----- */

/**
 * Create a new community post (draft; pending review).
 * Backend: POST /api/community  { kind, title, body }
 */
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["community:create"],
    mutationFn: async (input: { kind: CommunityKind; title: string; body: string }) => {
      return jsonFetch<{ id: string; status: "PENDING_REVIEW" }>(`${BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      // refetch feed so newly published items (when approved) show up later
      qc.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

/**
 * React to a post (like/helpful).
 * Backend: POST /api/community/:id/react  { kind: 'like'|'helpful' }
 */
export function useReactToPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["community:react"],
    mutationFn: async (input: { postId: string; kind: "like" | "helpful" }) => {
      return jsonFetch<{ ok: true }>(`${BASE}/${input.postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: input.kind }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

/**
 * Admin-only: publish a post.
 * Backend: POST /api/community/:id/publish
 * Use only in admin UI.
 */
export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["community:publish"],
    mutationFn: async (postId: string) => {
      return jsonFetch<{ ok: true }>(`${BASE}/${postId}/publish`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community"] });
    },
  });
}