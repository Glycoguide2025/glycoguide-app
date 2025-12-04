import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Activity, Plus, Clock, Zap, Heart, MessageSquare, BookOpen, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Exercise logging form schema
const exerciseLogSchema = z.object({
  exerciseType: z.string().min(1, "Exercise type is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(600, "Duration cannot exceed 10 hours"),
  intensity: z.enum(["light", "moderate", "vigorous"]),
  caloriesBurned: z.number().min(0).optional(),
  heartRate: z.number().min(40).max(220).optional(),
  notes: z.string().optional(),
});

type ExerciseLogForm = z.infer<typeof exerciseLogSchema>;

const popularExercises = [
  { name: "Walking", icon: "🚶", articlePath: "/articles/movement/walking-for-wellness" },
  { name: "Yoga", icon: "🧘", articlePath: "/articles/movement/yoga-for-harmony" },
  { name: "Stretching", icon: "🤸", articlePath: "/articles/movement/stretching-for-flexibility" },
  { name: "Running", icon: "🏃", articlePath: "/articles/movement/running-for-balance" },
  { name: "Cycling", icon: "🚴", articlePath: "/articles/movement/cycling-for-stamina" },
  { name: "Swimming", icon: "🏊", articlePath: "/articles/movement/swimming-for-fitness" },
  { name: "Strength Training", icon: "💪", articlePath: "/articles/movement/strength-training" },
  { name: "Dancing", icon: "💃", articlePath: "/articles/movement/dancing-for-joy" },
];

const intensityColors = {
  light: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
  vigorous: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function Movement() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch recent exercise logs
  const { data: exerciseLogs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/exercise-logs"],
  });

  // Create exercise log mutation
  const createExerciseLog = useMutation({
    mutationFn: (data: ExerciseLogForm) => apiRequest("POST", "/api/exercise-logs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-logs"] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Exercise logged successfully! 🎉",
        description: "Keep up the great work on your wellness journey.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to log exercise",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ExerciseLogForm>({
    resolver: zodResolver(exerciseLogSchema),
    defaultValues: {
      exerciseType: "",
      duration: 30,
      intensity: "moderate",
      caloriesBurned: undefined,
      heartRate: undefined,
      notes: "",
    },
  });

  const onSubmit = (data: ExerciseLogForm) => {
    createExerciseLog.mutate(data);
  };

  const totalMinutesToday = exerciseLogs.reduce((total: number, log: any) => {
    const today = new Date().toDateString();
    const logDate = new Date(log.loggedAt).toDateString();
    return logDate === today ? total + (log.duration || 0) : total;
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <div className="max-w-2xl mx-auto py-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
          data-testid="button-close-movement"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-movement-title">
            Movement & Exercise
          </h1>
          <p className="text-muted-foreground">
            Track your daily movement and build healthy exercise habits
          </p>
        </div>

        {/* Today's Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" data-testid="text-today-minutes">
                    {totalMinutesToday} minutes today
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Goal: 150 minutes/week (22 min/day)
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                data-testid="button-log-exercise"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Log Exercise</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Exercise Buttons */}
        {!showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Log</CardTitle>
              <CardDescription>Tap to quickly log common activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularExercises.map((exercise) => (
                  <div key={exercise.name} className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="h-14 flex-1 flex items-center justify-start gap-3 px-4"
                      onClick={() => {
                        form.setValue("exerciseType", exercise.name);
                        setShowForm(true);
                      }}
                      data-testid={`button-quick-${exercise.name.toLowerCase().replace(" ", "-")}`}
                    >
                      <span className="text-2xl">{exercise.icon}</span>
                      <span className="text-sm font-medium">{exercise.name}</span>
                    </Button>
                    {exercise.articlePath && (
                      <Link href={exercise.articlePath}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-14 px-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                          data-testid={`link-learn-${exercise.name.toLowerCase().replace(" ", "-")}`}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Learn
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Logging Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Log Exercise Activity</CardTitle>
              <CardDescription>Record your movement and exercise details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="exerciseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Type</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Walking, Yoga, Swimming"
                            {...field}
                            data-testid="input-exercise-type"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensity</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-intensity">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="vigorous">Vigorous</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caloriesBurned"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories Burned (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="e.g., 150"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-calories"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heartRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heart Rate (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="e.g., 120"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-heart-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How did you feel? Any observations?"
                            className="min-h-[80px]"
                            {...field}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      disabled={createExerciseLog.isPending}
                      data-testid="button-save-exercise"
                      className="flex-1"
                    >
                      {createExerciseLog.isPending ? "Saving..." : "Save Exercise"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        form.reset();
                      }}
                      data-testid="button-cancel-exercise"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Recent Exercise History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your movement history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : exerciseLogs.length > 0 ? (
              <div className="space-y-3" data-testid="list-exercise-history">
                {exerciseLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium" data-testid={`text-exercise-${log.id}`}>
                          {log.exerciseType}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{log.duration} min</span>
                          </div>
                          {log.intensity && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${intensityColors[log.intensity as keyof typeof intensityColors]}`}
                            >
                              {log.intensity}
                            </Badge>
                          )}
                          {log.caloriesBurned && (
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3" />
                              <span>{log.caloriesBurned} cal</span>
                            </div>
                          )}
                          {log.heartRate && (
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{log.heartRate} bpm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.loggedAt), "MMM d")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.loggedAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No exercise logged yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Start tracking your movement to build healthy habits
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  data-testid="button-log-first-exercise"
                >
                  Log Your First Exercise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movement Education Card */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">
                  Learn About Different Movement Types
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                  Explore our comprehensive guides on walking, yoga, strength training, dancing, and more. Discover the benefits and get started with different forms of movement.
                </p>
                <Link href="/movement-education">
                  <Button 
                    variant="outline" 
                    className="text-green-600 dark:text-green-400 border-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                    data-testid="button-movement-education"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Movement Education
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}