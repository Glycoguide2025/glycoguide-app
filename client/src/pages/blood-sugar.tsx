import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Droplet, TrendingUp, Activity, Plus, Calendar, Info, ChevronDown, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

type BloodSugarLog = {
  id: string;
  userId: string;
  glucose: number;
  readingType: string | null;
  notes: string | null;
  loggedAt: string;
};

export default function BloodSugar() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEducation, setShowEducation] = useState(true);
  const [glucose, setGlucose] = useState("");
  const [readingType, setReadingType] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch user preferences for blood sugar unit
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });
  
  const { data: bsLogs = [], isLoading } = useQuery<BloodSugarLog[]>({
    queryKey: ['/api/blood-sugar/history'],
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const bloodSugarUnit = user?.bloodSugarUnit || 'mmol/L';
  const region = user?.region || 'Other';

  // Helper functions for unit conversion
  const convertToDisplayUnit = (mmolValue: number | string): number => {
    const numValue = typeof mmolValue === 'string' ? parseFloat(mmolValue) : mmolValue;
    if (bloodSugarUnit === 'mg/dL') {
      return parseFloat((numValue * 18).toFixed(0));
    }
    return parseFloat(numValue.toFixed(1));
  };

  const formatGlucoseDisplay = (mmolValue: number | string): string => {
    const displayValue = convertToDisplayUnit(mmolValue);
    return bloodSugarUnit === 'mg/dL' ? displayValue.toString() : displayValue.toFixed(1);
  };

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
    if (window.location.pathname === '/blood-sugar/logs') {
      setShowLogForm(true);
      setShowEducation(false); // Hide education section when opening log form
      // Scroll to the form after it renders
      setTimeout(() => {
        const formSection = document.querySelector('[data-testid="blood-sugar-log-form"]');
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
    if (window.location.hash === '#bs-education') {
      setShowEducation(true); // Show education section when hash is present
      // Scroll to top of page first
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Then scroll to section
      setTimeout(() => {
        const section = document.querySelector('#bs-education');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    }
  }, []);

  const resetForm = () => {
    setGlucose("");
    setReadingType("");
    setNotes("");
  };

  const updateRegionMutation = useMutation({
    mutationFn: async (newRegion: string) => {
      // Automatically set blood sugar unit based on region
      const newUnit = newRegion === 'United States' ? 'mg/dL' : 'mmol/L';
      return await apiRequest('PATCH', '/api/user/preferences', { 
        region: newRegion,
        bloodSugarUnit: newUnit 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Region Updated",
        description: "Your region and blood sugar unit preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update region preference",
        variant: "destructive",
      });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async (newUnit: string) => {
      return await apiRequest('PATCH', '/api/user/preferences', { bloodSugarUnit: newUnit });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Unit Updated",
        description: "Your blood sugar unit preference has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update unit preference",
        variant: "destructive",
      });
    },
  });

  const handleRegionChange = (newRegion: string) => {
    updateRegionMutation.mutate(newRegion);
  };

  const handleUnitChange = (newUnit: string) => {
    updateUnitMutation.mutate(newUnit);
  };

  const createBsLogMutation = useMutation({
    mutationFn: async (data: { glucose: number; readingType?: string; notes?: string }) => {
      return await apiRequest('POST', '/api/blood-sugar', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blood-sugar/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blood-sugar/today'] });
      toast({
        title: "Blood Sugar Logged! 💚",
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
        description: error.message || "Failed to log blood sugar",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const glucoseNum = parseFloat(glucose);

    if (!glucoseNum) {
      toast({
        title: "Missing Value",
        description: "Please enter a glucose value",
        variant: "destructive",
      });
      return;
    }

    // Validate based on unit
    if (bloodSugarUnit === 'mg/dL') {
      if (glucoseNum < 20 || glucoseNum > 600) {
        toast({
          title: "Invalid Value",
          description: "Blood sugar must be between 20-600 mg/dL",
          variant: "destructive",
        });
        return;
      }
    } else { // mmol/L
      if (glucoseNum < 1.1 || glucoseNum > 33.3) {
        toast({
          title: "Invalid Value",
          description: "Blood sugar must be between 1.1-33.3 mmol/L",
          variant: "destructive",
        });
        return;
      }
    }

    // Convert to mmol/L for storage if user entered mg/dL
    const glucoseInMmol = bloodSugarUnit === 'mg/dL' 
      ? parseFloat((glucoseNum / 18).toFixed(1))
      : glucoseNum;

    createBsLogMutation.mutate({
      glucose: glucoseInMmol,
      readingType: readingType || undefined,
      notes: notes || undefined,
    });
  };

  // Calculate stats in mmol/L (stored format) then convert for display
  const bsStats = bsLogs.reduce((acc: any, log: BloodSugarLog) => {
    const glucoseMmol = log.glucose; // Already in mmol/L from database
    acc.totalReadings += 1;
    acc.totalGlucose += glucoseMmol;
    
    // Normal ranges in mmol/L: 3.9-5.5 (fasting), 3.9-7.8 (general)
    if (glucoseMmol >= 3.9 && glucoseMmol <= 7.8) acc.normalReadings += 1;
    if (glucoseMmol < 3.9) acc.lowReadings += 1;
    if (glucoseMmol > 7.8) acc.highReadings += 1;
    if (glucoseMmol > acc.highest) acc.highest = glucoseMmol;
    if (glucoseMmol < acc.lowest || acc.lowest === 0) acc.lowest = glucoseMmol;
    return acc;
  }, { totalReadings: 0, totalGlucose: 0, normalReadings: 0, lowReadings: 0, highReadings: 0, highest: 0, lowest: 0 });

  const averageMmol = bsStats.totalReadings > 0 ? bsStats.totalGlucose / bsStats.totalReadings : 0;
  const averageGlucose = averageMmol > 0 ? convertToDisplayUnit(averageMmol) : 0;
  const normalPercentage = bsStats.totalReadings > 0 ? Math.round((bsStats.normalReadings / bsStats.totalReadings) * 100) : 0;

  // Status colors and labels work with mmol/L values
  const getStatusColor = (glucoseMmol: number | string) => {
    const value = typeof glucoseMmol === 'string' ? parseFloat(glucoseMmol) : glucoseMmol;
    if (value >= 3.9 && value <= 5.5) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (value > 5.5 && value <= 7.8) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
    if (value > 7.8 || value < 3.9) return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
    return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400";
  };

  const getStatusLabel = (glucoseMmol: number | string) => {
    const value = typeof glucoseMmol === 'string' ? parseFloat(glucoseMmol) : glucoseMmol;
    if (value >= 3.9 && value <= 5.5) return "Normal";
    if (value > 5.5 && value <= 7.8) return "Slightly elevated";
    if (value > 7.8) return "High";
    if (value < 3.9) return "Low";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800" data-testid="blood-sugar-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Close Button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors z-10"
          aria-label="Close"
          data-testid="button-close-blood-sugar"
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full mb-6">
            <Droplet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400">
            Blood Sugar Tracking
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Monitor your glucose levels and understand your body's energy balance
          </p>
          
          {/* Region & Unit Preference Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-sm max-w-2xl mx-auto">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select your region:
                </label>
                <Select value={region} onValueChange={handleRegionChange} data-testid="select-region">
                  <SelectTrigger className="w-full" data-testid="trigger-region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Canada" data-testid="option-canada">🇨🇦 Canada (mmol/L)</SelectItem>
                    <SelectItem value="United States" data-testid="option-usa">🇺🇸 United States (mg/dL)</SelectItem>
                    <SelectItem value="Other" data-testid="option-other">🌍 Other (mmol/L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your readings are stored safely in mmol/L for consistent tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Readings</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{bsStats.totalReadings}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Glucose</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {averageGlucose > 0 ? (bloodSugarUnit === 'mg/dL' ? Math.round(averageGlucose) : averageGlucose.toFixed(1)) : '--'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{bloodSugarUnit}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Normal Range</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{normalPercentage}%</p>
                  <Progress value={normalPercentage} className="mt-2" />
                </div>
                <ChevronDown className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Highest / Lowest</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {bsStats.highest > 0 ? `${formatGlucoseDisplay(bsStats.highest)} / ${formatGlucoseDisplay(bsStats.lowest)}` : '-- / --'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{bloodSugarUnit}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Form */}
        <Card className="mb-8 bg-white dark:bg-gray-800" data-testid="blood-sugar-log-form">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add a Blood Sugar Reading</span>
              {!showLogForm && (
                <Button onClick={() => setShowLogForm(true)} data-testid="button-show-form">
                  <Plus className="w-4 h-4 mr-2" />
                  New Reading
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          {showLogForm && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Glucose ({bloodSugarUnit}) *</label>
                    <Input
                      type="number"
                      step={bloodSugarUnit === 'mmol/L' ? '0.1' : '1'}
                      value={glucose}
                      onChange={(e) => setGlucose(e.target.value)}
                      placeholder={bloodSugarUnit === 'mmol/L' ? 'e.g., 5.5' : 'e.g., 98'}
                      required
                      min={bloodSugarUnit === 'mmol/L' ? '1.1' : '20'}
                      max={bloodSugarUnit === 'mmol/L' ? '33.3' : '600'}
                      data-testid="input-glucose"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a value between {bloodSugarUnit === 'mmol/L' ? '1.1-33.3' : '20-600'} {bloodSugarUnit}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reading Type</label>
                    <Select value={readingType} onValueChange={setReadingType}>
                      <SelectTrigger data-testid="select-reading-type">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fasting">Fasting</SelectItem>
                        <SelectItem value="pre-meal">Pre-Meal</SelectItem>
                        <SelectItem value="post-meal">Post-Meal</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any relevant notes..."
                    data-testid="input-notes"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={createBsLogMutation.isPending} data-testid="button-submit">
                    {createBsLogMutation.isPending ? "Saving..." : "Log Blood Sugar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowLogForm(false); resetForm(); }} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Recent Readings */}
        <Card className="mb-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Recent Readings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : bsLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No readings yet. Add your first reading above!</p>
            ) : (
              <div className="space-y-3">
                {bsLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(log.glucose)}>
                          {formatGlucoseDisplay(log.glucose)} {bloodSugarUnit}
                        </Badge>
                        {log.readingType && (
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {log.readingType.replace('-', ' ')}
                          </span>
                        )}
                        <Badge variant="outline" className="ml-auto">
                          {getStatusLabel(log.glucose)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {format(parseISO(log.loggedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      {log.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education Article Section */}
        {showEducation && (
          <Card id="bs-education" className="mb-8 bg-white dark:bg-gray-800 relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl pr-8">Understanding Blood Sugar — and How to Keep It in Balance</CardTitle>
                <button
                  onClick={() => setShowEducation(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close article"
                  data-testid="button-close-bs-education"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none dark:prose-invert text-gray-900 dark:text-gray-100">
              <p>Blood sugar (also called blood glucose) is your body's main source of energy. It comes from the food you eat and is carried by your bloodstream to every cell. Keeping it in balance helps your body — and especially your brain — function at its best.</p>

              <h3>What Blood Sugar Means</h3>
              <p>After eating, your blood sugar rises as your body digests carbohydrates. Insulin — a hormone made by the pancreas — helps move glucose into your cells for energy. When this system works smoothly, your energy stays stable throughout the day.</p>

              <h3>Normal Ranges</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600 text-base text-gray-900 dark:text-gray-100">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Timing</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Normal Range (mg/dL)</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">Fasting (before meals)</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">70 – 99</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">Ideal for steady energy and healthy metabolism</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">2 hours after meals</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">&lt; 140</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">Shows good post-meal glucose control</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">Random (any time)</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">&lt; 180</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">Acceptable for most adults</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm italic mt-2">Always follow your healthcare provider's recommendations for personal targets.</p>

              <h3>Signs of Imbalance</h3>
              <p>You may not always feel high or low blood sugar, but being aware helps you stay proactive.</p>
              
              <p><strong>Possible signs of high blood sugar (hyperglycemia):</strong></p>
              <ul>
                <li>Fatigue or brain fog</li>
                <li>Increased thirst or urination</li>
                <li>Blurred vision</li>
                <li>Slow healing</li>
              </ul>

              <p><strong>Possible signs of low blood sugar (hypoglycemia):</strong></p>
              <ul>
                <li>Shakiness</li>
                <li>Sweating</li>
                <li>Hunger or irritability</li>
                <li>Dizziness or confusion</li>
              </ul>

              <h3>Natural Ways to Support Balanced Blood Sugar</h3>
              <ul>
                <li><strong>Eat balanced meals:</strong> Pair complex carbs with protein and healthy fats (e.g., oats + nuts, rice + beans).</li>
                <li><strong>Move regularly:</strong> A short walk after meals helps your body use glucose efficiently.</li>
                <li><strong>Hydrate well:</strong> Water supports kidney function and glucose regulation.</li>
                <li><strong>Manage stress:</strong> Cortisol can raise blood sugar — mindfulness or breathing helps.</li>
                <li><strong>Get enough sleep:</strong> 7–9 hours keeps hormones like insulin balanced.</li>
                <li><strong>Track patterns:</strong> Daily logging helps you identify what foods or times affect your readings.</li>
              </ul>

              <h3>Why Tracking Helps</h3>
              <p>Tracking shows how your lifestyle and meals affect your readings. With GlycoGuide, you can log fasting, post-meal, and random readings, and compare them alongside sleep, hydration, and movement patterns.</p>
              <p>This insight helps you make gentle, confident adjustments that support your body — not restrict it.</p>

              <h3>Integrating It Into Your Wellness Routine</h3>
              <ul>
                <li>Record readings 1–3 times daily or as recommended.</li>
                <li>Note your meals or stress levels to find patterns.</li>
                <li>Use GlycoGuide's dashboard to visualize changes week by week.</li>
                <li>Review your averages monthly to see your progress and stay empowered.</li>
              </ul>
              <p className="italic">Awareness creates consistency — and consistency builds wellness.</p>

              <h3>Try This Insight</h3>
              <p>Add a <strong>"Blood Sugar Check"</strong> reminder in your GlycoGuide app, and take note of how energy, hydration, and meals influence your numbers.</p>

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">Learn More</h3>
                <p className="mb-4 text-gray-800 dark:text-gray-200">Ready to deepen your understanding? Explore our comprehensive diabetes education resources in the Learning Library.</p>
                <Link href="/education">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-learn-more">
                    For Diabetic Courses and More Articles →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
