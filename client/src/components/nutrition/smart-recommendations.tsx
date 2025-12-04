import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Heart,
  Brain,
  Lightbulb,
  Star,
  Zap,
  Coffee,
  Sun,
  Moon,
  Apple,
  ChevronRight,
  RefreshCw,
  Filter,
  AlertTriangle
} from "lucide-react";
import type { MealWithDetails } from "@/types";

interface SmartRecommendation {
  id: string;
  type: 'meal' | 'timing' | 'combination' | 'swap';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  meal?: MealWithDetails;
  alternatives?: MealWithDetails[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'general';
}

interface UserProfile {
  avgGlucose: number;
  preferredGI: 'low' | 'medium' | 'any';
  activityLevel: 'low' | 'moderate' | 'high';
  timeInRange: number;
  problematicMeals: string[];
  successfulMeals: string[];
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun, 
  dinner: Moon,
  snack: Apple
};

const recommendationTypes = {
  meal: { icon: Sparkles, color: 'text-purple-600' },
  timing: { icon: Clock, color: 'text-blue-600' },
  combination: { icon: Zap, color: 'text-orange-600' },
  swap: { icon: RefreshCw, color: 'text-green-600' }
};

export default function SmartRecommendations() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: meals } = useQuery<MealWithDetails[]>({
    queryKey: ["/api/meals"],
  });

  const { data: glucoseData } = useQuery({
    queryKey: ["/api/glucose-readings", { range: '7d' }],
  });

  const { data: mealLogs } = useQuery({
    queryKey: ["/api/meal-logs", { range: '7d' }],
  });

  const { data: userPreferences } = useQuery({
    queryKey: ["/api/user-preferences"],
  });

  // Generate user profile for recommendations
  const generateUserProfile = (): UserProfile => {
    if (!glucoseData || !mealLogs) {
      return {
        avgGlucose: 120,
        preferredGI: 'low',
        activityLevel: 'moderate',
        timeInRange: 70,
        problematicMeals: [],
        successfulMeals: []
      };
    }

    const avgGlucose = glucoseData.reduce((sum: number, r: any) => sum + r.value, 0) / glucoseData.length;
    const timeInRange = (glucoseData.filter((r: any) => r.value >= 80 && r.value <= 140).length / glucoseData.length) * 100;

    // Analyze meal success patterns
    const mealAnalysis = mealLogs.map((log: any) => {
      const mealTime = new Date(log.loggedAt);
      const postMealReadings = glucoseData.filter((g: any) => {
        const readingTime = new Date(g.timestamp);
        const timeDiff = (readingTime.getTime() - mealTime.getTime()) / (60 * 60 * 1000);
        return timeDiff > 0 && timeDiff <= 2;
      });

      if (postMealReadings.length === 0) return null;

      const maxSpike = Math.max(...postMealReadings.map((r: any) => r.value)) - 100; // assume baseline 100
      return {
        meal: log.customMealName || log.meal?.name || 'Unknown',
        spike: maxSpike,
        successful: maxSpike < 40
      };
    }).filter(Boolean);

    const successfulMeals = mealAnalysis.filter(m => m?.successful).map(m => m?.meal || '');
    const problematicMeals = mealAnalysis.filter(m => !m?.successful).map(m => m?.meal || '');

    return {
      avgGlucose,
      preferredGI: avgGlucose > 140 ? 'low' : avgGlucose > 120 ? 'medium' : 'any',
      activityLevel: 'moderate', // This would come from user settings
      timeInRange,
      problematicMeals,
      successfulMeals
    };
  };

  // Generate smart recommendations based on user profile
  const generateRecommendations = (): SmartRecommendation[] => {
    if (!meals) return [];

    const profile = generateUserProfile();
    const recommendations: SmartRecommendation[] = [];

    // Recommendation 1: Low GI breakfast for better morning control
    if (profile.avgGlucose > 130) {
      const lowGIBreakfast = meals.filter(m => 
        m.category === 'breakfast' && 
        m.glycemicIndex === 'low' &&
        Number(m.carbohydrates || 0) < 35
      );

      if (lowGIBreakfast.length > 0) {
        recommendations.push({
          id: 'low-gi-morning',
          type: 'meal',
          category: 'breakfast',
          title: 'Start with Low-GI Breakfast',
          description: `Your morning glucose tends to be elevated. These low-GI options provide steady energy without spikes.`,
          reason: `Average morning glucose: ${profile.avgGlucose.toFixed(0)} mg/dL`,
          confidence: 85,
          alternatives: lowGIBreakfast.slice(0, 3)
        });
      }
    }

    // Recommendation 2: Meal timing optimization
    if (profile.timeInRange < 70) {
      recommendations.push({
        id: 'meal-timing',
        type: 'timing',
        category: 'general',
        title: 'Optimize Meal Timing',
        description: 'Eating at consistent times helps your body better manage glucose levels.',
        reason: `Current time in range: ${profile.timeInRange.toFixed(0)}% (target: >70%)`,
        confidence: 80
      });
    }

    // Recommendation 3: Pre/post workout snacks
    if (profile.activityLevel !== 'low') {
      const preWorkoutSnacks = meals.filter(m => 
        m.category === 'snack' && 
        m.glycemicIndex === 'medium' &&
        Number(m.carbohydrates || 0) >= 15 && Number(m.carbohydrates || 0) <= 30
      );

      if (preWorkoutSnacks.length > 0) {
        recommendations.push({
          id: 'workout-fuel',
          type: 'timing',
          category: 'snack',
          title: 'Pre-Workout Fuel',
          description: 'These moderate-GI snacks provide quick energy for exercise.',
          reason: 'Active individuals benefit from strategic carb timing around workouts',
          confidence: 75,
          alternatives: preWorkoutSnacks.slice(0, 2)
        });
      }
    }

    // Recommendation 4: Meal combinations for better control
    const highFiberMeals = meals.filter(m => Number(m.fiber || 0) > 8);
    if (highFiberMeals.length > 0) {
      recommendations.push({
        id: 'fiber-power',
        type: 'combination',
        category: 'general',
        title: 'High-Fiber Champions',
        description: 'These fiber-rich meals slow glucose absorption and improve satiety.',
        reason: 'Fiber helps moderate number spikes and supports digestive health',
        confidence: 90,
        alternatives: highFiberMeals.slice(0, 3)
      });
    }

    // Recommendation 5: Meal swaps for problem foods
    if (profile.problematicMeals.length > 0) {
      const betterAlternatives = meals.filter(m => 
        m.glycemicIndex === 'low' && 
        Number(m.carbohydrates || 0) < 40
      );

      recommendations.push({
        id: 'problem-meal-swaps',
        type: 'swap',
        category: 'general',
        title: 'Smart Meal Swaps',
        description: 'Replace high-impact meals with these glucose-friendly alternatives.',
        reason: `${profile.problematicMeals.length} meals causing glucose spikes`,
        confidence: 95,
        alternatives: betterAlternatives.slice(0, 4)
      });
    }

    // Recommendation 6: Late-day protein focus
    const proteinRichDinners = meals.filter(m => 
      m.category === 'dinner' && 
      Number(m.protein || 0) > 25 &&
      m.glycemicIndex === 'low'
    );

    if (proteinRichDinners.length > 0) {
      recommendations.push({
        id: 'protein-dinner',
        type: 'meal',
        category: 'dinner',
        title: 'Protein-Powered Dinners',
        description: 'High-protein dinners support overnight glucose stability and muscle recovery.',
        reason: 'Protein helps maintain steady numbers through the night',
        confidence: 80,
        alternatives: proteinRichDinners.slice(0, 3)
      });
    }

    // Recommendation 7: Smart snacking
    const smartSnacks = meals.filter(m => 
      m.category === 'snack' && 
      m.glycemicIndex === 'low' &&
      Number(m.carbohydrates || 0) < 15 &&
      Number(m.protein || 0) > 5
    );

    if (smartSnacks.length > 0) {
      recommendations.push({
        id: 'smart-snacks',
        type: 'meal',
        category: 'snack',
        title: 'Number Friendly Snacks',
        description: 'Low-carb, protein-rich snacks that won\'t spike your numbers.',
        reason: 'Smart snacking prevents number swings between meals',
        confidence: 88,
        alternatives: smartSnacks.slice(0, 4)
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    // Simulate API call to refresh recommendations
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const recommendations = generateRecommendations();
  const profile = generateUserProfile();

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterType !== 'all' && rec.type !== filterType) return false;
    if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
    return true;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6" data-testid="smart-recommendations">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Smart Food Recommendations</h2>
        <p className="text-muted-foreground">Personalized meal suggestions based on your glucose patterns</p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">
            <Sparkles className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">
            <Target className="w-4 h-4 mr-2" />
            Your Profile
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40" data-testid="select-filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="meal">Meal Suggestions</SelectItem>
                  <SelectItem value="timing">Timing Tips</SelectItem>
                  <SelectItem value="combination">Combinations</SelectItem>
                  <SelectItem value="swap">Smart Swaps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40" data-testid="select-filter-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snacks</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={refreshRecommendations}
              disabled={refreshing}
              variant="outline"
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((rec, index) => {
                const TypeIcon = recommendationTypes[rec.type].icon;
                const CategoryIcon = rec.category !== 'general' ? mealIcons[rec.category as keyof typeof mealIcons] : Star;
                
                return (
                  <Card key={rec.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className={`w-5 h-5 ${recommendationTypes[rec.type].color}`} />
                            {rec.category !== 'general' && (
                              <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <p className="text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                        </div>
                        <Badge className={getConfidenceColor(rec.confidence)}>
                          {rec.confidence}% {getConfidenceLabel(rec.confidence)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert>
                          <Lightbulb className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Why this helps:</strong> {rec.reason}
                          </AlertDescription>
                        </Alert>

                        {rec.alternatives && rec.alternatives.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-3 flex items-center">
                              <ChevronRight className="w-4 h-4 mr-1" />
                              Recommended Options:
                            </h5>
                            <div className="grid md:grid-cols-2 gap-3">
                              {rec.alternatives.map((meal, mealIndex) => (
                                <div
                                  key={mealIndex}
                                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                                  data-testid={`recommendation-meal-${mealIndex}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h6 className="font-medium text-sm">{meal.name}</h6>
                                    <Badge 
                                      className={`text-xs ${
                                        meal.glycemicIndex === 'low' ? 'gi-low' : 'gi-medium'
                                      }`}
                                      variant="outline"
                                    >
                                      {meal.glycemicIndex} GI
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                    <span>{Number(meal.carbohydrates || 0)}g carbs</span>
                                    <span>{Number(meal.protein || 0)}g protein</span>
                                    <span>{meal.calories} cal</span>
                                    {meal.prepTime && (
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {meal.prepTime}m
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recommendations match your filters</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or log more meals to get personalized suggestions.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterType('all');
                      setFilterCategory('all');
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Glucose Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {profile.avgGlucose.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Glucose</div>
                    <div className="text-xs text-muted-foreground">mg/dL</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className={`text-2xl font-bold ${profile.timeInRange >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile.timeInRange.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Time in Range</div>
                    <div className="text-xs text-muted-foreground">80-140 mg/dL</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Preferred GI Level:</span>
                    <Badge className={
                      profile.preferredGI === 'low' ? 'gi-low' : 
                      profile.preferredGI === 'medium' ? 'gi-medium' : 
                      'bg-gray-100 text-gray-800'
                    }>
                      {profile.preferredGI.charAt(0).toUpperCase() + profile.preferredGI.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Activity Level:</span>
                    <span className="font-medium capitalize">{profile.activityLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Meal Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-green-600 mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    Successful Meals ({profile.successfulMeals.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {profile.successfulMeals.slice(0, 6).map((meal, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-50 border-green-200">
                        {meal}
                      </Badge>
                    ))}
                    {profile.successfulMeals.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.successfulMeals.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-yellow-600 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Watch List ({profile.problematicMeals.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {profile.problematicMeals.slice(0, 4).map((meal, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-yellow-50 border-yellow-200">
                        {meal}
                      </Badge>
                    ))}
                    {profile.problematicMeals.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.problematicMeals.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {profile.avgGlucose > 140 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        Your average glucose is above target range. Focus on low-GI meals and consistent meal timing.
                      </AlertDescription>
                    </Alert>
                  )}

                  {profile.timeInRange < 70 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        Time in target range is below 70%. Consider working with your healthcare provider to optimize meal planning.
                      </AlertDescription>
                    </Alert>
                  )}

                  {profile.successfulMeals.length > profile.problematicMeals.length && (
                    <Alert className="border-green-200 bg-green-50">
                      <Heart className="h-4 w-4" />
                      <AlertDescription>
                        Great job! You have more successful meals than problematic ones. Keep focusing on what works for you.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Recommendation Quality</h5>
                    <p className="text-sm text-blue-700">
                      Your patterns have been analyzed to generate{' '}
                      <span className="font-medium">{recommendations.length} personalized recommendations</span>
                      {' '}with an average confidence of{' '}
                      <span className="font-medium">
                        {(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length || 0).toFixed(0)}%
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <ChevronRight className="w-4 h-4 text-green-500 mt-1" />
                    <div>
                      <h5 className="font-medium">Try Recommended Meals</h5>
                      <p className="text-sm text-muted-foreground">
                        Start with high-confidence recommendations to see immediate results
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-1" />
                    <div>
                      <h5 className="font-medium">Track Your Response</h5>
                      <p className="text-sm text-muted-foreground">
                        Log glucose readings after trying new meals to improve future recommendations
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-1" />
                    <div>
                      <h5 className="font-medium">Refine Over Time</h5>
                      <p className="text-sm text-muted-foreground">
                        The more data you provide, the more personalized your recommendations become
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}