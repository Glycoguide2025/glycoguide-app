import { TrendingUp, Clock, Heart, Target, Loader2, RefreshCw, Lock, Crown, Activity, Zap, BarChart3, AlertTriangle, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { renderInsight, extractPlaceholders, getInsightPageStrings, getInsightActions, getWellnessStrings } from '@/utils/insights';
import { InsightData } from '@/types/insights';
import { useBillingStatus, entitlements } from "@/hooks/useBilling";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { trackInsightViewed, trackSuggestionClicked } from "@/utils/analytics";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from 'react';
import CGMImport from "@/components/CGMImport";
import CGMSparkline from "@/components/CGMSparkline";
import WearablesImport from "@/components/WearablesImport";


// Icon mapping for different insight types (backend format)
const getInsightIcon = (type: string) => {
  switch (type) {
    case 'post_meal_rise':
      return TrendingUp;
    case 'carb_budget_trend':
      return Target;
    case 'evening_pattern':
      return Clock;
    case 'exercise_consistency':
      return Activity;
    case 'exercise_glucose_impact':
      return Zap;
    case 'cgm_time_in_range':
      return BarChart3;
    case 'cgm_trend_patterns':
      return TrendingUp;
    case 'cgm_alert_frequency':
      return AlertTriangle;
    // Legacy support
    case 'pattern':
      return TrendingUp;
    case 'suggestion':
      return Clock;
    case 'achievement':
      return Target;
    case 'discovery':
      return Heart;
    default:
      return TrendingUp;
  }
};

// Color mapping for different insight types (backend format)
const getInsightColor = (type: string) => {
  switch (type) {
    case 'post_meal_rise':
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
    case 'carb_budget_trend':
      return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
    case 'evening_pattern':
      return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
    case 'exercise_consistency':
      return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
    case 'exercise_glucose_impact':
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
    case 'cgm_time_in_range':
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
    case 'cgm_trend_patterns':
      return "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300";
    case 'cgm_alert_frequency':
      return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
    // Legacy support
    case 'pattern':
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
    case 'suggestion':
      return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
    case 'achievement':
      return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
    case 'discovery':
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
    default:
      return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
  }
};

export default function Insights() {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState('7d');
  const [upgradeModal, setUpgradeModal] = useState({ open: false, requiredPlan: '', feature: '' });
  const { user, isPro } = useAuth();

  // Determine user plan from centralized isPro flag
  const userPlan = isPro ? 'premium' : 'free';
  const permissions = entitlements(userPlan);

  // Track insight page view on load
  useEffect(() => {
    if (user) {
      const userId = (user as any)?.sub || 'anonymous';
      trackInsightViewed(userId, userPlan, 'insights_page');
    }
  }, [user, userPlan]);

  // Available range options based on plan
  const getRangeOptions = () => {
    const options = [
      { value: '7d', label: '7 Days', enabled: true }
    ];
    
    if (permissions.rangeMax === '14d' || permissions.rangeMax === '30d') {
      options.push({ value: '14d', label: '14 Days', enabled: true });
    } else {
      options.push({ value: '14d', label: '14 Days (Premium+)', enabled: false });
    }
    
    if (permissions.rangeMax === '30d') {
      options.push({ value: '30d', label: '30 Days', enabled: true });
    } else {
      options.push({ value: '30d', label: '30 Days (Pro)', enabled: false });
    }
    
    return options;
  };

  // Handle range selection with gating
  const handleRangeChange = (value: string) => {
    const rangeOptions = getRangeOptions();
    const option = rangeOptions.find(opt => opt.value === value);
    
    if (!option?.enabled) {
      if (value === '14d') {
        setUpgradeModal({ open: true, requiredPlan: 'premium', feature: '14-Day Data Range' });
      } else if (value === '30d') {
        setUpgradeModal({ open: true, requiredPlan: 'pro', feature: '30-Day Data Range' });
      }
      return;
    }
    
    setSelectedRange(value);
  };

  // Fetch cached insights with range-aware caching
  const { data: insights = [], isLoading, error } = useQuery({
    queryKey: ['/api/insights', selectedRange],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/insights?range=${selectedRange}`);
      return res.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - match server cache TTL
  });

  // Manual insight refresh with range awareness
  const refreshInsightsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', `/api/insights?range=${selectedRange}&refresh=true`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insights', selectedRange] });
      toast({
        title: "Insights refreshed",
        description: "Your insights have been updated with the latest data.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to refresh insights",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Temporarily use safe defaults while we fix the localization
  const pageStrings = {
    title: "Your Personal Insights",
    subtitle: "Discover patterns and build healthy habits",
    loading: "Loading your insights...",
    error: "Unable to load sleep data. Please try again.",
    retry: "Retry",
    refresh: "Refresh",
    noInsights: {
      title: "Log at least 1 meal and 1 reading to unlock insights.",
      description: "As you log more, we'll spot simple patterns and suggestions.",
      button: "Check for insights"
    },
    summary: {
      title: "Insights Summary",
      totalInsights: "Total insights",
      mostRecent: "Most recent insight",
      noneYet: "None yet",
      lastUpdated: "Insights updated",
      recently: "Recently",
      startLogging: "Start logging data"
    },
    disclaimer: {
      title: "Wellness Note:",
      text: "These insights support your personal tracking and habit-building. Always consult a healthcare professional for medical guidance."
    }
  };
  
  const actionStrings = {
    viewMeal: "View Meal",
    viewReading: "View Reading"
  };
  
  const wellnessStrings = {
    encouragement: {
      hasInsights: "🎉 Great job tracking your wellness journey! Your insights update automatically as you log more data.",
      noInsights: "🌱 Start logging meals and glucose readings to generate personalized insights about your wellness patterns."
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">{pageStrings.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="p-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6 text-center">
              <p className="text-red-800 dark:text-red-300 mb-4">
                {pageStrings.error}
              </p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/insights', selectedRange] })}
                variant="outline"
              >
                {pageStrings.retry}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {pageStrings.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {pageStrings.subtitle}
            </p>
          </div>
          
          {/* Range selector and refresh controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Select value={selectedRange} onValueChange={handleRangeChange}>
              <SelectTrigger className="w-32" data-testid="select-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getRangeOptions().map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className={!option.enabled ? 'opacity-60' : ''}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {!option.enabled && <Lock className="h-3 w-3 ml-2" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshInsightsMutation.mutate()}
              disabled={refreshInsightsMutation.isPending}
              data-testid="button-refresh-insights"
            >
              {refreshInsightsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {pageStrings.refresh}
            </Button>
          </div>
        </div>

        {/* CGM Import Banner */}
        <div className="mb-6">
          <CGMImport />
        </div>

        {/* Stage 17: Wearables Import Section */}
        <div className="mb-6">
          <WearablesImport />
        </div>

        {/* Part 3: Quick Stats - temporarily simplified */}
        <div className="grid grid-cols-2 gap-4">
          <Card data-testid="stat-weekly-trend">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {insights.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active insights
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-consistency">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedRange}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Data range
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CGM Sparkline Card */}
        <Card data-testid="cgm-sparkline-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <Activity className="h-4 w-4 mr-2 text-blue-600" />
              CGM Trend (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CGMSparkline height={60} className="w-full" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Recent glucose readings from imported CGM data
            </p>
          </CardContent>
        </Card>

        {/* Wellness Insights */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Wellness Patterns
          </h2>
          
          {insights.length === 0 ? (
            <Card data-testid="no-insights-state">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {pageStrings.noInsights.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {pageStrings.noInsights.description}
                </p>
                <Button 
                  onClick={() => refreshInsightsMutation.mutate()}
                  disabled={refreshInsightsMutation.isPending}
                  data-testid="button-generate-first-insights"
                >
                  {refreshInsightsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    pageStrings.noInsights.button
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {!permissions.insightsFull ? (
                /* Limited view for basic users */
                <Card data-testid="insights-upgrade-prompt">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg mr-3 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                          <Lock className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Premium Insights Available</CardTitle>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Premium+
                          </Badge>
                        </div>
                      </div>
                      <Crown className="h-5 w-5 text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      We've detected {insights.length} personalized insights about your wellness patterns, meal timing, and glucose trends. 
                      Upgrade to Premium or Pro to unlock detailed analysis and actionable recommendations.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Premium Insights Include:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Post-meal glucose rise patterns</li>
                        <li>• Carb budget trends and recommendations</li>
                        <li>• Evening eating pattern analysis</li>
                        <li>• Personalized timing suggestions</li>
                        <li>• Long-term trend monitoring</li>
                      </ul>
                    </div>
                    <Button 
                      onClick={() => setUpgradeModal({ open: true, requiredPlan: 'premium', feature: 'Full Insights Analysis' })}
                      className="w-full"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to See Full Insights
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* Full insights view for premium+ users */
                insights.map((insight: any) => {
                  const Icon = getInsightIcon(insight.type);
                  const colorClass = getInsightColor(insight.type);
                  const placeholders = extractPlaceholders(insight);
                  const renderedInsight = renderInsight(insight, placeholders as any);
                  
                  return (
                    <Card key={insight.id} data-testid={`insight-${insight.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{renderedInsight.title}</CardTitle>
                              <Badge 
                                variant={insight.severity === 'warn' ? 'destructive' : 'secondary'} 
                                className="mt-1 text-xs"
                                data-testid={`badge-${insight.type}`}
                              >
                                {renderedInsight.badge}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {renderedInsight.body}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {insight.mealId && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-view-meal-${insight.id}`}
                                onClick={() => window.location.href = '/tracker'}
                              >
                                {actionStrings.viewMeal}
                              </Button>
                            )}
                            {insight.readingId && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-view-reading-${insight.id}`}
                                onClick={() => window.location.href = '/tracker'}
                              >
                                {actionStrings.viewReading}
                              </Button>
                            )}
                          </div>
                          {insight.createdAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(insight.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Insights Summary */}
        <Card data-testid="insights-summary">
          <CardHeader>
            <CardTitle>{pageStrings.summary.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{pageStrings.summary.totalInsights}</span>
                <span className="font-semibold">{insights.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{pageStrings.summary.mostRecent}</span>
                <span className="font-semibold">
                  {insights.length > 0 
                    ? new Date(insights[0].createdAt || Date.now()).toLocaleDateString()
                    : pageStrings.summary.noneYet
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{pageStrings.summary.lastUpdated}</span>
                <Badge variant="secondary">
                  {insights.length > 0 ? pageStrings.summary.recently : pageStrings.summary.startLogging}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                {insights.length > 0 
                  ? wellnessStrings.encouragement.hasInsights
                  : wellnessStrings.encouragement.noInsights
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>{pageStrings.disclaimer.title}</strong> {pageStrings.disclaimer.text}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, requiredPlan: '', feature: '' })}
        requiredPlan={upgradeModal.requiredPlan as 'premium' | 'pro'}
        feature={upgradeModal.feature}
      />
    </div>
  );
}