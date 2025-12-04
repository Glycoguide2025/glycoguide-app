import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Moon, Sun, Clock, TrendingUp, Zap, Brain, Heart, Info, Plus, BookOpen, X } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import type { SleepLog, InsertSleepLog } from "@shared/schema";
import { Link, useLocation } from "wouter";

export default function Sleep() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showLogForm, setShowLogForm] = useState(false);
  
  // Emergency escape mechanism
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowLogForm(false);
    }
  };
  
  // Add escape key listener
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);
  
  // Force close any stuck dialog immediately on component mount
  useEffect(() => {
    setShowLogForm(false);
  }, []);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [newSleepLog, setNewSleepLog] = useState<Partial<InsertSleepLog>>({
    sleepDuration: null,
    sleepQuality: undefined,
    bedtime: undefined,
    wakeTime: undefined,
    notes: '',
  });

  // Fetch sleep logs for the past 30 days
  const { data: sleepLogs = [], isLoading } = useQuery<SleepLog[]>({
    queryKey: ['/api/sleep-logs'],
  });

  // Create sleep log mutation
  const createSleepLogMutation = useMutation({
    mutationFn: async (sleepLogData: InsertSleepLog) => {
      return await apiRequest('/api/sleep-logs', 'POST', sleepLogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-logs'] });
      toast({
        title: "Sleep Log Recorded",
        description: "Your sleep data has been saved successfully!",
      });
      setShowLogForm(false);
      setNewSleepLog({
        sleepDuration: null,
        sleepQuality: undefined,
        bedtime: undefined,
        wakeTime: undefined,
        notes: '',
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your sleep log. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitSleepLog = () => {
    if (!newSleepLog.sleepQuality || !newSleepLog.sleepDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in sleep quality and duration.",
        variant: "destructive",
      });
      return;
    }

    createSleepLogMutation.mutate(newSleepLog as InsertSleepLog);
  };

  // Calculate sleep statistics
  const sleepStats = sleepLogs.reduce((acc: any, log: SleepLog) => {
    acc.totalHours += Number(log.sleepDuration || 0);
    acc.count += 1;
    if (log.sleepQuality === 'excellent') acc.excellentNights += 1;
    if (log.sleepQuality === 'good') acc.goodNights += 1;
    return acc;
  }, { totalHours: 0, count: 0, excellentNights: 0, goodNights: 0 });

  const averageSleep = sleepStats.count > 0 ? (sleepStats.totalHours / sleepStats.count).toFixed(1) : '0';
  const qualitySleepPercentage = sleepStats.count > 0 ? 
    Math.round(((sleepStats.excellentNights + sleepStats.goodNights) / sleepStats.count) * 100) : 0;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50" data-testid="sleep-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Close Button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors z-10"
          aria-label="Close"
          data-testid="button-close-sleep"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sleep Wellness
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your sleep patterns and explore how quality rest supports your overall wellness journey.
          </p>
        </div>

        {/* Sleep Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center border-2 border-indigo-100 dark:border-indigo-900">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                Average Sleep
              </div>
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {averageSleep}h
              </div>
              <p className="text-xs text-muted-foreground">
                {sleepStats.count === 0 ? "Start tracking to see your average" : "Per night"}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-purple-100 dark:border-purple-900">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">
                Nights Tracked
              </div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {sleepStats.count}
              </div>
              <p className="text-xs text-muted-foreground">
                {sleepStats.count === 0 ? "Log your first night below" : "Total logs recorded"}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-green-100 dark:border-green-900">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                Quality Sleep
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {qualitySleepPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                {sleepStats.count === 0 ? "Track to see quality score" : "Good or excellent nights"}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-blue-100 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                Recommended
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                7-9h
              </div>
              <p className="text-xs text-muted-foreground">
                Healthy sleep duration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Exit Instructions */}
        {showLogForm && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md z-50">
            Press ESC key to close dialog
          </div>
        )}
        
        {/* Add Sleep Log Button */}
        <div className="flex justify-center mb-8">
          <Button 
            size="lg" 
            className="text-lg px-8" 
            data-testid="button-add-sleep-log"
            onClick={() => setShowLogForm(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Sleep
          </Button>
        </div>

        {/* Sleep Log Form Modal */}
        {showLogForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLogForm(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Record Sleep</h2>
                <p className="text-gray-600">
                  Record your sleep experience to discover your personal rest patterns.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sleep-duration">Sleep Duration (hours)</Label>
                  <Input
                    id="sleep-duration"
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    placeholder="7.5"
                    value={newSleepLog.sleepDuration || ''}
                    onChange={(e) => setNewSleepLog(prev => ({
                      ...prev,
                      sleepDuration: e.target.value || null
                    }))}
                    data-testid="input-sleep-duration"
                  />
                </div>

                <div>
                  <Label htmlFor="sleep-quality">Sleep Quality</Label>
                  <Select
                    value={newSleepLog.sleepQuality || ''}
                    onValueChange={(value) => setNewSleepLog(prev => ({
                      ...prev,
                      sleepQuality: value as any
                    }))}
                  >
                    <SelectTrigger data-testid="select-sleep-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poor">Restless - Woke up feeling tired</SelectItem>
                      <SelectItem value="fair">Okay - Had some interruptions</SelectItem>
                      <SelectItem value="good">Good - Mostly peaceful sleep</SelectItem>
                      <SelectItem value="excellent">Amazing - Deep, refreshing rest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedtime">Bedtime</Label>
                    <Input
                      id="bedtime"
                      type="time"
                      value={newSleepLog.bedtime ? format(new Date(newSleepLog.bedtime), 'HH:mm') : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const today = new Date();
                          const [hours, minutes] = e.target.value.split(':');
                          const bedtime = new Date(today);
                          bedtime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                          setNewSleepLog(prev => ({
                            ...prev,
                            bedtime: bedtime
                          }));
                        }
                      }}
                      data-testid="input-bedtime"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wake-time">Wake Time</Label>
                    <Input
                      id="wake-time"
                      type="time"
                      value={newSleepLog.wakeTime ? format(new Date(newSleepLog.wakeTime), 'HH:mm') : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const today = new Date();
                          const [hours, minutes] = e.target.value.split(':');
                          const wakeTime = new Date(today);
                          wakeTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                          setNewSleepLog(prev => ({
                            ...prev,
                            wakeTime: wakeTime
                          }));
                        }
                      }}
                      data-testid="input-wake-time"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sleep-notes">Notes (Optional)</Label>
                  <Textarea
                    id="sleep-notes"
                    placeholder="How did you feel? Any factors that affected your sleep?"
                    value={newSleepLog.notes || ''}
                    onChange={(e) => setNewSleepLog(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    data-testid="textarea-sleep-notes"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowLogForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitSleepLog} 
                    disabled={createSleepLogMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-sleep-log"
                  >
                    {createSleepLogMutation.isPending ? 'Saving...' : 'Save Sleep Log'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sleep Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Sleep Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-muted h-16 rounded"></div>
                  ))}
                </div>
              ) : sleepLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Moon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sleep logs yet. Start tracking your sleep patterns!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sleepLogs.slice(0, 10).map((log: SleepLog, index: number) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {format(new Date(log.loggedAt!), 'MMM dd')}
                        </div>
                        <Badge className={getQualityColor(log.sleepQuality)}>
                          {log.sleepQuality}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {log.sleepDuration}h
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
                Sleep & Health Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Balance & Stability</h4>
                    <p className="text-sm text-muted-foreground">Quality rest may support your body's natural balance and daily energy patterns.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Stress & Relaxation</h4>
                    <p className="text-sm text-muted-foreground">Restful sleep supports natural stress management and promotes daily calm.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Recovery & Repair</h4>
                    <p className="text-sm text-muted-foreground">Deep sleep promotes cellular repair and immune system strengthening.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sleep Improvement Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Sleep Optimization Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Morning Light</h3>
                <p className="text-sm text-muted-foreground">
                  Get 10-15 minutes of sunlight within an hour of waking to regulate your circadian rhythm.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Evening Routine</h3>
                <p className="text-sm text-muted-foreground">
                  Create a calming pre-sleep routine: dim lights, avoid screens, practice relaxation techniques.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Sleep Environment</h3>
                <p className="text-sm text-muted-foreground">
                  Keep your bedroom cool (65-68°F), dark, and quiet. Consider blackout curtains and white noise.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Consistent Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Go to bed and wake up at the same time daily, even on weekends, to strengthen your sleep cycle.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Avoid Late Meals</h3>
                <p className="text-sm text-muted-foreground">
                  Allow 2-3 hours between your last meal and bedtime for better digestion and more restful sleep.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Moon className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold mb-2">Mindful Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Practice meditation, deep breathing, or gentle yoga to calm your mind before sleep.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sleep Quality Progress */}
        {sleepStats.count > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Sleep Quality Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quality Sleep Nights</span>
                  <span className="text-sm text-muted-foreground">{sleepStats.excellentNights + sleepStats.goodNights} / {sleepStats.count}</span>
                </div>
                <Progress value={qualitySleepPercentage} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Aim for 80%+ quality sleep nights to support your overall wellness journey and daily energy.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learn More Button */}
        <div className="flex justify-center mb-8">
          <Link href="/articles/sleep/healing-power-of-sleep">
            <Button
              variant="outline"
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              data-testid="button-learn-sleep"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More About Sleep
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}