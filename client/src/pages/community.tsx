import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, MessageSquare, Heart, TrendingUp, Plus, Star, ThumbsUp, MessageCircle, Award, 
  HelpCircle, Lightbulb, Calendar, UserCheck, Trophy, Crown, Shield, Clock, Target,
  BookOpen, Video, Zap, ChevronRight, Activity, CheckCircle, Timer, MapPin, Lock, X
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useLocation } from "wouter";
import type { 
  CommunityPost, InsertCommunityPost, CommunityGroup, InsertCommunityGroup,
  ExpertQASession, InsertExpertQASession, PeerPartnership, InsertPeerPartnership,
  HealthChallenge, InsertHealthChallenge, User
} from "@shared/schema";

export default function Community() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isPro } = useAuth();
  const [, setLocation] = useLocation();
  const [activeMainTab, setActiveMainTab] = useState('forum');
  const [activeForumTab, setActiveForumTab] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showPartnerSearch, setShowPartnerSearch] = useState(false);
  const [newPost, setNewPost] = useState<Partial<InsertCommunityPost>>({
    type: undefined,
    title: '',
    content: '',
    tags: [],
    isAnonymous: false,
  });
  const [newGroup, setNewGroup] = useState<Partial<InsertCommunityGroup>>({
    name: '',
    description: '',
    category: 'diabetes',
    isPrivate: false,
    maxMembers: 50,
  });
  const [newChallenge, setNewChallenge] = useState<Partial<InsertHealthChallenge>>({
    title: '',
    description: '',
    category: 'mindfulness',
    type: 'daily',
    duration: 7,
    goal: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxParticipants: 100,
  });

  // Fetch community data
  const { data: posts = [], isLoading: postsLoading } = useQuery<CommunityPost[]>({
    queryKey: ['/api/community/posts', { type: activeForumTab !== 'all' ? activeForumTab : undefined }],
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery<CommunityGroup[]>({
    queryKey: ['/api/community/groups'],
  });

  const { data: qaSessions = [], isLoading: qaLoading } = useQuery<ExpertQASession[]>({
    queryKey: ['/api/community/qa-sessions', { upcoming: true }],
  });

  const { data: partnerships = [], isLoading: partnershipsLoading } = useQuery<PeerPartnership[]>({
    queryKey: ['/api/community/partnerships'],
    enabled: !authLoading && !!user, // Wait for auth loading to complete
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<HealthChallenge[]>({
    queryKey: ['/api/community/challenges', { active: true }],
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertCommunityPost) => {
      return await apiRequest('/api/community/posts', 'POST', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      toast({
        title: "Post Created",
        description: "Your community post has been shared successfully!",
      });
      setShowCreatePost(false);
      setNewPost({
        type: undefined,
        title: '',
        content: '',
        tags: [],
        isAnonymous: false,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: InsertCommunityGroup) => {
      return await apiRequest('/api/community/groups', 'POST', groupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/groups'] });
      toast({
        title: "Group Created",
        description: "Your support group has been created successfully!",
      });
      setShowCreateGroup(false);
      setNewGroup({
        name: '',
        description: '',
        category: 'diabetes',
        isPrivate: false,
        maxMembers: 50,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/community/groups/${groupId}/join`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/groups'] });
      toast({
        title: "Joined Group",
        description: "You've successfully joined the support group!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group. It may be full or you may already be a member.",
        variant: "destructive",
      });
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest(`/api/community/challenges/${challengeId}/join`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/challenges'] });
      toast({
        title: "Challenge Joined",
        description: "You've joined the health challenge! Good luck!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join challenge. You may already be participating.",
        variant: "destructive",
      });
    },
  });

  const registerQAMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest(`/api/community/qa-sessions/${sessionId}/register`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/qa-sessions'] });
      toast({
        title: "Registered Successfully",
        description: "You're registered for the Q&A session!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register. The session may be full.",
        variant: "destructive",
      });
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: InsertHealthChallenge) => {
      return await apiRequest('/api/community/challenges', 'POST', challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/challenges'] });
      toast({
        title: "Challenge Created",
        description: "Your health challenge has been created!",
      });
      setShowCreateChallenge(false);
      setNewChallenge({
        title: '',
        description: '',
        category: 'mindfulness',
        type: 'daily',
        duration: 7,
        goal: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        maxParticipants: 100,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts.",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.title?.trim() || !newPost.content?.trim() || !newPost.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(newPost as InsertCommunityPost);
  };

  const handleSubmitGroup = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create groups.",
        variant: "destructive",
      });
      return;
    }

    if (!newGroup.name?.trim() || !newGroup.description?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate(newGroup as InsertCommunityGroup);
  };

  const handleSubmitChallenge = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create challenges.",
        variant: "destructive",
      });
      return;
    }

    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Challenge creation is available for Pro members. Upgrade to unlock this feature!",
        variant: "destructive",
      });
      return;
    }

    if (!newChallenge.title?.trim() || !newChallenge.description?.trim() || !newChallenge.goal?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createChallengeMutation.mutate(newChallenge as InsertHealthChallenge);
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'text-blue-600 bg-blue-50';
      case 'question': return 'text-orange-600 bg-orange-50';
      case 'success_story': return 'text-green-600 bg-green-50';
      case 'tip': return 'text-purple-600 bg-purple-50';
      case 'support': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'discussion': return <MessageSquare className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      case 'success_story': return <Award className="w-4 h-4" />;
      case 'tip': return <Lightbulb className="w-4 h-4" />;
      case 'support': return <Heart className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'diabetes': return <Activity className="w-5 h-5" />;
      case 'nutrition': return <Target className="w-5 h-5" />;
      case 'mindfulness': return <Heart className="w-5 h-5" />;
      case 'movement': return <Zap className="w-5 h-5" />;
      case 'general': return <Users className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUserInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Show loading screen while auth is loading to prevent showing "upgrade" messages
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading Community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800" data-testid="community-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Close Button - Fixed Position Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/')}
            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg border-2"
            data-testid="button-close-community"
            aria-label="Close Community Hub"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Community Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with others on similar wellness journeys. Share experiences, ask questions, and support each other in achieving better health through our comprehensive community features.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
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
                {groups.length}
              </div>
              <p className="text-sm text-muted-foreground">Support Groups</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {qaSessions.length}
              </div>
              <p className="text-sm text-muted-foreground">Expert Sessions</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {partnerships.length}
              </div>
              <p className="text-sm text-muted-foreground">Partnerships</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {challenges.length}
              </div>
              <p className="text-sm text-muted-foreground">Active Challenges</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="forum" data-testid="tab-forum">
              <MessageSquare className="w-4 h-4 mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="groups" data-testid="tab-groups">
              <Users className="w-4 h-4 mr-2" />
              Support Groups
            </TabsTrigger>
            <TabsTrigger value="qa" data-testid="tab-qa">
              <BookOpen className="w-4 h-4 mr-2" />
              Expert Q&A
            </TabsTrigger>
            <TabsTrigger value="partnerships" data-testid="tab-partnerships">
              <UserCheck className="w-4 h-4 mr-2" />
              Partnerships
            </TabsTrigger>
            <TabsTrigger value="challenges" data-testid="tab-challenges">
              <Trophy className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
          </TabsList>

          {/* Forum Content */}
          <TabsContent value="forum" className="space-y-6">
            {/* Create Post Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Community Forum</h2>
              <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-create-post">
                    <Plus className="w-5 h-5 mr-2" />
                    Share Post
                    {!authLoading && !isPro && <span className="ml-2 text-xs opacity-75">(Free: 5/day)</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setShowCreatePost(false)}
                    data-testid="button-close-post-dialog"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <DialogHeader>
                    <DialogTitle>Share with the Community</DialogTitle>
                    <DialogDescription>
                      Your experience and insights can help others on their wellness journey. 
                      {!authLoading && !isPro && " (Free members: 5 posts per day)"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="post-type">Post Type</Label>
                      <Select
                        value={newPost.type || ''}
                        onValueChange={(value) => setNewPost(prev => ({
                          ...prev,
                          type: value as any
                        }))}
                      >
                        <SelectTrigger data-testid="select-post-type">
                          <SelectValue placeholder="Select post type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discussion">💬 Discussion - Start a conversation</SelectItem>
                          <SelectItem value="question">❓ Question - Get help from the community</SelectItem>
                          <SelectItem value="success_story">🏆 Success Story - Share your achievements</SelectItem>
                          <SelectItem value="tip">💡 Tip - Share helpful advice</SelectItem>
                          <SelectItem value="support">💗 Support - Offer or seek emotional support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="post-title">Title</Label>
                      <Input
                        id="post-title"
                        placeholder="Give your post a clear, descriptive title..."
                        value={newPost.title || ''}
                        onChange={(e) => setNewPost(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        data-testid="input-post-title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="post-content">Content</Label>
                      <Textarea
                        id="post-content"
                        placeholder="Share your thoughts, experiences, questions, or advice..."
                        className="min-h-32"
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({
                          ...prev,
                          content: e.target.value
                        }))}
                        data-testid="textarea-post-content"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Please remember: Share experiences, not medical advice. Always consult healthcare professionals for medical decisions.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="post-tags">Tags (Optional)</Label>
                      <Input
                        id="post-tags"
                        placeholder="diabetes, nutrition, mindfulness, movement (comma-separated)"
                        value={newPost.tags?.join(', ') || ''}
                        onChange={(e) => setNewPost(prev => ({
                          ...prev,
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                        }))}
                        data-testid="input-post-tags"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={newPost.isAnonymous || false}
                        onChange={(e) => setNewPost(prev => ({
                          ...prev,
                          isAnonymous: e.target.checked
                        }))}
                        data-testid="checkbox-anonymous"
                      />
                      <Label htmlFor="anonymous" className="text-sm">
                        Post anonymously (your name won't be shown)
                      </Label>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSubmitPost} 
                        disabled={createPostMutation.isPending}
                        className="flex-1"
                        data-testid="button-submit-post"
                      >
                        {createPostMutation.isPending ? 'Sharing...' : 'Share Post'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreatePost(false)}
                        disabled={createPostMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Post Categories */}
            <Tabs value={activeForumTab} onValueChange={setActiveForumTab}>
              <TabsList className="grid w-full grid-cols-6 max-w-2xl mx-auto">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="discussion" data-testid="tab-discussion">Discussions</TabsTrigger>
                <TabsTrigger value="question" data-testid="tab-question">Questions</TabsTrigger>
                <TabsTrigger value="success_story" data-testid="tab-success">Success</TabsTrigger>
                <TabsTrigger value="tip" data-testid="tab-tip">Tips</TabsTrigger>
                <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
              </TabsList>
            </Tabs>

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
                            <div className="h-16 bg-muted rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to start a conversation in our community!
                    </p>
                    <Button onClick={() => setShowCreatePost(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: CommunityPost) => (
                  <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {post.isAnonymous ? '👤' : getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getPostTypeColor(post.type)}>
                                {getPostTypeIcon(post.type)}
                                <span className="ml-1 capitalize">{post.type.replace('_', ' ')}</span>
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {post.isAnonymous ? 'Anonymous' : 'Community Member'} • {formatDistanceToNow(new Date(post.createdAt!))} ago
                              </span>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Post Actions */}
                          <div className="flex items-center gap-6 pt-2">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-600">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {post.likesCount || 0} Helpful
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-600">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.commentsCount || 0} Comments
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Support Groups Content */}
          <TabsContent value="groups" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Support Groups</h2>
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-create-group">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Group
                    {!isPro && <Lock className="w-4 h-4 ml-2" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setShowCreateGroup(false)}
                    data-testid="button-close-group-dialog"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <DialogHeader>
                    <DialogTitle>Create Support Group</DialogTitle>
                    <DialogDescription>
                      Build a focused community around specific wellness topics.
                      {!authLoading && !isPro && " Pro feature - create unlimited groups with advanced features."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        placeholder="e.g., Type 2 Diabetes Support Circle"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        data-testid="input-group-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="group-category">Category</Label>
                      <Select
                        value={newGroup.category || 'diabetes'}
                        onValueChange={(value) => setNewGroup(prev => ({
                          ...prev,
                          category: value
                        }))}
                      >
                        <SelectTrigger data-testid="select-group-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diabetes">🩺 Diabetes Management</SelectItem>
                          <SelectItem value="nutrition">🥗 Nutrition & Diet</SelectItem>
                          <SelectItem value="mindfulness">🧘 Mindfulness & Mental Health</SelectItem>
                          <SelectItem value="movement">🏃 Movement & Exercise</SelectItem>
                          <SelectItem value="general">💬 General Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="group-description">Description</Label>
                      <Textarea
                        id="group-description"
                        placeholder="Describe the purpose and focus of your support group..."
                        className="min-h-24"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        data-testid="textarea-group-description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="member-limit">Member Limit</Label>
                      <Select
                        value={newGroup.maxMembers?.toString() || '50'}
                        onValueChange={(value) => setNewGroup(prev => ({
                          ...prev,
                          maxMembers: parseInt(value)
                        }))}
                      >
                        <SelectTrigger data-testid="select-member-limit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 members</SelectItem>
                          <SelectItem value="50">50 members</SelectItem>
                          <SelectItem value="100">100 members</SelectItem>
                          <SelectItem value="200">200 members</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private-group"
                        checked={newGroup.isPrivate || false}
                        onChange={(e) => setNewGroup(prev => ({
                          ...prev,
                          isPrivate: e.target.checked
                        }))}
                        data-testid="checkbox-private-group"
                      />
                      <Label htmlFor="private-group" className="text-sm">
                        Private group (invitation only)
                      </Label>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSubmitGroup} 
                        disabled={createGroupMutation.isPending || (!isPro && !user)}
                        className="flex-1"
                        data-testid="button-submit-group"
                      >
                        {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateGroup(false)}
                        disabled={createGroupMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupsLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-8 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : groups.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No support groups yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create the first support group and help build our community!
                    </p>
                    <Button onClick={() => setShowCreateGroup(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Group
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                groups.map((group: CommunityGroup) => (
                  <Card key={group.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              {getCategoryIcon(group.category)}
                              <span className="text-white">
                              </span>
                            </div>
                            <div>
                              {group.isPrivate && <Lock className="w-4 h-4 text-muted-foreground mb-1" />}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">{group.description}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{group.memberCount} members</span>
                            <Badge variant="outline" className="text-xs">
                              {group.category}
                            </Badge>
                          </div>
                        </div>

                        <Button 
                          onClick={() => joinGroupMutation.mutate(group.id!)}
                          disabled={joinGroupMutation.isPending || (!isPro && partnerships.length >= 2)}
                          className="w-full"
                          data-testid={`button-join-group-${group.id}`}
                        >
                          {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                        </Button>
                        {!isPro && partnerships.length >= 2 && (
                          <p className="text-xs text-muted-foreground text-center">
                            Free users limited to 2 groups. Upgrade to Pro for unlimited access.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Expert Q&A Content */}
          <TabsContent value="qa" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Expert Q&A Sessions</h2>
              {isPro && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="w-4 h-4 mr-1" />
                  Pro Priority Access
                </Badge>
              )}
            </div>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">Important Disclaimer</h3>
                    <p className="text-amber-700 text-sm">
                      Expert sessions are for educational purposes only. Always consult your healthcare provider for personalized medical advice. 
                      Our experts provide general wellness guidance, not medical diagnoses or treatment recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Q&A Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {qaLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-8 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : qaSessions.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground">
                      Expert Q&A sessions will be scheduled soon. Check back later!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                qaSessions.map((session: ExpertQASession) => (
                  <Card key={session.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            {isPro && (
                              <Badge className="bg-purple-100 text-purple-700">
                                <Crown className="w-3 h-3 mr-1" />
                                Priority
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{session.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(session.scheduledAt), 'MMM d, yyyy • h:mm a')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {session.duration} minutes
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {session.currentParticipants || 0}/{session.maxParticipants || 0} registered
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {session.expertName}
                          </Badge>
                        </div>

                        <Button 
                          onClick={() => registerQAMutation.mutate(session.id!)}
                          disabled={
                            registerQAMutation.isPending || 
                            (session.currentParticipants || 0) >= (session.maxParticipants || 0) ||
                            (!isPro && (session.currentParticipants || 0) >= (session.maxParticipants || 0) * 0.8)
                          }
                          className="w-full"
                          data-testid={`button-register-session-${session.id}`}
                        >
                          {registerQAMutation.isPending ? 'Registering...' : 
                           (session.currentParticipants || 0) >= (session.maxParticipants || 0) ? 'Session Full' :
                           'Register for Session'}
                        </Button>
                        {!isPro && (session.currentParticipants || 0) >= (session.maxParticipants || 0) * 0.8 && (
                          <p className="text-xs text-muted-foreground text-center">
                            Pro members get priority access when sessions fill up.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Partnerships Content */}
          <TabsContent value="partnerships" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Peer Accountability Partnerships</h2>
              <Button size="lg" onClick={() => setShowPartnerSearch(true)} data-testid="button-find-partner">
                <UserCheck className="w-5 h-5 mr-2" />
                Find Partner
              </Button>
            </div>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Partnership Guidelines</h3>
                    <p className="text-green-700 text-sm">
                      Partnerships are about mutual support and encouragement. Share your progress, celebrate successes together, 
                      and provide gentle accountability. Focus on positive reinforcement and understanding.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnerships Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnershipsLoading ? (
                [...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-8 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : partnerships.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-12 pb-12 text-center">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No partnerships yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Find an accountability partner to support each other on your wellness journey!
                    </p>
                    <Button onClick={() => setShowPartnerSearch(true)}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Find Your First Partner
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                partnerships.map((partnership: PeerPartnership) => (
                  <Card key={partnership.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>👥</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">Partnership</h3>
                              <p className="text-sm text-muted-foreground">
                                {partnership.status}
                              </p>
                            </div>
                          </div>
                          <Badge className={partnership.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {partnership.status}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-3">{partnership.goals}</p>
                          <div className="text-xs text-muted-foreground">
                            Started {formatDistanceToNow(new Date(partnership.createdAt!))} ago
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Check In
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Challenges Content */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Health Challenges & Events</h2>
              <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-create-challenge">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Challenge
                    {!isPro && <Lock className="w-4 h-4 ml-2" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setShowCreateChallenge(false)}
                    data-testid="button-close-challenge-dialog"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <DialogHeader>
                    <DialogTitle>Create Health Challenge</DialogTitle>
                    <DialogDescription>
                      Design a wellness challenge to motivate the community.
                      {!authLoading && !isPro && " Challenge creation is a Pro feature."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="challenge-title">Challenge Title</Label>
                      <Input
                        id="challenge-title"
                        placeholder="e.g., 7-Day Mindful Eating Challenge"
                        value={newChallenge.title}
                        onChange={(e) => setNewChallenge(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        data-testid="input-challenge-title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="challenge-category">Category</Label>
                      <Select
                        value={newChallenge.category || 'mindfulness'}
                        onValueChange={(value) => setNewChallenge(prev => ({
                          ...prev,
                          category: value
                        }))}
                      >
                        <SelectTrigger data-testid="select-challenge-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mindfulness">🧘 Mindfulness</SelectItem>
                          <SelectItem value="nutrition">🥗 Nutrition</SelectItem>
                          <SelectItem value="movement">🏃 Movement</SelectItem>
                          <SelectItem value="sleep">😴 Sleep</SelectItem>
                          <SelectItem value="overall">🌟 Overall Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="challenge-description">Description</Label>
                      <Textarea
                        id="challenge-description"
                        placeholder="Describe the challenge, its benefits, and how to participate..."
                        className="min-h-24"
                        value={newChallenge.description}
                        onChange={(e) => setNewChallenge(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        data-testid="textarea-challenge-description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="challenge-duration">Duration (days)</Label>
                      <Select
                        value={newChallenge.duration?.toString() || '7'}
                        onValueChange={(value) => setNewChallenge(prev => ({
                          ...prev,
                          duration: parseInt(value)
                        }))}
                      >
                        <SelectTrigger data-testid="select-challenge-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">1 week</SelectItem>
                          <SelectItem value="14">2 weeks</SelectItem>
                          <SelectItem value="21">3 weeks</SelectItem>
                          <SelectItem value="30">1 month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="challenge-goal">Challenge Goal</Label>
                      <Input
                        id="challenge-goal"
                        placeholder="e.g., Practice mindful eating for 10 minutes each meal"
                        value={newChallenge.goal}
                        onChange={(e) => setNewChallenge(prev => ({
                          ...prev,
                          goal: e.target.value
                        }))}
                        data-testid="input-challenge-goal"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSubmitChallenge} 
                        disabled={createChallengeMutation.isPending || !isPro}
                        className="flex-1"
                        data-testid="button-submit-challenge"
                      >
                        {createChallengeMutation.isPending ? 'Creating...' : 'Create Challenge'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateChallenge(false)}
                        disabled={createChallengeMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challengesLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-8 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : challenges.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No active challenges</h3>
                    <p className="text-muted-foreground mb-6">
                      Create the first wellness challenge to get the community motivated!
                    </p>
                    <Button onClick={() => setShowCreateChallenge(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Challenge
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                challenges.map((challenge: HealthChallenge) => (
                  <Card key={challenge.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{challenge.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Timer className="w-4 h-4" />
                            {challenge.duration} days
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="w-4 h-4" />
                            {challenge.goal}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {challenge.participantCount} participants
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {challenge.category}
                          </Badge>
                        </div>

                        <Button 
                          onClick={() => joinChallengeMutation.mutate(challenge.id!)}
                          disabled={joinChallengeMutation.isPending}
                          className="w-full"
                          data-testid={`button-join-challenge-${challenge.id}`}
                        >
                          {joinChallengeMutation.isPending ? 'Joining...' : 'Join Challenge'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Guidelines */}
        <Card className="mt-12 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Heart className="w-5 h-5" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Be kind and supportive to all members
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Share experiences, not medical advice
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Respect privacy and anonymity choices
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Focus on holistic, diabetes-friendly living
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Keep discussions positive and constructive
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Celebrate successes and support challenges
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Trust and empathy come first
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Report inappropriate content to moderators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}