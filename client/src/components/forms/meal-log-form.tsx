import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { insertMealLogSchema } from "@shared/schema";
import type { MealWithDetails } from "@/types";

const formSchema = insertMealLogSchema.extend({
  category: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  customCarbs: z.coerce.number().optional(),
  customCalories: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MealLogFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function MealLogForm({ onClose, onSuccess }: MealLogFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<MealWithDetails | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'breakfast',
      customCarbs: 0,
      customCalories: 0,
      notes: '',
    },
  });

  const { data: meals } = useQuery<MealWithDetails[]>({
    queryKey: ["/api/meals", { search: searchQuery || undefined }],
    enabled: !!searchQuery,
    retry: false,
  });

  const createMealLog = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/meal-logs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/daily"] });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (selectedMeal) {
      data.mealId = selectedMeal.id;
    }
    createMealLog.mutate(data);
  };

  const selectMeal = (meal: MealWithDetails) => {
    setSelectedMeal(meal);
    form.setValue('customCarbs', Number(meal.carbohydrates) || 0);
    form.setValue('customCalories', meal.calories || 0);
  };

  const getGIBadgeClass = (gi: string) => {
    switch (gi) {
      case 'low': return 'gi-low';
      case 'medium': return 'gi-medium';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'gi-low';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" data-testid="meal-log-form">
        <DialogHeader>
          <DialogTitle>Log a Meal</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" data-testid="tab-search-meal">Search Meals</TabsTrigger>
            <TabsTrigger value="custom" data-testid="tab-custom-meal">Custom Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-meal-search"
              />
            </div>
            
            {selectedMeal && (
              <div className="p-3 border border-border rounded-lg bg-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{selectedMeal.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`${getGIBadgeClass(selectedMeal.glycemicIndex)} text-xs`}>
                        {selectedMeal.glycemicIndex} GI
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedMeal.carbohydrates}g carbs
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMeal(null)}
                    data-testid="button-clear-selection"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
            
            {searchQuery && meals && meals.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {meals.slice(0, 5).map((meal) => (
                  <div
                    key={meal.id}
                    className="p-3 border border-border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => selectMeal(meal)}
                    data-testid={`meal-option-${meal.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{meal.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${getGIBadgeClass(meal.glycemicIndex)} text-xs`}>
                            {meal.glycemicIndex} GI
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {meal.carbohydrates}g carbs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <FormField
              control={form.control}
              name="customMealName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter meal name"
                      {...field}
                      value={field.value || ''}
                      data-testid="input-custom-meal-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-meal-category">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customCarbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbohydrates (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        data-testid="input-carbs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customCalories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        data-testid="input-calories"
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about this meal..."
                      className="resize-none"
                      {...field}
                      data-testid="textarea-meal-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createMealLog.isPending}
                data-testid="button-cancel-meal"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMealLog.isPending}
                data-testid="button-save-meal"
              >
                {createMealLog.isPending ? "Saving..." : "Log Meal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
