import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PostModal } from "@/components/PostModal";
import { useLocation } from "wouter";
import { 
  Users, MessageSquare, Heart, Plus, ThumbsUp, Award, 
  HelpCircle, Lightbulb, Clock, Trophy, Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import communityThemes from "@/content/community_hub_themes.json";

interface CommunityPost {
  id: string;
  kind: 'tip' | 'win' | 'question';
  title: string;
  body: string;
  created_at: string;
}

interface PostReaction {
  reaction_type: 'like' | 'helpful';
  count: number;
}

export default function CommunityMVP() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { isPaid, isLoading: billingLoading } = useBillingStatus();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tip' | 'win' | 'question'>('all');

  // Calculate current month and week for theme rotation
  const currentTheme = useMemo(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const dayOfMonth = now.getDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7); // 1-4 (or 5)
    
    const monthlyTheme = communityThemes.community_hub.monthly_themes[month];
    const weeklyTheme = monthlyTheme.weekly_themes[Math.min(weekOfMonth - 1, 3)]; // Cap at week 4
    
    return {
      monthly: monthlyTheme,
      weekly: weeklyTheme
    };
  }, []);

  // Fetch community posts
  const { data: postsData, isLoading: postsLoading } = useQuery<{
    items: CommunityPost[];
    nextCursor: string | null;
  }>({
    queryKey: ['/api/community/posts'],
  });

  const posts = postsData?.items || [];

  // Filter posts based on active filter
  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.kind === activeFilter);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { kind: string; title: string; body: string }) => {
      return await apiRequest('/api/community/posts', 'POST', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      toast({
        title: "Post Submitted",
        description: "Your post has been submitted for moderation and will appear once approved.",
      });
      setShowCreatePost(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // React to post mutation
  const reactToPostMutation = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      return await apiRequest(`/api/community/${postId}/react`, 'POST', { reaction_type: reactionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      toast({
        title: "Reaction Added",
        description: "Thank you for your engagement!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPost = (post: { title: string; content: string; type: string }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts.",
        variant: "destructive",
      });
      return;
    }

    // Transform PostModal interface to backend schema
    createPostMutation.mutate({
      kind: post.type,
      title: post.title,
      body: post.content
    });
  };

  const handleReaction = (postId: string, reactionType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to react to posts.",
        variant: "destructive",
      });
      return;
    }

    reactToPostMutation.mutate({ postId, reactionType });
  };

  const getPostTypeColor = (kind: string) => {
    switch (kind) {
      case 'tip': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'win': return 'text-green-600 bg-green-50 border-green-200';
      case 'question': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPostTypeIcon = (kind: string) => {
    switch (kind) {
      case 'tip': return <Lightbulb className="w-4 h-4" />;
      case 'win': return <Trophy className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPostTypeLabel = (kind: string) => {
    switch (kind) {
      case 'tip': return 'Wellness Tip';
      case 'win': return 'Success Story';
      case 'question': return 'Question';
      default: return 'Post';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" data-testid="community-mvp-page">
      <main className="container mx-auto px-4 py-8 max-w-4xl" role="main" aria-label="Community hub main content">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {communityThemes.community_hub.description}
          </p>
        </header>

        {/* Premium Access Gate */}
        {!billingLoading && !isPaid && (
          <Card className="mb-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">
                Premium Feature
              </h2>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                The Community Hub is available exclusively for Premium and Pro members. Connect with others, share your wellness journey, and find support on your path.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Weekly wellness themes and prompts</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Share tips, wins, and questions</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <Heart className="w-4 h-4 text-purple-500" />
                  <span>Connect with a supportive community</span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setLocation('/profile')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="button-upgrade-community"
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Community Content - Only for Premium/Pro */}
        {!billingLoading && isPaid && (
          <>
        {/* Monthly & Weekly Theme Banner */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" data-testid="theme-banner">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-purple-900" data-testid="monthly-theme">
                    {currentTheme.monthly.name}
                  </h2>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {currentTheme.monthly.month}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-purple-700 mb-3" data-testid="weekly-theme">
                  This Week: {currentTheme.weekly.name}
                </h3>
                <div className="space-y-2">
                  {currentTheme.weekly.prompts.map((prompt, idx) => (
                    <p key={idx} className="text-purple-600 flex items-start gap-2" data-testid={`theme-prompt-${idx}`}>
                      <span className="text-purple-400">•</span>
                      <span>{prompt}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {posts.length}
              </div>
              <p className="text-sm text-muted-foreground">Active Posts</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {posts.filter(p => p.kind === 'win').length}
              </div>
              <p className="text-sm text-muted-foreground">Success Stories</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {posts.filter(p => p.kind === 'tip').length}
              </div>
              <p className="text-sm text-muted-foreground">Wellness Tips</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Post Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Community Posts</h2>
          <Button
            size="lg"
            onClick={() => setShowCreatePost(true)}
            data-testid="button-create-post"
          >
            <Plus className="w-5 h-5 mr-2" />
            Share Your Story
          </Button>
        </div>

        {/* Post Modal */}
        <PostModal
          open={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleSubmitPost}
          isLoading={createPostMutation.isPending}
        />

        {/* Post Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            data-testid="filter-all"
          >
            All Posts ({posts.length})
          </Button>
          <Button
            variant={activeFilter === 'tip' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('tip')}
            data-testid="filter-tips"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Tips ({posts.filter(p => p.kind === 'tip').length})
          </Button>
          <Button
            variant={activeFilter === 'win' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('win')}
            data-testid="filter-wins"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Wins ({posts.filter(p => p.kind === 'win').length})
          </Button>
          <Button
            variant={activeFilter === 'question' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('question')}
            data-testid="filter-questions"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Questions ({posts.filter(p => p.kind === 'question').length})
          </Button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {postsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your wellness journey with the community!
                </p>
                <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-first-post">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`post-${post.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        C
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getPostTypeColor(post.kind)} border`}>
                          {getPostTypeIcon(post.kind)}
                          <span className="ml-1">{getPostTypeLabel(post.kind)}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {(() => {
                            try {
                              const date = new Date(post.created_at);
                              if (isNaN(date.getTime())) {
                                return 'Recently';
                              }
                              return formatDistanceToNow(date, { addSuffix: true });
                            } catch {
                              return 'Recently';
                            }
                          })()}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold text-lg mb-2 text-foreground">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {post.body}
                      </p>

                      {/* Reactions */}
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'like')}
                          disabled={reactToPostMutation.isPending}
                          data-testid={`button-like-${post.id}`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Like
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'helpful')}
                          disabled={reactToPostMutation.isPending}
                          data-testid={`button-helpful-${post.id}`}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Community Guidelines */}
        <aside className="mt-12" aria-label="Community guidelines">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-amber-800 mb-2">Community Guidelines</h3>
              <div className="text-amber-700 text-sm space-y-1">
                <p>• Share experiences and wellness tips, not medical advice</p>
                <p>• Be respectful and supportive of others' journeys</p>
                <p>• Posts are moderated before appearing publicly</p>
                <p>• Always consult healthcare professionals for medical decisions</p>
              </div>
            </CardContent>
          </Card>
        </aside>
        </>
        )}
      </main>
    </div>
  );
}