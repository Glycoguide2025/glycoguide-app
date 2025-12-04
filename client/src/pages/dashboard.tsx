import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import HealthCards from "@/components/dashboard/health-cards";
import GlucoseChart from "@/components/dashboard/glucose-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, Sun, Moon, Apple, Crown, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { DailyStats, MealLogWithMeal } from "@/types";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dailyStats } = useQuery<DailyStats>({
    queryKey: ["/api/analytics/daily"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: todayMeals } = useQuery<MealLogWithMeal[]>({
    queryKey: ["/api/meal-logs"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const quickLogMeal = () => {
    // TODO: Open quick meal logging modal
    toast({
      title: "Feature Coming Soon",
      description: "Quick meal logging will be available soon.",
    });
  };

  const quickLogGlucose = () => {
    // TODO: Open quick glucose logging modal  
    toast({
      title: "Feature Coming Soon",
      description: "Quick glucose logging will be available soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* Health Status Cards */}
        <HealthCards stats={dailyStats} />

        {/* Glucose Chart and Today's Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlucoseChart />
          
          {/* Today's Meals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Meals</CardTitle>
              <Link href="/meals">
                <Button variant="ghost" size="sm" data-testid="button-view-all-meals">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!todayMeals || todayMeals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No meals logged today</p>
                  <Link href="/meals">
                    <Button variant="outline" size="sm" className="mt-2" data-testid="button-start-logging">
                      Start Logging
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayMeals.slice(0, 3).map((mealLog) => (
                    <div key={mealLog.id} className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer" data-testid={`meal-log-${mealLog.id}`}>
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {mealLog.category === 'breakfast' && <Coffee className="w-5 h-5 text-primary" />}
                        {mealLog.category === 'lunch' && <Sun className="w-5 h-5 text-warning" />}
                        {mealLog.category === 'dinner' && <Moon className="w-5 h-5 text-accent" />}
                        {mealLog.category === 'snack' && <Apple className="w-5 h-5 text-success" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {mealLog.customMealName || mealLog.meal?.name || "Custom Meal"}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <span>{new Date(mealLog.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          {mealLog.meal?.glycemicIndex && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              mealLog.meal.glycemicIndex === 'low' ? 'gi-low' : 'gi-medium'
                            }`}>
                              {mealLog.meal.glycemicIndex} GI
                            </span>
                          )}
                          <span>{mealLog.customCarbs || mealLog.meal?.carbohydrates || '0'}g carbs</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="bg-accent text-accent-foreground p-6 h-auto justify-start hover:bg-accent/90 transition-colors" 
            onClick={quickLogMeal}
            data-testid="button-log-meal"
          >
            <div className="text-left">
              <div className="flex items-center mb-2">
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">Log a Meal</span>
              </div>
              <p className="text-sm opacity-90">Track your food and carbs</p>
            </div>
          </Button>

          <Button 
            className="bg-primary text-primary-foreground p-6 h-auto justify-start hover:bg-primary/90 transition-colors"
            onClick={quickLogGlucose}
            data-testid="button-log-glucose"
          >
            <div className="text-left">
              <div className="flex items-center mb-2">
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">Log Blood Sugar</span>
              </div>
              <p className="text-sm opacity-90">Record your glucose reading</p>
            </div>
          </Button>

          <Link href="/consultations">
            <Button 
              variant="secondary"
              className="w-full p-6 h-auto justify-start hover:bg-muted transition-colors"
              data-testid="button-book-consultation"
            >
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Book Consultation</span>
                </div>
                <p className="text-sm opacity-90">Schedule with your care team</p>
              </div>
            </Button>
          </Link>

          <Link href="/overview">
            <Button 
              className="w-full p-6 h-auto justify-start bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
              data-testid="button-explore-platform"
            >
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Explore All Features</span>
                </div>
                <p className="text-sm opacity-90">See everything available to you</p>
              </div>
            </Button>
          </Link>
        </div>
      </main>

      <BottomNavigation />

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 md:bottom-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        onClick={quickLogMeal}
        data-testid="button-floating-action"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
