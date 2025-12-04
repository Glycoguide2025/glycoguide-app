import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Like functions
export function useLikes(postId: string) {
  return useQuery({
    queryKey: ["likes", postId],
    queryFn: async () => {
      const res = await fetch(`/api/community/${postId}/likes`);
      if (!res.ok) throw new Error('Failed to fetch likes');
      return res.json();
    },
  });
}

export function useLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/community/${postId}/like`);
    },
    onSuccess: () => {
      // Invalidate likes count and community posts
      queryClient.invalidateQueries({ queryKey: ["likes", postId] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

export function useUnlike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/community/${postId}/like`);
    },
    onSuccess: () => {
      // Invalidate likes count and community posts
      queryClient.invalidateQueries({ queryKey: ["likes", postId] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

// Comment functions
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/community/${postId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/community/${postId}/comments`, { content });
    },
    onSuccess: () => {
      // Invalidate comments and community posts
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

// Check if user has liked a post
export function useHasLiked(postId: string, userId?: string) {
  return useQuery({
    queryKey: ["hasLiked", postId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const res = await fetch(`/api/community/${postId}/likes`);
      if (!res.ok) return false;
      const data = await res.json();
      // This would need backend support to check if specific user liked it
      // For now, just return the count
      return data.count > 0;
    },
    enabled: !!userId,
  });
}