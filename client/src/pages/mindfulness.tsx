import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Play, Clock, Sparkles, Brain, ChevronLeft, ChevronRight, BookOpen, Crown, Lock, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MeditationLibrary } from "@shared/schema";
import { Link } from "wouter";
import { useBillingStatus } from "@/hooks/useBilling";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";

export default function Mindfulness() {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { open: openUpgradeModal } = useUpgradeModal();
  const hasAccess = isPro;
  
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
  const [completedSession, setCompletedSession] = useState<MeditationLibrary | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [lastMeditationDate, setLastMeditationDate] = useState<string | null>(null);
  const activeSessionRef = useRef<HTMLDivElement>(null);
  // Meditation steps for each session type
  const getSessionSteps = (type: string, title: string): string[] => {
    switch (type) {
      case 'breathwork':
        return [
          'Find a comfortable seated position with your back straight.',
          'Close your eyes gently or soften your gaze downward.',
          'Notice your natural breathing rhythm without changing it.',
          'Begin to breathe in slowly through your nose for 4 counts.',
          'Hold your breath gently for 4 counts.',
          'Exhale slowly through your mouth for 6 counts.',
          'Continue this 4-4-6 breathing pattern for several rounds.',
          'If your mind wanders, gently return attention to your breath.',
          'Take 3 more natural breaths before slowly opening your eyes.'
        ];
      case 'body_scan':
        return [
          'Lie down comfortably or sit with your back supported.',
          'Close your eyes and take three deep, calming breaths.',
          'Start by noticing the top of your head. How does it feel?',
          'Slowly move your attention down to your forehead and eyes.',
          'Notice your jaw, neck, and shoulders. Release any tension.',
          'Focus on your arms, hands, and fingers. Let them relax.',
          'Bring awareness to your chest and breathing.',
          'Notice your stomach, lower back, and hips.',
          'Feel your thighs, knees, calves, and feet.',
          'Take a moment to feel your whole body relaxed and at peace.'
        ];
      case 'mindful_walking':
        return [
          'Stand still and take three conscious breaths.',
          'Begin walking very slowly, feeling each step.',
          'Notice how your foot lifts, moves forward, and touches down.',
          'Feel the weight shifting from one foot to the other.',
          'Be aware of your arms swinging naturally at your sides.',
          'If thoughts arise, acknowledge them and return to your steps.',
          'Notice your surroundings without judgment.',
          'Continue for several minutes, staying present with each step.',
          'End by standing still and taking three grateful breaths.'
        ];
      case 'gratitude':
        return [
          'Sit comfortably and place one hand on your heart.',
          'Close your eyes and take three deep breaths.',
          'Think of one thing you\'re grateful for today.',
          'Feel the emotion of gratitude in your heart.',
          'Think of a person who has positively impacted your life.',
          'Send them loving thoughts and appreciation.',
          'Consider a challenge that helped you grow.',
          'Feel grateful for your body and all it does for you.',
          'End by setting an intention of gratitude for your day.'
        ];
      default:
        return [
          'Find a quiet, comfortable place to sit.',
          'Close your eyes and relax your body.',
          'Focus on your natural breathing.',
          'When thoughts arise, gently return to your breath.',
          'Continue for a few minutes in peaceful awareness.',
          'Slowly open your eyes when you\'re ready.'
        ];
    }
  };

  // Fetch meditation sessions (visible to all users)
  const { data: sessions = [], isLoading, error } = useQuery<MeditationLibrary[]>({
    queryKey: ['/api/mindfulness/library'],
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes - meditation library doesn't change often
    refetchOnWindowFocus: false, // COST CONTROL: No auto-refresh on window focus
  });

  // Load streak data from localStorage on mount
  useEffect(() => {
    const storedStreak = localStorage.getItem('meditation_streak');
    const storedLastDate = localStorage.getItem('last_meditation_date');
    if (storedStreak) setMeditationStreak(parseInt(storedStreak));
    if (storedLastDate) setLastMeditationDate(storedLastDate);
  }, []);

  // Auto-scroll to instructions when a meditation is selected
  useEffect(() => {
    if (activeSession && activeSessionRef.current) {
      activeSessionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [activeSession]);

  // Auto-scroll to specific meditation if scrollTo query param is in URL (e.g., ?scrollTo=gratitude)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scrollTo = params.get('scrollTo');
    if (scrollTo && sessions.length > 0) {
      const targetSession = sessions.find(s => s.type === scrollTo);
      if (targetSession) {
        setTimeout(() => {
          const element = document.getElementById(`meditation-${scrollTo}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the card briefly
            element.classList.add('ring-4', 'ring-purple-400');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-purple-400');
            }, 2000);
          }
        }, 500);
      }
    }
  }, [sessions]);

  const startSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSession(sessionId);
      
      toast({
        title: `🧘 Starting "${session.title}"`,
        description: `Follow these meditation steps at your own pace`,
      });
    }
  };
  
  const completeSession = () => {
    const session = sessions.find(s => s.id === activeSession);
    if (session) {
      // Update meditation streak
      updateMeditationStreak();
      setCompletedSession(session);
      setShowReflectionPrompt(true);
    }
    setActiveSession(null);
  };

  // Session completion is now handled by completeSession function

  // Function to update meditation streak
  const updateMeditationStreak = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    
    if (lastMeditationDate === today) {
      // Already meditated today, don't update streak
      return;
    } else if (lastMeditationDate === yesterdayStr) {
      // Consecutive day - increase streak
      newStreak = meditationStreak + 1;
    } else if (!lastMeditationDate || lastMeditationDate < yesterdayStr) {
      // First meditation or broken streak - reset to 1
      newStreak = 1;
    }

    // Update state and localStorage
    setMeditationStreak(newStreak);
    setLastMeditationDate(today);
    localStorage.setItem('meditation_streak', newStreak.toString());
    localStorage.setItem('last_meditation_date', today);

    // Show streak milestone toast
    if (newStreak > 1) {
      toast({
        title: `${newStreak} Day Streak! 🔥`,
        description: `You're building a great mindfulness habit!`,
      });
    }
  };

  // Mutation for saving post-meditation reflection
  const saveReflectionMutation = useMutation({
    mutationFn: async (reflection: string) => {
      const today = new Date().toISOString().split('T')[0];
      return await apiRequest('POST', '/api/reflections', {
        date: today,
        notes: `🧘 After ${completedSession?.title}: ${reflection}`,
        mood: '', stress: '', sleep: '', energy: '', gratitude: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reflections/week'] });
      toast({
        title: "Reflection Saved",
        description: "Your post-meditation reflection has been recorded.",
      });
      setShowReflectionPrompt(false);
      setReflectionText("");
      setCompletedSession(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meditation": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "breathwork": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "body_scan": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "mindful_walking": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "gratitude": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meditation": return "🧘";
      case "breathwork": return "🌬️";
      case "body_scan": return "🫳";
      case "mindful_walking": return "🚶";
      case "gratitude": return "🙏";
      default: return "🧘";
    }
  };

  // Mock sessions for free users (to show locked cards)
  const mockSessions = [
    { id: '1', title: 'Morning Breath Awareness', description: 'Start your day with a simple breathing meditation focused on gentle awareness and presence.', type: 'breathwork', duration: 5 },
    { id: '2', title: 'Body Scan for Relaxation', description: 'A gentle body scan meditation to release tension and connect with your physical sensations.', type: 'body_scan', duration: 8 },
    { id: '3', title: 'Mindful Walking Practice', description: 'A walking meditation to bring mindfulness to your movement and breath coordination.', type: 'mindful_walking', duration: 10 },
    { id: '4', title: 'Gratitude Reflection', description: 'Cultivate appreciation and positive emotions through a focused gratitude practice.', type: 'gratitude', duration: 7 },
    { id: '5', title: 'Quick Stress Relief', description: 'A short meditation for immediate stress relief using proven breathing techniques.', type: 'meditation', duration: 3 },
    { id: '6', title: 'Evening Wind Down', description: 'Gentle meditation to help you transition from day to restful evening relaxation.', type: 'meditation', duration: 6 },
  ];

  // Free users see locked meditation cards with upgrade prompt
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-4xl mx-auto p-4">
          <div className="text-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Mindfulness</h1>
            <p className="text-muted-foreground mb-6">
              Explore the power of mindfulness for your wellbeing
            </p>
          </div>

          {/* Locked Meditation Sessions - Preview for Free Users */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Guided Meditation Sessions</h2>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Pro Feature
              </Badge>
            </div>
            
            {/* Upgrade Message Banner */}
            <Card className="mb-6 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Deepen Your Mindfulness Journey</h3>
                  <p className="text-muted-foreground mb-4">
                    We'd love to support you with guided meditation sessions designed to nurture your well-being. Upgrading to Pro or Premium unlocks gentle practices for breathwork, body awareness, gratitude, and inner peace.
                  </p>
                  <Button
                    onClick={() => openUpgradeModal('premium')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    data-testid="button-upgrade-meditation"
                  >
                    Explore Pro & Premium
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSessions.map((session) => (
                <Card 
                  key={session.id}
                  className="relative opacity-60 hover:opacity-70 transition-all cursor-not-allowed border-2 border-dashed"
                  data-testid={`card-locked-session-${session.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {session.type === 'gratitude' && <span className="text-2xl opacity-50">🙏</span>}
                        <div>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getTypeColor(session.type)} opacity-70`} variant="secondary">
                              {session.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {session.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {session.description}
                    </p>
                    <Button
                      onClick={() => openUpgradeModal('premium')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      data-testid={`button-unlock-${session.id}`}
                    >
                      Upgrade to Unlock
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Educational Articles - Free for Everyone */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Free Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/articles/mindfulness/mind-body-connection">
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle>Mind-Body Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Discover how mindfulness practices strengthen the connection between your mind and body for better health.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/gratitude">
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🙏 Gratitude Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Start your gratitude journal and experience the transformative power of appreciation.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Quick Tips - Free for Everyone */}
          <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">Getting Started with Mindfulness</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>• Start with just 2-3 minutes per day in a quiet space</p>
                <p>• Focus on your breath - notice each inhale and exhale</p>
                <p>• When thoughts arise, gently return attention to your breath</p>
                <p>• Practice at the same time each day to build a habit</p>
                <p>• Be patient with yourself - mindfulness is a journey</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-4">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="button-close-mindfulness"
              aria-label="Close Mindfulness"
            >
              <X className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Mindfulness</h1>
          <p className="text-muted-foreground">
            Take a moment to center yourself with guided meditation and mindfulness practices
          </p>
          
          {/* Streak Counter */}
          {meditationStreak > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full">
              <span className="text-2xl">🔥</span>
              <span className="font-semibold text-orange-800 dark:text-orange-200">
                {meditationStreak} day streak
              </span>
            </div>
          )}
        </div>

        {/* Session Instructions */}

        {/* Active Session Display */}
        {activeSession && (
          <Card ref={activeSessionRef} className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{sessions.find(s => s.id === activeSession)?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Follow these steps at your own pace
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveSession(null)}
                    data-testid="button-exit-session"
                    className="h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* All Steps Listed */}
                <div className="p-4 bg-white rounded-lg border">
                  <ol className="space-y-3">
                    {getSessionSteps(sessions.find(s => s.id === activeSession)?.type || '', '').map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* Complete Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={completeSession}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-complete-session"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Complete Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading mindfulness sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Sessions Available</h3>
              <p className="text-muted-foreground">
                Mindfulness sessions will be available soon. Check back later for guided meditation content.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <Card 
                  key={session.id} 
                  id={`meditation-${session.type}`}
                  className="hover:shadow-lg transition-all duration-300" 
                  data-testid={`card-session-${session.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {session.type === 'gratitude' && <span className="text-2xl">🙏</span>}
                        <div>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTypeColor(session.type)} variant="secondary">
                              {session.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {session.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4" data-testid={`text-description-${session.id}`}>
                      {session.description}
                    </p>
                    <Button
                      onClick={() => startSession(session.id)}
                      className="w-full"
                      variant={activeSession === session.id ? "outline" : "default"}
                      disabled={activeSession === session.id}
                      data-testid={`button-start-${session.id}`}
                    >
                      {activeSession === session.id ? 'In Progress' : 'Start Session'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">💡 Mindfulness Tips</h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Find a quiet, comfortable space where you won't be interrupted</p>
              <p>• Take your time with each step - there's no need to rush</p>
              <p>• Start with shorter sessions (2-3 minutes) and gradually increase duration</p>
              <p>• Practice regularly - even 5 minutes daily can make a difference</p>
              <p>• Be patient with yourself - mindfulness is a skill that develops over time</p>
            </div>
          </CardContent>
        </Card>

        {/* Learn More Button */}
        <div className="flex justify-center mt-6">
          <Link href="/articles/mindfulness/mind-body-connection">
            <Button
              variant="outline"
              className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
              data-testid="button-learn-mindfulness"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More About Mind-Body Connection
            </Button>
          </Link>
        </div>

        {/* Post-Meditation Reflection Dialog */}
        <Dialog open={showReflectionPrompt} onOpenChange={setShowReflectionPrompt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                How do you feel right now?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a moment to notice how your meditation session made you feel.
              </p>
              <Textarea
                placeholder="I feel calm and centered after this practice..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="min-h-[100px]"
                data-testid="textarea-meditation-reflection"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowReflectionPrompt(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-skip-reflection"
                >
                  Skip
                </Button>
                <Button 
                  onClick={() => saveReflectionMutation.mutate(reflectionText)}
                  disabled={!reflectionText.trim() || saveReflectionMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-reflection"
                >
                  {saveReflectionMutation.isPending ? "Saving..." : "Save Reflection"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}