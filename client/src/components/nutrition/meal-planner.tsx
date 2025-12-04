import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Coffee,
  Sun,
  Moon,
  Apple,
  ChefHat,
  Lightbulb,
  Save,
  Plus,
  Trash2
} from "lucide-react";
import type { MealWithDetails } from "@/types";

interface MealPlan {
  id: string;
  date: string;
  breakfast?: MealWithDetails;
  lunch?: MealWithDetails;
  dinner?: MealWithDetails;
  snacks: MealWithDetails[];
  totalCarbs: number;
  avgGI: number;
  targetMet: boolean;
}

interface PlanningPreferences {
  maxCarbsPerMeal: number;
  preferredGI: 'low' | 'medium' | 'any';
  dietaryRestrictions: string[];
  activityLevel: 'low' | 'moderate' | 'high';
  glucoseTarget: 'tight' | 'moderate' | 'flexible';
}

const defaultPreferences: PlanningPreferences = {
  maxCarbsPerMeal: 45,
  preferredGI: 'low',
  dietaryRestrictions: [],
  activityLevel: 'moderate',
  glucoseTarget: 'moderate'
};

const mealTimeIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Apple
};

const glucoseTargets = {
  tight: { range: '80-120 mg/dL', carbsPerMeal: 30 },
  moderate: { range: '80-140 mg/dL', carbsPerMeal: 45 },
  flexible: { range: '80-180 mg/dL', carbsPerMeal: 60 }
};

export default function MealPlanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [preferences, setPreferences] = useState<PlanningPreferences>(defaultPreferences);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: meals } = useQuery<MealWithDetails[]>({
    queryKey: ["/api/meals"],
  });

  const { data: existingPlan } = useQuery<MealPlan>({
    queryKey: ["/api/meal-plans", selectedDate],
  });

  const { data: glucoseReadings } = useQuery({
    queryKey: ["/api/glucose-readings", { date: selectedDate }],
  });

  const savePlanMutation = useMutation({
    mutationFn: async (plan: Partial<MealPlan>) => {
      return apiRequest("POST", "/api/meal-plans", plan);
    },
    onSuccess: () => {
      toast({ title: "Meal plan saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
    }
  });

  const generateSmartPlan = () => {
    if (!meals?.length) return;
    
    setIsGenerating(true);
    
    // Smart meal selection algorithm based on preferences
    const filterMeals = (category: string, maxCarbs: number) => {
      return meals
        .filter(meal => 
          meal.category === category &&
          Number(meal.carbohydrates || 0) <= maxCarbs &&
          (preferences.preferredGI === 'any' || meal.glycemicIndex === preferences.preferredGI)
        )
        .sort((a, b) => {
          // Prioritize by GI and carbs
          const giScore = (gi: string) => gi === 'low' ? 3 : gi === 'medium' ? 2 : 1;
          return (giScore(b.glycemicIndex) - giScore(a.glycemicIndex)) ||
                 (Number(a.carbohydrates || 0) - Number(b.carbohydrates || 0));
        });
    };

    const breakfast = filterMeals('breakfast', preferences.maxCarbsPerMeal)[0];
    const lunch = filterMeals('lunch', preferences.maxCarbsPerMeal)[0];
    const dinner = filterMeals('dinner', preferences.maxCarbsPerMeal)[0];
    const snackOptions = filterMeals('snack', 20);
    const snacks = snackOptions.slice(0, 2);

    const totalCarbs = [breakfast, lunch, dinner, ...snacks]
      .reduce((sum, meal) => sum + Number(meal?.carbohydrates || 0), 0);

    const avgGI = [breakfast, lunch, dinner, ...snacks]
      .reduce((sum, meal) => {
        const gi = meal?.glycemicIndex === 'low' ? 45 : meal?.glycemicIndex === 'medium' ? 60 : 75;
        return sum + gi * Number(meal?.carbohydrates || 0);
      }, 0) / totalCarbs;

    const generatedPlan: Partial<MealPlan> = {
      date: selectedDate,
      breakfast,
      lunch,
      dinner,
      snacks,
      totalCarbs,
      avgGI,
      targetMet: totalCarbs <= (preferences.maxCarbsPerMeal * 3 + 40)
    };

    savePlanMutation.mutate(generatedPlan);
    setIsGenerating(false);
  };

  const getMealRecommendations = (mealType: string, currentCarbs: number) => {
    if (!meals) return [];
    
    const remainingCarbs = preferences.maxCarbsPerMeal - currentCarbs;
    
    return meals
      .filter(meal => 
        meal.category === mealType &&
        Number(meal.carbohydrates || 0) <= remainingCarbs &&
        (preferences.preferredGI === 'any' || meal.glycemicIndex === preferences.preferredGI)
      )
      .slice(0, 3);
  };

  const getGIColor = (gi: string) => {
    switch (gi) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentPlan = existingPlan || {
    id: '',
    date: selectedDate,
    breakfast: undefined,
    lunch: undefined,
    dinner: undefined,
    snacks: [],
    totalCarbs: 0,
    avgGI: 0,
    targetMet: false
  };

  return (
    <div className="space-y-6" data-testid="meal-planner">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Smart Meal Planning</h2>
        <p className="text-muted-foreground">Intelligent meal planning with glycemic index guidance</p>
      </div>

      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planner" data-testid="tab-planner">
            <ChefHat className="w-4 h-4 mr-2" />
            Meal Planner
          </TabsTrigger>
          <TabsTrigger value="preferences" data-testid="tab-preferences">
            <Target className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">
            <Lightbulb className="w-4 h-4 mr-2" />
            Smart Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="plan-date">Plan Date</Label>
                <Input
                  id="plan-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1"
                  data-testid="input-plan-date"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={generateSmartPlan}
                disabled={isGenerating || !meals?.length}
                data-testid="button-generate-plan"
              >
                {isGenerating ? "Generating..." : "Generate Smart Plan"}
              </Button>
            </div>
          </div>

          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Daily Summary - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {currentPlan.totalCarbs.toFixed(0)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Total Carbs</div>
                </div>
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold">
                    {currentPlan.avgGI.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg GI</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {((currentPlan.totalCarbs / (preferences.maxCarbsPerMeal * 3)) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Target Progress</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentPlan.targetMet ? '✓' : '!'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentPlan.targetMet ? 'On Track' : 'Needs Adjustment'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Plan Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Main Meals */}
            <div className="space-y-4">
              {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
                const meal = currentPlan[mealType];
                const Icon = mealTimeIcons[mealType];
                const recommendations = getMealRecommendations(mealType, meal?.carbohydrates || 0);
                
                return (
                  <Card key={mealType}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg capitalize">
                        <Icon className="w-5 h-5 mr-2 text-primary" />
                        {mealType}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {meal ? (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{meal.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {meal.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Remove meal logic here
                              }}
                              data-testid={`button-remove-${mealType}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <Badge className={getGIColor(meal.glycemicIndex)}>
                              {meal.glycemicIndex} GI
                            </Badge>
                            <span>{Number(meal.carbohydrates || 0)}g carbs</span>
                            <span>{meal.calories} cal</span>
                            {meal.prepTime && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {meal.prepTime}m
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground mb-3">No meal planned</p>
                          {recommendations.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Suggested meals:</p>
                              {recommendations.slice(0, 2).map((rec, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start"
                                  data-testid={`button-add-${mealType}-${index}`}
                                >
                                  <Plus className="w-3 h-3 mr-2" />
                                  {rec.name} ({rec.carbohydrates}g carbs)
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-browse-${mealType}`}
                            >
                              <Plus className="w-3 h-3 mr-2" />
                              Browse {mealType} options
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Snacks & Analysis */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Apple className="w-5 h-5 mr-2 text-primary" />
                    Snacks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPlan.snacks.length > 0 ? (
                    <div className="space-y-3">
                      {currentPlan.snacks.map((snack, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <h5 className="font-medium">{snack.name}</h5>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge className={getGIColor(snack.glycemicIndex)} variant="outline">
                                {snack.glycemicIndex} GI
                              </Badge>
                              <span>{Number(snack.carbohydrates || 0)}g carbs</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-remove-snack-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-3">No snacks planned</p>
                      <Button variant="outline" size="sm" data-testid="button-add-snack">
                        <Plus className="w-3 h-3 mr-2" />
                        Add Snack
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Glucose Impact Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Based on your meal plan and glycemic index data:
                    </div>
                    
                    {currentPlan.avgGI <= 55 ? (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Excellent plan!</strong> Low average GI ({currentPlan.avgGI.toFixed(0)}) 
                          should provide stable blood sugar throughout the day.
                        </AlertDescription>
                      </Alert>
                    ) : currentPlan.avgGI <= 69 ? (
                      <Alert>
                        <AlertDescription>
                          <strong>Good plan.</strong> Moderate GI ({currentPlan.avgGI.toFixed(0)}) 
                          may cause mild glucose fluctuations. Consider timing with activity.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          <strong>High GI alert.</strong> Average GI ({currentPlan.avgGI.toFixed(0)}) 
                          may cause significant glucose spikes. Consider swapping some meals.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="pt-3 border-t">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Predicted peak glucose:</span>
                          <span className="font-medium">
                            {Math.round(120 + (Number(currentPlan.avgGI) - 55) * 1.2)} mg/dL
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time to peak:</span>
                          <span className="font-medium">
                            {currentPlan.avgGI <= 55 ? '90-120 min' : currentPlan.avgGI <= 69 ? '60-90 min' : '30-60 min'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration elevated:</span>
                          <span className="font-medium">
                            {currentPlan.avgGI <= 55 ? '2-3 hours' : currentPlan.avgGI <= 69 ? '3-4 hours' : '4-5 hours'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planning Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="max-carbs">Max Carbs Per Meal (grams)</Label>
                  <Input
                    id="max-carbs"
                    type="number"
                    value={preferences.maxCarbsPerMeal}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      maxCarbsPerMeal: parseInt(e.target.value) || 45
                    })}
                    data-testid="input-max-carbs"
                  />
                </div>

                <div>
                  <Label htmlFor="preferred-gi">Preferred GI Level</Label>
                  <Select
                    value={preferences.preferredGI}
                    onValueChange={(value: 'low' | 'medium' | 'any') => 
                      setPreferences({...preferences, preferredGI: value})
                    }
                  >
                    <SelectTrigger data-testid="select-preferred-gi">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low GI only (≤55)</SelectItem>
                      <SelectItem value="medium">Low to Medium GI (≤69)</SelectItem>
                      <SelectItem value="any">Any GI level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="activity-level">Activity Level</Label>
                  <Select
                    value={preferences.activityLevel}
                    onValueChange={(value: 'low' | 'moderate' | 'high') =>
                      setPreferences({...preferences, activityLevel: value})
                    }
                  >
                    <SelectTrigger data-testid="select-activity-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (sedentary)</SelectItem>
                      <SelectItem value="moderate">Moderate (some exercise)</SelectItem>
                      <SelectItem value="high">High (very active)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="glucose-target">Glucose Control Goal</Label>
                  <Select
                    value={preferences.glucoseTarget}
                    onValueChange={(value: 'tight' | 'moderate' | 'flexible') =>
                      setPreferences({...preferences, glucoseTarget: value})
                    }
                  >
                    <SelectTrigger data-testid="select-glucose-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight control ({glucoseTargets.tight.range})</SelectItem>
                      <SelectItem value="moderate">Moderate control ({glucoseTargets.moderate.range})</SelectItem>
                      <SelectItem value="flexible">Flexible control ({glucoseTargets.flexible.range})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    // Update preferences in backend
                    toast({ title: "Preferences saved!" });
                  }}
                  data-testid="button-save-preferences"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  Smart Planning Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-1">Start with Low GI</h5>
                    <p className="text-sm text-green-700">
                      Begin your day with low GI foods to maintain stable glucose throughout the morning.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-1">Pair & Balance</h5>
                    <p className="text-sm text-blue-700">
                      Combine higher GI foods with protein, fiber, or healthy fats to slow absorption.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-800 mb-1">Time Around Activity</h5>
                    <p className="text-sm text-purple-700">
                      Schedule moderate to high GI meals before or after physical activity when possible.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h5 className="font-medium text-orange-800 mb-1">Consistent Timing</h5>
                    <p className="text-sm text-orange-700">
                      Eat at regular times to help your body anticipate and manage glucose levels better.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {glucoseReadings && Array.isArray(glucoseReadings) && glucoseReadings.length > 0 ? (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Based on your recent glucose patterns, your average reading is{' '}
                      {Math.round(glucoseReadings.reduce((sum: number, r: any) => sum + r.value, 0) / glucoseReadings.length)} mg/dL.
                      {' '}Consider meals that keep you in your target range.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Start logging glucose readings to get personalized meal recommendations 
                      based on your individual response patterns.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <h5 className="font-medium">Your Planning Profile:</h5>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• Target: {preferences.maxCarbsPerMeal}g carbs per meal</div>
                    <div>• Preference: {preferences.preferredGI} GI foods</div>
                    <div>• Activity: {preferences.activityLevel} level</div>
                    <div>• Control goal: {preferences.glucoseTarget} glucose control</div>
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