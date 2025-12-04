import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Heart, TrendingUp, CheckCircle, XCircle, Plus, Calendar, Target, Droplets, Activity, HelpCircle, BookOpen } from "lucide-react";
import { format, subDays } from "date-fns";
import BmTipsModal from "@/components/BmTipsModal";
import { Link } from "wouter";

interface BmLog {
  id: string;
  userId: string;
  date: string;
  hasMovement: boolean;
  comfortLevel: number | null;
  createdAt: string;
}

interface BmCheckInResponse {
  ok: boolean;
  date: string;
  outcome: 'success' | 'tips_ease' | 'tips_daily';
  tips: string[];
  links: {
    why_it_matters_md: string;
    why_it_matters_html: string;
  };
}

interface TodaysBmLogResponse {
  hasLog: boolean;
  log?: BmLog;
}

interface BmHistoryResponse {
  logs: BmLog[];
  totalDays: number;
  planLimit: number;
}

export default function BowelMovement() {
  const { toast } = useToast();
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInStep, setCheckInStep] = useState<'movement' | 'comfort'>('movement');
  const [hasMovement, setHasMovement] = useState<boolean | null>(null);
  const [comfortLevel, setComfortLevel] = useState<number | null>(null);
  const [showTipsModal, setShowTipsModal] = useState(false);
  
  // Emergency escape mechanism
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowCheckInForm(false);
      resetForm();
    }
  };
  
  // Add escape key listener
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);
  
  // Force close any stuck dialog immediately on component mount
  useEffect(() => {
    setShowCheckInForm(false);
    resetForm();
  }, []);

  const resetForm = () => {
    setCheckInStep('movement');
    setHasMovement(null);
    setComfortLevel(null);
  };

  // Check if user has already logged today
  const { data: todaysLog } = useQuery<TodaysBmLogResponse>({
    queryKey: ['/api/bm/today'],
  });

  // Fetch BM history
  const { data: historyData, isLoading } = useQuery<BmHistoryResponse>({
    queryKey: ['/api/bm/history'],
  });

  // Create BM log mutation
  const createBmLogMutation = useMutation({
    mutationFn: async (bmData: { had_bm_today: boolean; comfortable?: boolean }) => {
      const response = await apiRequest('/api/bm/checkin', 'POST', bmData);
      return response as BmCheckInResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
      
      toast({
        title: "Check-in Complete!",
        description: `Successfully logged your BM check-in for ${data.date}`,
      });
      setShowCheckInForm(false);
      resetForm();
    },
    onError: (error: any) => {
      const message = error.message === "BM already logged for today" 
        ? "You've already completed today's check-in!"
        : "Failed to save your check-in. Please try again.";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleMovementResponse = (movement: boolean) => {
    setHasMovement(movement);
    if (movement) {
      setCheckInStep('comfort');
    } else {
      // No movement - submit directly
      createBmLogMutation.mutate({ hasMovement: false });
    }
  };

  const handleComfortResponse = (comfort: number) => {
    setComfortLevel(comfort);
    createBmLogMutation.mutate({ 
      hasMovement: true, 
      comfortLevel: comfort 
    });
  };

  // Calculate BM statistics
  const bmStats = historyData?.logs?.reduce((acc: any, log: BmLog) => {
    acc.totalDays += 1;
    if (log.hasMovement) {
      acc.movementDays += 1;
      if (log.comfortLevel && log.comfortLevel >= 4) {
        acc.comfortableDays += 1;
      }
    }
    return acc;
  }, { totalDays: 0, movementDays: 0, comfortableDays: 0 }) || { totalDays: 0, movementDays: 0, comfortableDays: 0 };

  const movementPercentage = bmStats.totalDays > 0 ? 
    Math.round((bmStats.movementDays / bmStats.totalDays) * 100) : 0;
  const comfortPercentage = bmStats.movementDays > 0 ? 
    Math.round((bmStats.comfortableDays / bmStats.movementDays) * 100) : 0;

  const getComfortColor = (level: number | null) => {
    if (!level) return 'text-gray-600 bg-gray-50';
    if (level >= 4) return 'text-green-600 bg-green-50';
    if (level >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getComfortLabel = (level: number | null) => {
    if (!level) return 'Not rated';
    if (level >= 4) return 'Comfortable';
    if (level >= 2) return 'Moderate';
    return 'Uncomfortable';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50" data-testid="bm-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Digestive Wellness
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Track your digestive health and discover patterns that support your overall wellness journey.
          </p>
          
          {/* Tips Button */}
          <Button 
            variant="outline" 
            onClick={() => setShowTipsModal(true)}
            className="gap-2"
            data-testid="button-bm-tips"
          >
            <HelpCircle className="w-4 h-4" />
            Health Tips & Guidance
          </Button>
        </div>

        {/* BM Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {bmStats.totalDays}
              </div>
              <p className="text-sm text-muted-foreground">Days Tracked</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {movementPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Regular Days</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {comfortPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Comfortable</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Daily
              </div>
              <p className="text-sm text-muted-foreground">Recommended</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Exit Instructions */}
        {showCheckInForm && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md z-50">
            Press ESC key to close dialog
          </div>
        )}
        
        {/* Check-in Button */}
        <div className="flex justify-center mb-8">
          {todaysLog?.hasLog ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Today's check-in complete!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Come back tomorrow for your next digestive wellness check-in
              </p>
            </div>
          ) : (
            <Button 
              size="lg" 
              className="text-lg px-8" 
              data-testid="button-bm-checkin"
              onClick={() => setShowCheckInForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Daily Check-in
            </Button>
          )}
        </div>

        {/* BM Check-in Form Modal */}
        {showCheckInForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowCheckInForm(false); resetForm(); }}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              {checkInStep === 'movement' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Daily Check-in</h2>
                    <p className="text-gray-600">
                      Let's track your digestive wellness for today.
                    </p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Did you have a bowel movement today?
                    </h3>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        size="lg"
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => handleMovementResponse(true)}
                        disabled={createBmLogMutation.isPending}
                        data-testid="button-movement-yes"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Yes
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                        onClick={() => handleMovementResponse(false)}
                        disabled={createBmLogMutation.isPending}
                        data-testid="button-movement-no"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        No
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="ghost"
                      onClick={() => { setShowCheckInForm(false); resetForm(); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {checkInStep === 'comfort' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Comfort Level</h2>
                    <p className="text-gray-600">
                      How comfortable was your bowel movement?
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { level: 5, label: "Very Comfortable", description: "Easy and natural" },
                      { level: 4, label: "Comfortable", description: "Smooth with minimal effort" },
                      { level: 3, label: "Moderate", description: "Some effort required" },
                      { level: 2, label: "Uncomfortable", description: "Required significant effort" },
                      { level: 1, label: "Very Uncomfortable", description: "Difficult or painful" }
                    ].map(({ level, label, description }) => (
                      <Button
                        key={level}
                        variant="outline"
                        className="w-full text-left h-auto p-4 hover:bg-orange-50"
                        onClick={() => handleComfortResponse(level)}
                        disabled={createBmLogMutation.isPending}
                        data-testid={`button-comfort-${level}`}
                      >
                        <div>
                          <div className="font-medium">{level} - {label}</div>
                          <div className="text-sm text-muted-foreground">{description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setCheckInStep('movement')}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="ghost"
                      className="flex-1"
                      onClick={() => { setShowCheckInForm(false); resetForm(); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent BM Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-muted h-16 rounded"></div>
                  ))}
                </div>
              ) : !historyData?.logs?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No check-ins yet. Start tracking your digestive wellness!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {historyData.logs.slice(0, 10).map((log: BmLog) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {format(new Date(log.date), 'MMM dd')}
                        </div>
                        {log.hasMovement ? (
                          <Badge className={getComfortColor(log.comfortLevel)}>
                            {getComfortLabel(log.comfortLevel)}
                          </Badge>
                        ) : (
                          <Badge className="text-gray-600 bg-gray-50">
                            No movement
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        {log.hasMovement ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Digestive Health Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Nutrient Absorption</h4>
                    <p className="text-sm text-muted-foreground">Regular bowel movements support your body's ability to absorb essential nutrients effectively.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Gut Health Balance</h4>
                    <p className="text-sm text-muted-foreground">Healthy digestion promotes beneficial gut bacteria and overall digestive wellness.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Energy & Comfort</h4>
                    <p className="text-sm text-muted-foreground">Regular, comfortable movements contribute to daily energy and overall well-being.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Digestive Health Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Digestive Wellness Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Stay Hydrated</h3>
                <p className="text-sm text-muted-foreground">
                  Drink 8 glasses of water daily to keep your digestive system functioning smoothly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Fiber-Rich Foods</h3>
                <p className="text-sm text-muted-foreground">
                  Include vegetables, fruits, whole grains, and legumes to promote healthy digestion.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Regular Movement</h3>
                <p className="text-sm text-muted-foreground">
                  Light physical activity and walking can naturally stimulate healthy digestion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Tracking */}
        {bmStats.totalDays > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Digestive Wellness Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Regular Movement Days</span>
                  <span className="text-sm text-muted-foreground">{bmStats.movementDays} / {bmStats.totalDays}</span>
                </div>
                <Progress value={movementPercentage} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Aim for daily bowel movements to support optimal digestive health and nutrient absorption.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learn More Button */}
        <div className="flex justify-center mb-8">
          <Link href="/articles/digestive/daily-bowel-movement">
            <Button
              variant="outline"
              className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
              data-testid="button-learn-digestive"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More About Digestive Health
            </Button>
          </Link>
        </div>
      </div>

      {/* BM Tips Modal */}
      <BmTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        outcome="general"
      />
    </div>
  );
}