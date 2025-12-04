import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Plus, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CommunityPost {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  mealId?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked?: boolean;
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postType, setPostType] = useState("discussion");

  // Fetch community feed with like status
  const { data: posts = [], isLoading } = useQuery<(CommunityPost & { isLiked: boolean })[]>({
    queryKey: ['/api/community/posts-with-likes'],
    enabled: !!user,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string; type: string }) => {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts-with-likes'] });
      setShowCreatePost(false);
      setPostContent("");
      setPostTitle("");
      toast({ title: "Post created successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like/unlike post mutations
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiking }: { postId: string; isLiking: boolean }) => {
      const method = isLiking ? 'POST' : 'DELETE';
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts-with-likes'] });
    },
  });

  const handleCreatePost = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (postContent.length > 280) {
      toast({
        title: "Post content too long",
        description: "Maximum 280 characters allowed",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: postTitle,
      content: postContent,
      type: postType,
    });
  };

  const handleLike = (postId: string, currentlyLiked: boolean) => {
    likeMutation.mutate({ postId, isLiking: !currentlyLiked });
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "success_story": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "question": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "tip": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "support": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlanBadge = (tier: string) => {
    if (tier === 'pro') return <Sparkles className="w-3 h-3 text-yellow-500" />;
    if (tier === 'premium') return <Badge variant="secondary" className="text-xs px-1">Premium</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Community</h1>
          </div>
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            size="sm"
            data-testid="button-create-post"
          >
            <Plus className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <Card className="p-4 mb-6" data-testid="card-create-post">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  data-testid="select-post-type"
                >
                  <option value="discussion">Discussion</option>
                  <option value="question">Question</option>
                  <option value="success_story">Success Story</option>
                  <option value="tip">Tip</option>
                  <option value="support">Support</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-2 border rounded-md bg-background"
                  data-testid="input-post-title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content ({postContent.length}/280)
                </label>
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your experience, ask a question, or offer support..."
                  className="min-h-[100px] resize-none"
                  maxLength={280}
                  data-testid="textarea-post-content"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  data-testid="button-submit-post"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePost(false)}
                  data-testid="button-cancel-post"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Community Feed */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading community posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Welcome to the Community!</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your diabetes management journey and connect with others.
              </p>
              <Button onClick={() => setShowCreatePost(true)} data-testid="button-first-post">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-4" data-testid={`card-post-${post.id}`}>
                <div className="space-y-3">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Community Member</span>
                          {getPlanBadge(user?.subscriptionTier || 'free')}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge className={getPostTypeColor(post.type)} variant="secondary">
                      {post.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="font-medium mb-2" data-testid={`text-post-title-${post.id}`}>
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-post-content-${post.id}`}>
                      {post.content}
                    </p>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.isLiked)}
                      disabled={likeMutation.isPending}
                      className={post.isLiked ? "text-red-500" : ""}
                      data-testid={`button-like-${post.id}`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likesCount}
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-comment-${post.id}`}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.commentsCount}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}