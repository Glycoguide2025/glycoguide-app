import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Droplets, Plus, Minus, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function HydrationSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's hydration log
  const { data: hydrationData } = useQuery<{ cups: number }>({
    queryKey: ["/api/hydration/today"],
    retry: false,
  });

  // Add cup mutation
  const addCupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/hydration/add", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hydration/today"] });
      toast({
        title: "Cup Added! 💧",
        description: "Great job staying hydrated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log water intake. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentCups = hydrationData?.cups || 0;
  const targetCups = 8; // 8 cups daily target
  const progress = Math.min((currentCups / targetCups) * 100, 100);

  // Calculate water amount (assuming 250ml per cup)
  const totalWaterMl = currentCups * 250;
  const totalWaterOz = Math.round(totalWaterMl / 29.5735); // Convert to fluid ounces

  return (
    <div className="space-y-4" data-testid="hydration-section">
          {/* Progress visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {currentCups} of {targetCups} cups
              </span>
              <span className="text-muted-foreground">
                {totalWaterMl}ml ({totalWaterOz}oz)
              </span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                data-testid="hydration-progress-bar"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {progress.toFixed(0)}% of daily goal
            </div>
          </div>

          {/* Water cup icons visualization */}
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: targetCups }, (_, i) => (
              <div
                key={i}
                className={`text-2xl ${
                  i < currentCups ? "text-blue-500" : "text-gray-300 dark:text-gray-600"
                }`}
                data-testid={`cup-${i}`}
              >
                💧
              </div>
            ))}
          </div>

          {/* Add cup button */}
          <div className="flex justify-center">
            <Button
              onClick={() => addCupMutation.mutate()}
              disabled={addCupMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              data-testid="button-add-cup"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Cup
              {addCupMutation.isPending && " ..."}
            </Button>
          </div>

          {/* Encouragement message */}
          {currentCups >= targetCups ? (
            <div className="text-center text-green-600 dark:text-green-400 font-medium">
              🎉 Amazing! You've reached your hydration goal today!
            </div>
          ) : currentCups >= targetCups * 0.75 ? (
            <div className="text-center text-blue-600 dark:text-blue-400">
              💪 You're almost there! Keep it up!
            </div>
          ) : currentCups >= targetCups * 0.5 ? (
            <div className="text-center text-yellow-600 dark:text-yellow-400">
              🌟 Great progress! Stay hydrated!
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400">
              💧 Remember to stay hydrated throughout the day
            </div>
          )}

          {/* Learn More Button */}
          <div className="flex justify-center pt-2">
            <Link href="/articles/hydration/power-of-hydration">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                data-testid="button-learn-hydration"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More About Hydration
              </Button>
            </Link>
          </div>
    </div>
  );
}