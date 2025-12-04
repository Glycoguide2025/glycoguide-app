import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Heart, TrendingUp, Activity, Plus, Calendar, Info, ChevronDown, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

type BloodPressureLog = {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  loggedAt: string;
};

export default function BloodPressure() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");
  
  const { data: bpLogs = [], isLoading } = useQuery<BloodPressureLog[]>({
    queryKey: ['/api/blood-pressure/history'],
  });

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) {
      setLocation('/auth');
    }
  }, [authLoading, authUser, setLocation]);

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowLogForm(false);
      resetForm();
    }
  };
  
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);
  
  useEffect(() => {
    // Check if user wants to log immediately (from Quick Health Check)
    if (window.location.pathname === '/blood-pressure/logs') {
      setShowLogForm(true);
      setShowEducation(false); // Hide education section when opening log form
      // Scroll to the form after it renders
      setTimeout(() => {
        const formSection = document.querySelector('[data-testid="blood-pressure-log-form"]');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } else {
      setShowLogForm(false);
    }
  }, []);

  // Scroll to education section if hash is present
  useEffect(() => {
    if (window.location.hash === '#bp-education') {
      setShowEducation(true); // Show education section when hash is present
      const section = document.querySelector('#bp-education');
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    }
  }, []);

  const resetForm = () => {
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setNotes("");
  };

  const createBpLogMutation = useMutation({
    mutationFn: async (data: { systolic: number; diastolic: number; pulse?: number; notes?: string }) => {
      return await apiRequest('POST', '/api/blood-pressure', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure/today'] });
      toast({
        title: "Blood Pressure Logged! 💚",
        description: "Your reading has been recorded.",
      });
      resetForm();
      
      // Redirect to dashboard after successful logging
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log blood pressure",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);
    const pulseNum = pulse ? parseInt(pulse) : undefined;

    if (!systolicNum || !diastolicNum) {
      toast({
        title: "Missing Values",
        description: "Please enter both systolic and diastolic values",
        variant: "destructive",
      });
      return;
    }

    if (systolicNum < 50 || systolicNum > 300 || diastolicNum < 30 || diastolicNum > 200) {
      toast({
        title: "Invalid Values",
        description: "Blood pressure values seem out of range. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    createBpLogMutation.mutate({
      systolic: systolicNum,
      diastolic: diastolicNum,
      pulse: pulseNum,
      notes: notes || undefined,
    });
  };

  const bpStats = bpLogs.reduce((acc: any, log: BloodPressureLog) => {
    acc.totalReadings += 1;
    acc.totalSystolic += log.systolic;
    acc.totalDiastolic += log.diastolic;
    if (log.systolic < 120 && log.diastolic < 80) acc.normalReadings += 1;
    if (log.systolic >= 130 || log.diastolic >= 80) acc.highReadings += 1;
    if (log.pulse) {
      acc.totalPulse += log.pulse;
      acc.pulseCount += 1;
    }
    return acc;
  }, { totalReadings: 0, totalSystolic: 0, totalDiastolic: 0, normalReadings: 0, highReadings: 0, totalPulse: 0, pulseCount: 0 });

  const averageSystolic = bpStats.totalReadings > 0 ? Math.round(bpStats.totalSystolic / bpStats.totalReadings) : 0;
  const averageDiastolic = bpStats.totalReadings > 0 ? Math.round(bpStats.totalDiastolic / bpStats.totalReadings) : 0;
  const averagePulse = bpStats.pulseCount > 0 ? Math.round(bpStats.totalPulse / bpStats.pulseCount) : 0;
  const normalPercentage = bpStats.totalReadings > 0 ? Math.round((bpStats.normalReadings / bpStats.totalReadings) * 100) : 0;

  const getStatusColor = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
    if (systolic >= 130 || diastolic >= 80) return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
    return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400";
  };

  const getStatusLabel = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return "Elevated";
    if (systolic >= 130 || diastolic >= 80) return "High";
    return "";
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800" data-testid="blood-pressure-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Close Button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors z-10"
          aria-label="Close"
          data-testid="button-close-blood-pressure"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back-home">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent dark:from-red-400 dark:to-pink-400">
            Blood Pressure Tracking
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor your heart health with regular blood pressure checks
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Readings</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{bpStats.totalReadings}</p>
                </div>
                <Activity className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average BP</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{averageSystolic}/{averageDiastolic}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Pulse</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{averagePulse || '--'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">bpm</p>
                </div>
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Normal Range</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{normalPercentage}%</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
              <Progress value={normalPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Educational Info - Collapsible */}
        <div className="mb-8">
          <div id="bp-education" className="scroll-mt-20"></div>
          <Button
            onClick={() => setShowEducation(!showEducation)}
            variant="outline"
            className="w-full border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            data-testid="button-toggle-education"
          >
            <Info className="w-5 h-5 mr-2" />
            {showEducation ? "Hide Article" : "Learn More: What Is Blood Pressure & Why It Matters"}
            <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${showEducation ? "rotate-180" : ""}`} />
          </Button>
          
          {showEducation && (
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 mt-4 border-2 border-red-200 dark:border-red-900 animate-in fade-in-50 slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-400">
                  What Is Blood Pressure—and Why It Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <div>
                  <p className="mb-3">Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps. It's measured using two numbers:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Systolic pressure (top number):</strong> the pressure when your heart beats</li>
                    <li><strong>Diastolic pressure (bottom number):</strong> the pressure when your heart rests between beats</li>
                  </ul>
                  <p className="mt-3 text-sm italic">For example, a reading of 120/80 mmHg is considered normal.</p>
                </div>

                <div className="border-t border-red-200 dark:border-red-800 pt-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Why Blood Pressure Matters for Holistic Health</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Silent but serious:</strong> High blood pressure (hypertension) often has no symptoms but can quietly damage your heart, brain, kidneys, and eyes over time and can also lead to strokes and heart attacks.</li>
                    <li><strong>Linked to lifestyle:</strong> Stress, poor sleep, excess salt, inactivity, and certain medications can all affect your blood pressure.</li>
                    <li><strong>Whole-body impact:</strong> Balanced blood pressure supports circulation, energy, and organ health—making it a key pillar of wellness.</li>
                  </ul>
                </div>

                <div className="border-t border-red-200 dark:border-red-800 pt-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Why Tracking Blood Pressure Is Important</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>If you have hypertension:</strong> Regular monitoring helps you and your care team adjust treatments and lifestyle choices.</li>
                    <li><strong>If you don't:</strong> Occasional checks can catch early changes before symptoms appear. It's a proactive way to stay in tune with your body.</li>
                    <li><strong>For everyone:</strong> Tracking trends over time—especially during stress, illness, or dietary changes—can reveal patterns and support better decisions.</li>
                  </ul>
                </div>

                <div className="border-t border-red-200 dark:border-red-800 pt-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Integrating It into Your Wellness Routine</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Check your blood pressure at home with a validated monitor.</li>
                    <li>Track readings in your app alongside mood, sleep, hydration, and movement.</li>
                    <li>Use gentle reminders to check in weekly or monthly, even if you feel fine.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Log Form */}
        {!showLogForm && (
          <div className="mb-8 text-center">
            <Button
              onClick={() => setShowLogForm(true)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
              data-testid="button-log-bp"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log Blood Pressure
            </Button>
          </div>
        )}

        {showLogForm && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg mb-8" data-testid="blood-pressure-log-form">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Log Your Blood Pressure</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Systolic (mmHg) *
                    </label>
                    <Input
                      type="number"
                      placeholder="120"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      required
                      min="50"
                      max="300"
                      data-testid="input-systolic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diastolic (mmHg) *
                    </label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      required
                      min="30"
                      max="200"
                      data-testid="input-diastolic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pulse (bpm)
                    </label>
                    <Input
                      type="number"
                      placeholder="72"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      min="30"
                      max="220"
                      data-testid="input-pulse"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <Textarea
                    placeholder="Any notes about this reading..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    data-testid="input-notes"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                    disabled={createBpLogMutation.isPending}
                    data-testid="button-submit-bp"
                  >
                    {createBpLogMutation.isPending ? "Saving..." : "Save Reading"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowLogForm(false);
                      resetForm();
                    }}
                    data-testid="button-cancel-bp"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg" data-testid="bp-history-section">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Blood Pressure History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
            ) : bpLogs.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No blood pressure logs yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Start tracking your readings to see trends</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bpLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-2xl font-bold ${getStatusColor(log.systolic, log.diastolic).split(' ')[0]}`}>
                            {log.systolic}/{log.diastolic}
                          </div>
                          {log.pulse && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {log.pulse} bpm
                            </div>
                          )}
                          <Badge className={getStatusColor(log.systolic, log.diastolic)}>
                            {getStatusLabel(log.systolic, log.diastolic)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(parseISO(log.loggedAt), 'PPpp')}
                        </div>
                        {log.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic">{log.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
