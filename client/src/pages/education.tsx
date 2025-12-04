import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Video, 
  Music, 
  Award,
  Clock,
  Search,
  Filter,
  Play,
  CheckCircle,
  Star,
  TrendingUp,
  Target,
  Heart,
  Moon,
  Activity,
  ArrowLeft,
  ArrowRight,
  Lock,
  BookOpenCheck,
  GraduationCap,
  Trophy
} from "lucide-react";
import LessonComplete from "@/components/LessonComplete";
import QuizComponent from "@/components/QuizComponent";
import LearningLibrary from "@/components/LearningLibrary";
import type { EducationContent, EducationProgress, InsertEducationProgress } from "@shared/schema";

interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswer: string;
}

interface EducationContentWithProgress extends EducationContent {
  progress?: EducationProgress;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  isPro: boolean;
  totalModules: number;
}

interface PathModule {
  id: string;
  pathId: string;
  moduleOrder: number;
  isRequired: boolean;
  content: EducationContent;
}

interface PathProgress {
  id: string;
  userId: string;
  pathId: string;
  status: string;
  currentModuleOrder: number;
  completedModules: number[];
  startedAt?: Date;
  completedAt?: Date;
}

type ViewMode = 'overview' | 'path-detail' | 'lesson';

export default function Education() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, isPro } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedContentType, setSelectedContentType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedArticle, setSelectedArticle] = useState<EducationContentWithProgress | null>(null);
  const [articleContentBody, setArticleContentBody] = useState<string>("");
  
  // Learning Path navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedModule, setSelectedModule] = useState<PathModule | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionType, setCompletionType] = useState<'module' | 'path' | 'article'>('module');
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizTotal, setQuizTotal] = useState<number | null>(null);
  
  // Completion data to display in celebration dialog
  const [completionData, setCompletionData] = useState<{ score?: number; total?: number; articleTitle?: string }>({});
  
  // Track the article being completed (for quiz flow)
  const [completingArticle, setCompletingArticle] = useState<EducationContentWithProgress | null>(null);

  // Scroll article dialog to top when opened
  useEffect(() => {
    if (selectedArticle) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"] .overflow-y-auto');
        if (dialogContent) {
          dialogContent.scrollTop = 0;
        }
      }, 50);
    }
  }, [selectedArticle]);

  // Fetch educational content
  const { data: educationContent = [], isLoading: contentLoading } = useQuery<EducationContentWithProgress[]>({
    queryKey: ["/api/education/content", searchQuery, selectedCategory, selectedDifficulty, selectedContentType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (selectedContentType !== 'all') params.set('type', selectedContentType);
      
      const url = `/api/education/content${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch user's learning progress
  const { data: learningProgress = [] } = useQuery<EducationProgress[]>({
    queryKey: ["/api/education/progress"],
    enabled: isAuthenticated,
  });

  // Fetch learning paths
  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/education/paths"],
    queryFn: async () => {
      console.log('[DEBUG] Fetching learning paths, isAuthenticated:', isAuthenticated);
      const res = await fetch('/api/education/paths', { credentials: "include" });
      console.log('[DEBUG] Learning paths response status:', res.status);
      if (!res.ok) {
        console.error('[DEBUG] Learning paths fetch failed:', res.status, res.statusText);
        throw new Error("Failed to fetch learning paths");
      }
      const data = await res.json();
      console.log('[DEBUG] Learning paths data:', data);
      return data;
    },
    enabled: isAuthenticated,
  });

  // Fetch modules for selected path
  const { data: pathModules = [], isLoading: modulesLoading } = useQuery<PathModule[]>({
    queryKey: ["/api/education/paths", selectedPath?.id, "modules"],
    queryFn: async () => {
      const res = await fetch(`/api/education/paths/${selectedPath?.id}/modules`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch modules");
      return await res.json();
    },
    enabled: !!selectedPath,
  });

  // Fetch path progress
  const { data: pathProgress } = useQuery<PathProgress | null>({
    queryKey: ["/api/education/paths", selectedPath?.id, "progress"],
    queryFn: async () => {
      const res = await fetch(`/api/education/paths/${selectedPath?.id}/progress`, {
        credentials: "include"
      });
      if (!res.ok) return null;
      return await res.json();
    },
    enabled: !!selectedPath,
  });

  // Update learning progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: InsertEducationProgress) => {
      return await apiRequest('POST', '/api/education/progress', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/education/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/education/paths", selectedPath?.id, "progress"] });
    },
  });

  // Update path progress mutation
  const updatePathProgressMutation = useMutation({
    mutationFn: async (data: { pathId: string; moduleId: string; completed: boolean }) => {
      return await apiRequest('POST', `/api/education/paths/${data.pathId}/progress`, {
        moduleId: data.moduleId,
        completed: data.completed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education/paths", selectedPath?.id, "progress"] });
    },
  });


  const categories = [
    { value: "all", label: "All Categories", icon: BookOpen, color: "text-gray-600" },
    { value: "mindful_eating", label: "Mindful Eating", icon: Heart, color: "text-red-500" },
    { value: "sleep_hygiene", label: "Sleep Hygiene", icon: Moon, color: "text-blue-500" },
    { value: "movement", label: "Movement & Exercise", icon: Activity, color: "text-green-500" },
    { value: "prediabetes", label: "Pre-diabetes Prevention", icon: Target, color: "text-orange-500" },
    { value: "blood_sugar", label: "Blood Sugar Management", icon: TrendingUp, color: "text-purple-500" },
    { value: "nutrition", label: "Nutrition Science", icon: Star, color: "text-yellow-500" },
    { value: "stress_management", label: "Stress Management", icon: Award, color: "text-pink-500" },
  ];

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'quiz': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getProgressPercentage = (content: EducationContentWithProgress) => {
    return content.progress?.progressPercentage || 0;
  };

  const startContent = async (content: EducationContentWithProgress) => {
    if (content.isPro && !isPro) {
      toast({
        title: "Upgrade Required",
        description: "This content requires a Pro subscription. Upgrade to access premium educational materials.",
        variant: "destructive",
      });
      return;
    }

    // Fetch full article content
    try {
      const res = await fetch(`/api/education/content/${content.id}`, {
        credentials: "include"
      });
      
      if (!res.ok) {
        throw new Error("Failed to load article");
      }
      
      const articleData = await res.json();
      setArticleContentBody(articleData.content || "");
      setSelectedArticle(content);
      
      // Update progress to "in_progress" if not started
      if (user && (!content.progress || content.progress.status === 'not_started')) {
        updateProgressMutation.mutate({
          userId: user.id,
          contentId: content.id,
          status: 'in_progress',
          progressPercentage: 10,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load article content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completedCount = learningProgress.filter(p => p.status === 'completed').length;
  const inProgressCount = learningProgress.filter(p => p.status === 'in_progress').length;

  const filteredContent = educationContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || content.difficulty === selectedDifficulty;
    const matchesType = selectedContentType === 'all' || content.type === selectedContentType;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  // Learning Path Functions
  const startPath = (path: LearningPath) => {
    if (path.isPro && !isPro) {
      toast({
        title: "Upgrade Required",
        description: "This learning path requires a Pro subscription.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPath(path);
    setViewMode('path-detail');
  };

  const openModule = (module: PathModule) => {
    setSelectedModule(module);
    setCurrentLessonIndex(0);
    setViewMode('lesson');
    
    // Load the first lesson content
    startContent(module.content as EducationContentWithProgress);
  };

  const handleLessonRead = () => {
    // User finished reading the lesson - check for quiz
    // In Learning Path mode, check selectedModule; otherwise check selectedArticle
    const quizData = selectedModule 
      ? (selectedModule.content.quizQuestions as QuizQuestion[] | undefined)
      : (selectedArticle?.quizQuestions as QuizQuestion[] | undefined);
    const hasQuiz = quizData && quizData.length > 0;
    
    if (hasQuiz) {
      // QUIZ REQUIRED - Show quiz (cannot bypass)
      // Store which article we're completing (for standalone articles)
      if (selectedArticle && !selectedModule) {
        setCompletingArticle(selectedArticle);
      }
      setShowQuiz(true);
      setSelectedArticle(null); // Close the article dialog
    } else {
      // No quiz exists, allow direct completion
      if (selectedModule) {
        markLessonComplete();
      } else if (selectedArticle) {
        markArticleComplete(selectedArticle);
      }
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore(score);
    setQuizTotal(total);
    setShowQuiz(false);
    
    // Determine if this is a path module or standalone article
    if (selectedModule && selectedPath) {
      // Learning path module completion
      markLessonComplete(score, total);
    } else if (completingArticle) {
      // Standalone article completion
      markArticleComplete(completingArticle, score, total);
      setCompletingArticle(null);
    } else {
      console.error('❌ No module or article to complete!');
      toast({
        title: "Error",
        description: "Unable to mark content as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markLessonComplete = async (score?: number, total?: number) => {
    if (!user || !selectedPath || !selectedModule) return;

    console.log('🎯 Mark Lesson Complete Called', { score, total, module: selectedModule.content.title });

    try {
      // Store completion data for the celebration dialog
      setCompletionData({ score, total });
      
      // Call the /complete endpoint which handles streak tracking
      const response = await apiRequest('POST', '/api/education/complete', {
        contentId: selectedModule.content.id,
        completed: true,
        quizScore: score,
        quizTotal: total,
      });
      
      console.log('✅ Completion API Response:', response);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/education/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/education/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/education/paths", selectedPath.id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-points"] });

      // Update path progress
      await updatePathProgressMutation.mutateAsync({
        pathId: selectedPath.id,
        moduleId: selectedModule.id,
        completed: true
      });

      // Check if this is the last module
      const isLastModule = selectedModule.moduleOrder === pathModules.length;
      
      console.log('📊 Module Order Check:', { 
        currentOrder: selectedModule.moduleOrder, 
        totalModules: pathModules.length,
        isLastModule 
      });
      
      if (isLastModule) {
        // Path complete!
        console.log('🎊 PATH COMPLETE - Showing celebration dialog');
        setCompletionType('path');
        setShowCompletionDialog(true);
      } else {
        // Module complete, show celebration
        console.log('🎉 MODULE COMPLETE - Showing celebration dialog');
        setCompletionType('module');
        setShowCompletionDialog(true);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markArticleComplete = async (article: EducationContentWithProgress, score?: number, total?: number) => {
    if (!user) return;

    console.log('📄 Mark Article Complete Called', { article: article.title, score, total });

    try {
      // Store completion data for the celebration dialog
      setCompletionData({ score, total, articleTitle: article.title });
      
      // Call the /complete endpoint which handles streak tracking
      const response = await apiRequest('POST', '/api/education/complete', {
        contentId: article.id,
        completed: true,
        quizScore: score,
        quizTotal: total,
      });
      
      console.log('✅ Article Completion API Response:', response);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/education/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/education/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-points"] });

      // Show article completion celebration
      console.log('🎉 ARTICLE COMPLETE - Showing celebration dialog');
      setCompletionType('article');
      setShowCompletionDialog(true);
    } catch (error) {
      console.error("Error completing article:", error);
      toast({
        title: "Error",
        description: "Failed to mark article as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goToNextModule = () => {
    console.log('🚀 Continue to Next Module clicked', {
      completionType,
      selectedModule: selectedModule?.content?.title,
      selectedPath: selectedPath?.title
    });
    
    setShowCompletionDialog(false);
    
    if (completionType === 'path') {
      // Return to path overview
      console.log('📚 Returning to path overview');
      setViewMode('overview');
      setSelectedPath(null);
      setSelectedModule(null);
      return;
    }

    // Find next module
    const currentOrder = selectedModule?.moduleOrder || 0;
    const nextModule = pathModules.find(m => m.moduleOrder === currentOrder + 1);
    
    console.log('🔍 Looking for next module', { currentOrder, foundNext: !!nextModule });
    
    if (nextModule) {
      console.log('➡️ Opening next module:', nextModule.content.title);
      openModule(nextModule);
    } else {
      console.log('✅ No more modules, returning to path detail');
      setViewMode('path-detail');
      setSelectedModule(null);
    }
  };

  const isModuleUnlocked = (module: PathModule) => {
    if (!pathProgress) return module.moduleOrder === 1;
    
    // First module is always unlocked
    if (module.moduleOrder === 1) return true;
    
    // Check if previous module is completed
    const completedModules = (pathProgress.completedModules as unknown as string[]) || [];
    const previousModule = pathModules.find(m => m.moduleOrder === module.moduleOrder - 1);
    
    return previousModule ? completedModules.includes(previousModule.id) : false;
  };

  const isModuleCompleted = (module: PathModule) => {
    if (!pathProgress) return false;
    const completedModules = (pathProgress.completedModules as unknown as string[]) || [];
    return completedModules.includes(module.id);
  };

  const getModuleStatus = (module: PathModule) => {
    if (isModuleCompleted(module)) return 'completed';
    if (isModuleUnlocked(module)) return 'unlocked';
    return 'locked';
  };

  const getPathIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '📘';
      case 'intermediate': return '📙';
      case 'advanced': return '📗';
      default: return '📖';
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="education-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <svg 
              viewBox="0 0 48 48" 
              className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0"
              aria-label="GlycoGuide Logo"
            >
              {/* Hands */}
              <path d="M10 30 Q8 25, 10 20 L12 22 Q11 25, 12 28 Z" fill="#5cb85c" />
              <path d="M38 30 Q40 25, 38 20 L36 22 Q37 25, 36 28 Z" fill="#5cb85c" />
              {/* Heart/Plant center */}
              <circle cx="24" cy="18" r="3" fill="#5bc0de" />
              <path d="M24 18 Q20 20, 18 24 Q18 28, 24 32 Q30 28, 30 24 Q30 20, 24 18 Z" fill="#5cb85c" opacity="0.8" />
              <path d="M24 15 L24 18" stroke="#5bc0de" strokeWidth="1.5" />
              <ellipse cx="22" cy="14" rx="1.5" ry="2" fill="#5bc0de" />
              <ellipse cx="26" cy="14" rx="1.5" ry="2" fill="#5bc0de" />
            </svg>
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              GlycoGuide
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Library
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover evidence-based educational content to master diabetes management, build healthy habits, and thrive in your wellness journey.
          </p>
        </div>

        {/* Learning Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressCount}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{educationContent.length}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" data-testid="tab-browse">Browse Content</TabsTrigger>
            <TabsTrigger value="paths" data-testid="tab-learning-paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search educational content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-content"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${category.color}`} />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full md:w-32" data-testid="select-difficulty">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger className="w-full md:w-32" data-testid="select-content-type">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Grid */}
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <LearningLibrary
                selectedType={selectedContentType}
                items={filteredContent}
                onStartContent={startContent}
                getDifficultyColor={getDifficultyColor}
                getProgressPercentage={getProgressPercentage}
                getContentTypeIcon={getContentTypeIcon}
              />
            )}
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            {viewMode === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6" />
                    Structured Learning Paths
                  </CardTitle>
                  <p className="text-muted-foreground">Follow guided learning sequences designed by diabetes educators</p>
                </CardHeader>
                <CardContent>
                  {pathsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : learningPaths.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No learning paths available yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {learningPaths.map((path) => (
                        <Card 
                          key={path.id} 
                          className="border-l-4 border-l-primary hover:shadow-md transition-shadow"
                          data-testid={`card-path-${path.id}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{getPathIcon(path.difficulty)}</span>
                                  <h3 className="font-semibold text-lg">{path.title}</h3>
                                  {path.isPro && (
                                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BookOpenCheck className="w-4 h-4" />
                                    {path.totalModules || 0} Modules
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {path.estimatedDuration}
                                  </span>
                                  <Badge variant="outline" className={getDifficultyColor(path.difficulty)}>
                                    {path.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => startPath(path)}
                                data-testid={`button-start-path-${path.id}`}
                                className="ml-4"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start Path
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {viewMode === 'path-detail' && selectedPath && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setViewMode('overview');
                        setSelectedPath(null);
                      }}
                      data-testid="button-back-to-overview"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getPathIcon(selectedPath.difficulty)}</span>
                    <div>
                      <CardTitle className="text-2xl">{selectedPath.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{selectedPath.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modulesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading modules...</p>
                      </div>
                    ) : pathModules.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No modules available</p>
                      </div>
                    ) : (
                      pathModules.map((module) => {
                        const status = getModuleStatus(module);
                        const isCompleted = status === 'completed';
                        const isLocked = status === 'locked';
                        
                        return (
                          <Card 
                            key={module.id}
                            className={`border-l-4 ${
                              isCompleted ? 'border-l-green-500' : 
                              isLocked ? 'border-l-gray-300 dark:border-l-gray-700 opacity-60' : 
                              'border-l-blue-500'
                            }`}
                            data-testid={`card-module-${module.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                                    {!isCompleted && !isLocked && (
                                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                                        {module.moduleOrder}
                                      </span>
                                    )}
                                    <h3 className="font-semibold">{module.content.title}</h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {module.content.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {module.content.estimatedDuration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {module.content.estimatedDuration} min
                                      </span>
                                    )}
                                    <Badge variant="outline" className={getDifficultyColor(module.content.difficulty)}>
                                      {module.content.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant={isCompleted ? "outline" : "default"}
                                  onClick={() => openModule(module)}
                                  disabled={isLocked}
                                  data-testid={`button-module-${module.id}`}
                                  className="ml-4"
                                >
                                  {isCompleted && (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Review
                                    </>
                                  )}
                                  {!isCompleted && !isLocked && (
                                    <>
                                      <Play className="w-4 h-4 mr-1" />
                                      Start
                                    </>
                                  )}
                                  {isLocked && (
                                    <>
                                      <Lock className="w-4 h-4 mr-1" />
                                      Locked
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <p className="text-muted-foreground">Track your educational journey and achievements</p>
              </CardHeader>
              <CardContent>
                {learningProgress.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No progress yet</h3>
                    <p className="text-muted-foreground mb-4">Start exploring our educational content to track your progress</p>
                    <Button onClick={() => setActiveTab("browse")}>
                      Browse Content
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {learningProgress.map((progress) => {
                      const content = educationContent.find(c => c.id === progress.contentId);
                      if (!content) return null;
                      
                      return (
                        <Card key={progress.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold">{content.title}</h3>
                                <p className="text-sm text-muted-foreground">{content.description}</p>
                              </div>
                              <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'}>
                                {progress.status?.replace('_', ' ') || 'not started'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{progress.progressPercentage}%</span>
                              </div>
                              <Progress value={progress.progressPercentage} className="h-2" />
                              
                              {(progress.timeSpent ?? 0) > 0 && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {progress.timeSpent} minutes spent
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
      
      {/* Article Viewer Dialog */}
      <Dialog open={selectedArticle !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedArticle(null);
          if (viewMode === 'lesson') {
            setViewMode('path-detail');
            setSelectedModule(null);
          }
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              {/* Header */}
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold">
                  {selectedArticle.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getDifficultyColor(selectedArticle.difficulty)}>
                    {selectedArticle.difficulty}
                  </Badge>
                  {selectedArticle.estimatedDuration && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {selectedArticle.estimatedDuration} min
                    </Badge>
                  )}
                  {selectedArticle.isPro && (
                    <Badge variant="secondary">
                      Pro
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              {/* Content */}
              <div className="mt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: articleContentBody }} />
                </div>
                
                {/* Diabetes Education Call-to-Action */}
                {(selectedArticle.category === 'blood_sugar' || selectedArticle.category === 'prediabetes') && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Continue Your Learning Journey
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                          Explore our comprehensive collection of diabetes education courses, interactive quizzes, and expert-curated resources designed to support your wellness journey.
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedArticle(null);
                            setActiveTab('browse');
                            setSelectedCategory('blood_sugar');
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          data-testid="button-explore-diabetes-courses"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Explore Diabetes Courses & Resources
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 border-t pt-4 flex justify-between items-center gap-3">
                {viewMode === 'lesson' && selectedModule ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedArticle(null);
                        setViewMode('path-detail');
                        setSelectedModule(null);
                      }}
                      data-testid="button-back-lesson"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Modules
                    </Button>
                    {(() => {
                      // Check the module content for quiz (not selectedArticle)
                      const quizData = selectedModule.content.quizQuestions as QuizQuestion[] | undefined;
                      const hasQuiz = quizData && quizData.length > 0;
                      
                      if (hasQuiz) {
                        // If there's a quiz, button opens quiz (required to complete)
                        return (
                          <Button 
                            onClick={() => {
                              setShowQuiz(true);
                              // Keep selectedArticle so quiz dialog has content to show
                            }}
                            data-testid="button-take-quiz"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Take the Quiz
                          </Button>
                        );
                      } else {
                        // No quiz, allow direct completion
                        return (
                          <Button 
                            onClick={handleLessonRead}
                            data-testid="button-mark-complete"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Lesson
                          </Button>
                        );
                      }
                    })()}
                  </>
                ) : (
                  <>
                    {(() => {
                      // Check for quiz in standalone article
                      const quizData = selectedArticle.quizQuestions as QuizQuestion[] | undefined;
                      const hasQuiz = quizData && quizData.length > 0;
                      
                      if (hasQuiz) {
                        // Article has a quiz - show "Take Quiz" button
                        return (
                          <Button 
                            onClick={handleLessonRead}
                            data-testid="button-take-quiz"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Take the Quiz
                          </Button>
                        );
                      } else {
                        // No quiz - allow direct completion
                        return (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              if (user) {
                                updateProgressMutation.mutate({
                                  userId: user.id,
                                  contentId: selectedArticle.id,
                                  status: 'completed',
                                  progressPercentage: 100,
                                });
                              }
                              setSelectedArticle(null);
                            }}
                            data-testid="button-mark-complete"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Complete
                          </Button>
                        );
                      }
                    })()}
                    <Button onClick={() => setSelectedArticle(null)} data-testid="button-close-article">
                      Close
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={(open) => {
        if (!open) {
          setShowQuiz(false);
          setCompletingArticle(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl">
          {showQuiz && (selectedModule || completingArticle) && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header - Fixed */}
              <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {(selectedModule?.content?.title || completingArticle?.title || 'Quiz')} - Quiz
                  </DialogTitle>
                  <p className="text-muted-foreground mt-2">
                    Test your understanding with this short quiz
                  </p>
                </DialogHeader>
              </div>
              
              {/* Quiz content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                <QuizComponent
                  questions={((selectedModule?.content?.quizQuestions || completingArticle?.quizQuestions) as QuizQuestion[]) || []}
                  onComplete={handleQuizComplete}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Module/Path/Article Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-2xl border-0 bg-transparent shadow-none">
          <LessonComplete
            type={completionType}
            pathTitle={selectedPath?.title}
            articleTitle={completionData.articleTitle}
            quizScore={completionData.score}
            quizTotal={completionData.total}
            onContinue={goToNextModule}
            onReturnToModules={() => {
              if (completionType === 'article') {
                // For articles, just close the dialog (already on the library page)
                console.log('📄 Return to Library clicked');
                setShowCompletionDialog(false);
              } else {
                // For modules, return to path detail view
                console.log('🔍 Review All Modules clicked - current path:', selectedPath?.title);
                setViewMode('path-detail');
                setSelectedModule(null);
                setTimeout(() => {
                  setShowCompletionDialog(false);
                }, 50);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
