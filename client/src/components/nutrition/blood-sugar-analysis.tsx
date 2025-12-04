import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Clock,
  Calendar,
  Brain,
  Heart,
  Zap,
  Filter
} from "lucide-react";
import type { MealWithDetails } from "@/types";

interface GlucoseReading {
  id: string;
  value: number;
  timestamp: string;
  context?: string;
  mealId?: string;
}

interface MealLog {
  id: string;
  mealId?: string;
  customMealName?: string;
  customCarbs?: number;
  loggedAt: string;
  category: string;
  meal?: MealWithDetails;
}

interface BloodSugarInsight {
  type: 'spike' | 'stable' | 'low' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
  affectedMeals: string[];
}

interface PostMealAnalysis {
  mealName: string;
  mealTime: string;
  preValue: number;
  peakValue: number;
  timeToPeak: number;
  peakTime: string;
  glucoseIncrease: number;
  classification: 'excellent' | 'good' | 'concerning' | 'poor';
  mealCarbs: number;
  mealGI: string;
}

const glucoseRanges = {
  veryLow: { min: 0, max: 70, label: 'Very Low', color: 'bg-red-600' },
  low: { min: 70, max: 80, label: 'Low', color: 'bg-orange-500' },
  target: { min: 80, max: 140, label: 'Target', color: 'bg-green-500' },
  elevated: { min: 140, max: 180, label: 'Elevated', color: 'bg-yellow-500' },
  high: { min: 180, max: 250, label: 'High', color: 'bg-orange-600' },
  veryHigh: { min: 250, max: 500, label: 'Very High', color: 'bg-red-700' }
};

export default function BloodSugarAnalysis() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [analysisType, setAnalysisType] = useState<'overview' | 'meals' | 'patterns'>('overview');
  const [selectedMeal, setSelectedMeal] = useState<string>('');

  const { data: glucoseData } = useQuery<GlucoseReading[]>({
    queryKey: ["/api/glucose-readings", { range: timeRange }],
  });

  const { data: mealLogs } = useQuery<MealLog[]>({
    queryKey: ["/api/meal-logs", { range: timeRange }],
  });

  const getGlucoseRange = (value: number) => {
    for (const [key, range] of Object.entries(glucoseRanges)) {
      if (value >= range.min && value < range.max) {
        return range;
      }
    }
    return glucoseRanges.veryHigh;
  };

  const analyzePostMealResponse = (): PostMealAnalysis[] => {
    if (!glucoseData || !mealLogs) return [];
    
    return mealLogs.map(meal => {
      const mealTime = new Date(meal.loggedAt);
      const twoHourWindow = new Date(mealTime.getTime() + 2 * 60 * 60 * 1000);
      
      // Find pre-meal glucose (within 30 mins before meal)
      const preMealReading = glucoseData
        .filter(g => {
          const readingTime = new Date(g.timestamp);
          return readingTime >= new Date(mealTime.getTime() - 30 * 60 * 1000) && 
                 readingTime <= mealTime;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      // Find post-meal readings (up to 2 hours after)
      const postMealReadings = glucoseData
        .filter(g => {
          const readingTime = new Date(g.timestamp);
          return readingTime > mealTime && readingTime <= twoHourWindow;
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (!preMealReading || !postMealReadings || postMealReadings.length === 0) {
        return null;
      }

      const peakReading = postMealReadings.reduce((max, current) => 
        current.value > max.value ? current : max
      );

      const glucoseIncrease = peakReading.value - preMealReading.value;
      const timeToPeak = (new Date(peakReading.timestamp).getTime() - mealTime.getTime()) / (60 * 1000);

      const getClassification = (increase: number, mealGI: string) => {
        if (increase < 30) return 'excellent';
        if (increase < 50) return mealGI === 'low' ? 'good' : 'excellent';
        if (increase < 80) return mealGI === 'high' ? 'good' : 'concerning';
        return 'poor';
      };

      return {
        mealName: meal.customMealName || meal.meal?.name || 'Unknown meal',
        mealTime: mealTime.toLocaleTimeString(),
        preValue: preMealReading.value,
        peakValue: peakReading.value,
        timeToPeak,
        peakTime: new Date(peakReading.timestamp).toLocaleTimeString(),
        glucoseIncrease,
        classification: getClassification(glucoseIncrease, meal.meal?.glycemicIndex || 'medium'),
        mealCarbs: meal.customCarbs || meal.meal?.carbohydrates || 0,
        mealGI: meal.meal?.glycemicIndex || 'unknown'
      };
    }).filter(Boolean) as PostMealAnalysis[];
  };

  const generateInsights = (): BloodSugarInsight[] => {
    if (!glucoseData) return [];

    const insights: BloodSugarInsight[] = [];
    const postMealAnalyses = analyzePostMealResponse();

    // Check for frequent spikes
    const spikes = postMealAnalyses.filter(a => a.glucoseIncrease > 50);
    if (spikes.length > 0) {
      insights.push({
        type: 'spike',
        severity: spikes.length > 3 ? 'high' : spikes.length > 1 ? 'medium' : 'low',
        message: `Detected ${spikes.length} significant glucose spikes (>50 mg/dL increase)`,
        recommendation: 'Consider replacing high-GI meals with lower-GI alternatives or adding protein/fiber',
        affectedMeals: spikes.map(s => s.mealName)
      });
    }

    // Check for stable patterns
    const stableReadings = postMealAnalyses.filter(a => a.glucoseIncrease < 30);
    if (stableReadings.length >= postMealAnalyses.length * 0.7) {
      insights.push({
        type: 'stable',
        severity: 'low',
        message: `Excellent glucose stability with ${stableReadings.length} meals showing minimal impact`,
        recommendation: 'Continue your current meal choices - they work well for your glucose control',
        affectedMeals: stableReadings.map(s => s.mealName)
      });
    }

    // Check for low glucose events
    const lowReadings = glucoseData.filter(g => g.value < 80);
    if (lowReadings.length > 0) {
      insights.push({
        type: 'low',
        severity: lowReadings.some(r => r.value < 70) ? 'high' : 'medium',
        message: `Detected ${lowReadings.length} low glucose events (<80 mg/dL)`,
        recommendation: 'Monitor for hypoglycemia patterns and consider adjusting meal timing or medication',
        affectedMeals: []
      });
    }

    return insights;
  };

  const chartData = glucoseData?.map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }),
    glucose: reading.value,
    timestamp: reading.timestamp,
    range: getGlucoseRange(reading.value).label
  })).slice(-50) || [];

  const postMealAnalyses = analyzePostMealResponse();
  const insights = generateInsights();

  const avgGlucose = glucoseData?.reduce((sum, r) => sum + r.value, 0) / (glucoseData?.length || 1) || 0;
  const timeInRange = ((glucoseData?.filter(r => r.value >= 80 && r.value <= 140).length || 0) / (glucoseData?.length || 1)) * 100;
  const glucoseVariability = Math.sqrt(
    (glucoseData?.reduce((sum, r) => sum + Math.pow(r.value - avgGlucose, 2), 0) || 0) / (glucoseData?.length || 1)
  );

  return (
    <div className="space-y-6" data-testid="blood-sugar-analysis">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Blood Sugar Impact Analysis</h2>
        <p className="text-muted-foreground">Advanced glucose pattern analysis and meal impact tracking</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Label>Time Range:</Label>
          <Select value={timeRange} onValueChange={(value: '24h' | '7d' | '30d') => setTimeRange(value)}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label>Analysis:</Label>
          <Select value={analysisType} onValueChange={(value: 'overview' | 'meals' | 'patterns') => setAnalysisType(value)}>
            <SelectTrigger className="w-40" data-testid="select-analysis-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="meals">Meal Impact</SelectItem>
              <SelectItem value="patterns">Patterns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={analysisType} onValueChange={(value: string) => setAnalysisType(value as 'overview' | 'meals' | 'patterns')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="meals" data-testid="tab-meals">
            <Target className="w-4 h-4 mr-2" />
            Meal Impact
          </TabsTrigger>
          <TabsTrigger value="patterns" data-testid="tab-patterns">
            <Brain className="w-4 h-4 mr-2" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgGlucose.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Glucose</div>
                <div className="text-xs text-muted-foreground">mg/dL</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeInRange >= 70 ? 'text-green-600' : timeInRange >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {timeInRange.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Time in Range</div>
                <div className="text-xs text-muted-foreground">80-140 mg/dL</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${glucoseVariability <= 30 ? 'text-green-600' : glucoseVariability <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {glucoseVariability.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Variability</div>
                <div className="text-xs text-muted-foreground">Standard Dev</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {glucoseData?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Readings</div>
                <div className="text-xs text-muted-foreground">{timeRange}</div>
              </div>
            </Card>
          </div>

          {/* Glucose Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Glucose Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[60, 200]} 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} mg/dL`, 'Glucose']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="2 2" label="Target Low" />
                    <ReferenceLine y={140} stroke="#10b981" strokeDasharray="2 2" label="Target High" />
                    <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="2 2" label="Elevated" />
                    <Line 
                      type="monotone" 
                      dataKey="glucose" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-primary" />
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Alert key={index} className={
                      insight.severity === 'high' ? 'border-red-200 bg-red-50' :
                      insight.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-green-200 bg-green-50'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">{insight.message}</p>
                          <p className="text-sm">{insight.recommendation}</p>
                          {insight.affectedMeals.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {insight.affectedMeals.slice(0, 3).map((meal, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {meal}
                                </Badge>
                              ))}
                              {insight.affectedMeals.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{insight.affectedMeals.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No insights available. Continue logging meals and glucose readings for personalized analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post-Meal Glucose Response Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {postMealAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {postMealAnalyses.map((analysis, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{analysis.mealName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Eaten at {analysis.mealTime} • {analysis.mealCarbs}g carbs • {analysis.mealGI} GI
                          </p>
                        </div>
                        <Badge className={
                          analysis.classification === 'excellent' ? 'bg-green-100 text-green-800 border-green-200' :
                          analysis.classification === 'good' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          analysis.classification === 'concerning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }>
                          {analysis.classification}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Pre-meal:</span>
                          <div className="font-medium">{analysis.preValue} mg/dL</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Peak:</span>
                          <div className="font-medium">{analysis.peakValue} mg/dL</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Increase:</span>
                          <div className={`font-medium ${
                            analysis.glucoseIncrease < 30 ? 'text-green-600' :
                            analysis.glucoseIncrease < 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            +{analysis.glucoseIncrease.toFixed(0)} mg/dL
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time to peak:</span>
                          <div className="font-medium">{analysis.timeToPeak.toFixed(0)} min</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No meal analysis available. Log meals and glucose readings to see impact analysis.
                  </p>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      For accurate analysis, take glucose readings before meals and 1-2 hours after eating.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Impact Chart */}
          {postMealAnalyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Glucose Response by Meal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={postMealAnalyses.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="mealName" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`+${value} mg/dL`, 'Glucose Increase']}
                      />
                      <ReferenceLine y={30} stroke="#10b981" strokeDasharray="2 2" label="Excellent (<30)" />
                      <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="2 2" label="Good (<50)" />
                      <Bar 
                        dataKey="glucoseIncrease" 
                        fill="#3b82f6"
                        name="Glucose Increase"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Daily Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {glucoseData && glucoseData.length > 0 ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-3">
                        Average glucose by time of day:
                      </div>
                      <div className="space-y-2">
                        {['Morning', 'Afternoon', 'Evening', 'Night'].map((time, index) => {
                          const timeReadings = glucoseData.filter(r => {
                            const hour = new Date(r.timestamp).getHours();
                            return index === 0 ? hour >= 6 && hour < 12 :
                                   index === 1 ? hour >= 12 && hour < 18 :
                                   index === 2 ? hour >= 18 && hour < 22 :
                                   hour >= 22 || hour < 6;
                          });
                          const avgValue = timeReadings.reduce((sum, r) => sum + r.value, 0) / (timeReadings.length || 1);
                          
                          return (
                            <div key={time} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{time}</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{avgValue.toFixed(0)} mg/dL</span>
                                <div className={`w-3 h-3 rounded-full ${getGlucoseRange(avgValue).color}`}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No pattern data available yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary" />
                  Glucose Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(glucoseRanges).map(([key, range]) => {
                    const count = glucoseData?.filter(r => r.value >= range.min && r.value < range.max).length || 0;
                    const percentage = ((count / (glucoseData?.length || 1)) * 100);
                    
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{range.label} ({range.min}-{range.max} mg/dL)</span>
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`${range.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-primary" />
                Glucose Variability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {glucoseVariability.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Standard Deviation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {glucoseVariability <= 30 ? 'Excellent' : 
                     glucoseVariability <= 50 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {glucoseData ? Math.max(...glucoseData.map(r => r.value)) - Math.min(...glucoseData.map(r => r.value)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Range</div>
                  <div className="text-xs text-muted-foreground mt-1">Max - Min</div>
                </div>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-secondary">
                    {((glucoseData?.filter(r => Math.abs(r.value - avgGlucose) > 30).length || 0) / (glucoseData?.length || 1) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">High Variability</div>
                  <div className="text-xs text-muted-foreground mt-1">&gt;30 mg/dL from avg</div>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Variability Analysis:</strong> {
                    glucoseVariability <= 30 
                      ? "Excellent glucose stability. Your blood sugar patterns are very consistent."
                      : glucoseVariability <= 50
                      ? "Good glucose control with moderate variability. Consider reviewing meal timing and composition."
                      : "High glucose variability detected. Review your meal patterns, timing, and consider consulting your healthcare provider."
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}