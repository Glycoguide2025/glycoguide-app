import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Activity, Utensils } from "lucide-react";
import GlucoseLogForm from "@/components/forms/glucose-log-form";
import MealLogForm from "@/components/forms/meal-log-form";
import { useState } from "react";

export default function Tracking() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showGlucoseForm, setShowGlucoseForm] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);

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

  return (
    <div className="min-h-screen bg-background" data-testid="tracking-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Health Tracking</h1>
          <p className="text-muted-foreground">Log your health data and monitor patterns over time</p>
        </div>

        {/* Quick Log Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowGlucoseForm(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Readings</h3>
              <p className="text-sm text-muted-foreground">Log reading</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowMealForm(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Meal Log</h3>
              <p className="text-sm text-muted-foreground">Track food & carbs</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Exercise</h3>
              <p className="text-sm text-muted-foreground">Log workout</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Custom Entry</h3>
              <p className="text-sm text-muted-foreground">Add custom data</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Readings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGlucoseForm(true)}>
                Add Reading
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No wellness readings yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowGlucoseForm(true)}
                  data-testid="button-add-glucose-reading"
                >
                  Add First Reading
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Meal Logs</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowMealForm(true)}>
                Add Meal
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meals logged yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowMealForm(true)}
                  data-testid="button-add-meal-log"
                >
                  Log First Meal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />

      {/* Forms */}
      {showGlucoseForm && (
        <GlucoseLogForm 
          onClose={() => setShowGlucoseForm(false)}
          onSuccess={() => {
            setShowGlucoseForm(false);
            toast({
              title: "Success",
              description: "Reading logged successfully",
            });
          }}
        />
      )}

      {showMealForm && (
        <MealLogForm 
          onClose={() => setShowMealForm(false)}
          onSuccess={() => {
            setShowMealForm(false);
            toast({
              title: "Success", 
              description: "Meal logged successfully",
            });
          }}
        />
      )}
    </div>
  );
}
