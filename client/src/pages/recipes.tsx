import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Heart, Utensils, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useBillingStatus } from "@/hooks/useBillingStatus";

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  glycemicIndex: string;
  glycemicValue: number;
  carbohydrates: number;
  calories: number;
  protein: number;
  fat: number;
  fiber: number;
  imageUrl: string;
  imageVersion: number;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Helper function to derive dish type from recipe name and tags
const getDishType = (recipe: Recipe): string => {
  const searchText = `${recipe.name} ${recipe.description}`.toLowerCase();
  
  if (searchText.includes('salad')) return 'salad';
  if (searchText.includes('soup')) return 'soup';
  if (searchText.includes('smoothie')) return 'smoothie';
  if (searchText.includes('stir fry') || searchText.includes('stir-fry')) return 'stir-fry';
  if (searchText.includes('bowl')) return 'bowl';
  if (searchText.includes('casserole')) return 'casserole';
  if (searchText.includes('wrap')) return 'wrap';
  if (searchText.includes('side')) return 'side';
  if (searchText.includes('pasta')) return 'pasta';
  if (searchText.includes('rice') || searchText.includes('fried rice')) return 'rice';
  
  return 'other';
};

export default function Recipes() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDishType, setSelectedDishType] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [carbRange, setCarbRange] = useState([0, 100]);
  const [withinBudget, setWithinBudget] = useState(false);

  // Helper functions to clear incompatible filters
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value !== "all") {
      setSelectedLetter("all"); // Reset letter filter when selecting meal type
    }
  };

  const handleDishTypeChange = (value: string) => {
    setSelectedDishType(value);
    if (value !== "all") {
      setSelectedLetter("all"); // Reset letter filter when selecting dish type
    }
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const topSectionRef = useRef<HTMLDivElement>(null);
  const recipeGridRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isPaid } = useBillingStatus();

  // State for undo functionality
  const [lastLoggedMeal, setLastLoggedMeal] = useState<{
    id: string;
    recipeName: string;
    undoTimeoutId: NodeJS.Timeout | null;
  } | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "Low Glycemic Recipes | GlycoGuide";
  }, []);

  // Force all filters to reset on page load
  useEffect(() => {
    setSelectedCategory("all");
    setSelectedDishType("all");
    setSelectedLetter("all");
    setSearchTerm("");
    setSelectedTags([]);
    setCarbRange([0, 100]);
    setWithinBudget(false);
  }, []);

  // Scroll to top when component mounts (user returns from recipe detail)
  useEffect(() => {
    if (topSectionRef.current) {
      topSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Back to top button visibility based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top of results when letter filter changes
  useEffect(() => {
    if (selectedLetter !== "all" && recipeGridRef.current) {
      // Scroll to the recipe grid when a specific letter is selected
      setTimeout(() => {
        recipeGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (selectedLetter === "all" && topSectionRef.current) {
      // Scroll to top when "All" is clicked
      setTimeout(() => {
        topSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedLetter]);

  // Fetch all recipes - all filtering is now done client-side for independence
  const queryParams = new URLSearchParams();
  queryParams.set('limit', '1000'); // Request all recipes (backend will apply appropriate limits)
  
  const { data: recipesData, isLoading, error } = useQuery<{ items: Recipe[], total: number }>({
    queryKey: [`/api/meals?${queryParams.toString()}`],
    staleTime: 0,
    gcTime: 0,
  });

  // Extract recipes from the API response (which returns {items: [...]} format)
  const recipes = (recipesData?.items || []) as Recipe[];
  
  // Debug logging
  console.log('DEBUG recipesData:', { 
    raw: JSON.stringify(recipesData),
    rawType: typeof recipesData,
    isArray: Array.isArray(recipesData), 
    hasItems: !!(recipesData as any)?.items,
    itemsCount: Array.isArray((recipesData as any)?.items) ? (recipesData as any).items.length : 0,
    recipesCount: recipes.length,
    errorMessage: error?.message,
    errorDetails: JSON.stringify(error)
  });

  // Undo mutation
  const undoMealMutation = useMutation({
    mutationFn: (mealLogId: string) => 
      apiRequest('DELETE', `/meal/${mealLogId}`, undefined),
    onSuccess: () => {
      // Invalidate and refetch daily plan to update carb tracking
      queryClient.invalidateQueries({ queryKey: ['/plan/today'] });
      
      // Clear the undo state
      if (lastLoggedMeal?.undoTimeoutId) {
        clearTimeout(lastLoggedMeal.undoTimeoutId);
      }
      setLastLoggedMeal(null);
      
      toast({
        title: "✅ Meal removed successfully!",
        description: "Your carb tracking has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to remove meal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Meal logging mutation with optimistic feedback  
  const logMealMutation = useMutation({
    mutationFn: (mealData: { recipeId: string }) => 
      apiRequest('POST', '/meal', mealData),
    onSuccess: async (response, variables) => {
      // Parse the response to get meal log information
      const responseData = await response.json();
      const recipe = (recipes as Recipe[]).find((r: Recipe) => r.id === variables.recipeId);
      
      // Clear any existing undo timeout
      if (lastLoggedMeal?.undoTimeoutId) {
        clearTimeout(lastLoggedMeal.undoTimeoutId);
      }
      
      // Set up 5-second undo timeout
      const undoTimeoutId = setTimeout(() => {
        setLastLoggedMeal(null);
      }, 5000);
      
      // Store meal log information for undo
      setLastLoggedMeal({
        id: responseData.id,
        recipeName: recipe?.name || "Unknown Recipe",
        undoTimeoutId,
      });
      
      // Invalidate and refetch daily plan to update carb tracking
      queryClient.invalidateQueries({ queryKey: ['/plan/today'] });
      
      toast({
        title: "✅ Meal logged successfully!",
        description: "Your carb tracking has been updated. Tap to undo within 5 seconds.",
        action: (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleUndoMeal}
            disabled={undoMealMutation.isPending}
          >
            {undoMealMutation.isPending ? "Undoing..." : "Undo"}
          </Button>
        ),
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to log meal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Sample carb budget for filtering - Step 2 will use real user data
  const remainingCarbBudget = 85;

  // Client-side filtering - All filters are independent and applied in order
  const filteredRecipes = useMemo(() => {
    console.log('DEBUG filteredRecipes useMemo:', { 
      recipes, 
      isArray: Array.isArray(recipes), 
      length: recipes?.length 
    });
    
    if (!recipes || !Array.isArray(recipes)) {
      console.log('DEBUG: Returning empty array - recipes not valid');
      return [];
    }

    let results = [...recipes];
    console.log('DEBUG: Starting with', results.length, 'recipes');

    // 1. Alphabet letter filter
    if (selectedLetter && selectedLetter !== "all") {
      results = results.filter((recipe: Recipe) => 
        recipe.name?.trim().toLowerCase().startsWith(selectedLetter.toLowerCase())
      );
      console.log('DEBUG: After letter filter', selectedLetter, ':', results.length, 'recipes');
    }

    // 2. Search term filter
    if (searchTerm) {
      results = results.filter((recipe: Recipe) => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('DEBUG: After search filter "' + searchTerm + '":', results.length, 'recipes');
    }

    // 3. Dish type filter (optional - soft keyword match)
    if (selectedDishType !== "all") {
      results = results.filter((recipe: Recipe) => {
        const recipeDishType = getDishType(recipe);
        return recipeDishType === selectedDishType;
      });
      console.log('DEBUG: After DISH TYPE filter "' + selectedDishType + '":', results.length, 'recipes');
    }

    // 4. Meal type filter (optional)
    if (selectedCategory !== "all") {
      results = results.filter((recipe: Recipe) => 
        recipe.category === selectedCategory
      );
      console.log('DEBUG: After MEAL TYPE filter "' + selectedCategory + '":', results.length, 'recipes');
    }

    // 5. Carb range filter - parse string carbs to number for comparison
    results = results.filter((recipe: Recipe) => {
      // Skip filter if carbs value is missing/null - include these recipes
      if (recipe.carbohydrates === null || recipe.carbohydrates === undefined) {
        return true;
      }
      const carbs = parseFloat(String(recipe.carbohydrates));
      // Skip if parsing failed (NaN)
      if (isNaN(carbs)) {
        return true;
      }
      return carbs >= carbRange[0] && carbs <= carbRange[1];
    });

    // 6. Within budget filter
    if (withinBudget) {
      results = results.filter((recipe: Recipe) => {
        // Skip filter if carbs value is missing/null - include these recipes
        if (recipe.carbohydrates === null || recipe.carbohydrates === undefined) {
          return true;
        }
        return recipe.carbohydrates <= remainingCarbBudget;
      });
    }

    console.log('DEBUG: Final filtered results:', results.length);
    return results;
  }, [recipes, searchTerm, selectedLetter, selectedDishType, selectedCategory, carbRange, withinBudget]);

  const handleRecipeClick = (recipeId: string) => {
    setLocation(`/meals/${recipeId}`);
  };

  const handleLogMeal = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    logMealMutation.mutate({ recipeId: recipe.id });
  };

  const handleUndoMeal = () => {
    if (lastLoggedMeal?.id) {
      undoMealMutation.mutate(lastLoggedMeal.id);
    }
  };

  const categories = [
    { value: "all", label: "All Meal Types" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snacks" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
    { value: "soup", label: "Soups" },
    { value: "pizza", label: "Pizza" },
  ];

  const dishTypes = [
    { value: "all", label: "All Dish Types" },
    { value: "salad", label: "Salads" },
    { value: "soup", label: "Soups" },
    { value: "smoothie", label: "Smoothies" },
    { value: "stir-fry", label: "Stir Fry" },
    { value: "bowl", label: "Bowls" },
    { value: "casserole", label: "Casseroles" },
    { value: "wrap", label: "Wraps" },
    { value: "side", label: "Sides" },
    { value: "pasta", label: "Pasta" },
    { value: "rice", label: "Rice Dishes" },
  ];

  const tags = [
    { id: "high-fiber", label: "High Fiber", active: false },
    { id: "low-carb", label: "Low Carb", active: false },
    { id: "vegetarian", label: "Vegetarian", active: false },
    { id: "protein-rich", label: "Protein Rich", active: false },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="p-4 flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div ref={topSectionRef} className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Low Glycemic Recipes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isPaid ? '570+ low glycemic recipes to support your healthy habits' : `You're viewing 25 curated recipes (Free tier)`}
          </p>
          {!isPaid && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              Upgrade to Premium for access to all 570+ recipes →
            </p>
          )}
        </div>

        {/* A-Z Navigation */}
        <Card data-testid="card-az-navigation">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <Button
                variant={selectedLetter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLetter("all")}
                className="shrink-0"
                data-testid="button-letter-all"
              >
                All
              </Button>
              {ALPHABET.map((letter) => (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLetter(letter)}
                  className="shrink-0 min-w-[40px]"
                  data-testid={`button-letter-${letter}`}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search recipes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-recipes"
          />
        </div>

        {/* Filters */}
        <Card data-testid="card-filters">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="h-4 w-4" />
              <Label className="font-medium">Filter Recipes</Label>
            </div>

            {/* Category and Dish Type Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm">Meal Type</Label>
                <Select 
                  value={selectedCategory} 
                  defaultValue="all"
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Dish Type</Label>
                <Select value={selectedDishType} onValueChange={handleDishTypeChange}>
                  <SelectTrigger data-testid="select-dish-type">
                    <SelectValue placeholder="Select dish type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dishTypes.map((dishType) => (
                      <SelectItem key={dishType.value} value={dishType.value}>
                        {dishType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Within Budget Toggle */}
              <div className="space-y-2">
                <Label className="text-sm">Carb Budget</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="within-budget"
                    checked={withinBudget}
                    onChange={(e) => setWithinBudget(e.target.checked)}
                    className="w-4 h-4"
                    data-testid="checkbox-within-budget"
                  />
                  <label htmlFor="within-budget" className="text-sm">
                    Within my remaining budget ({remainingCarbBudget}g)
                  </label>
                </div>
              </div>
            </div>

            {/* Carb Range Slider */}
            <div className="space-y-2">
              <Label className="text-sm">
                Carbs per serving: {carbRange[0]}g - {carbRange[1]}g
              </Label>
              <Slider
                value={carbRange}
                onValueChange={setCarbRange}
                max={100}
                min={0}
                step={5}
                className="w-full"
                data-testid="slider-carb-range"
              />
            </div>

            {/* Tag Filters */}
            <div className="space-y-2">
              <Label className="text-sm">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.id) 
                          ? prev.filter(t => t !== tag.id)
                          : [...prev, tag.id]
                      );
                    }}
                    data-testid={`tag-${tag.id}`}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Grid */}
        <div ref={recipeGridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe: Recipe) => (
            <Card
              key={recipe.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRecipeClick(recipe.id)}
              data-testid={`recipe-card-${recipe.id}`}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={`${recipe.imageUrl}?v=${recipe.imageVersion}`}
                    alt={recipe.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e5e7eb'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' fill='%23374151'%3ERecipe Image%3C/text%3E%3C/svg%3E";
                    }}
                    data-testid={`recipe-image-${recipe.id}`}
                  />
                  
                  {/* GI Badge */}
                  <Badge
                    className={`absolute top-2 left-2 ${
                      recipe.glycemicIndex === 'low' 
                        ? 'bg-green-500 text-white' 
                        : recipe.glycemicIndex === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                    data-testid={`gi-badge-${recipe.id}`}
                  >
                    GI {recipe.glycemicValue}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {recipe.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(recipe.carbohydrates)}g carbs • {recipe.calories} cal
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {recipe.category}
                    </Badge>
                  </div>

                  {recipe.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>Diabetes-friendly</span>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={(e) => handleLogMeal(recipe, e)}
                      disabled={logMealMutation.isPending}
                      data-testid={`button-log-${recipe.id}`}
                    >
                      <Utensils className="h-4 w-4 mr-1" />
                      {logMealMutation.isPending ? "Logging..." : "Log"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms to find more recipes.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedLetter("all");
                setSelectedCategory("all");
                setSelectedDishType("all");
                setSelectedTags([]);
                setCarbRange([0, 100]);
                setWithinBudget(false);
              }}
              data-testid="button-reset-search"
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <Button
          size="icon"
          className="fixed bottom-20 right-6 z-50 rounded-full w-12 h-12 shadow-lg"
          onClick={scrollToTop}
          data-testid="button-back-to-top"
          aria-label="Scroll back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}