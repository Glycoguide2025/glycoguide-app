import { useState, useRef, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import MealCategories from "@/components/meals/meal-categories";
import MealCard from "@/components/meals/meal-card";
import GlycemicEducation from "@/components/nutrition/glycemic-education";
import CarbCalculator from "@/components/nutrition/carb-calculator";
import MealPlanner from "@/components/nutrition/meal-planner";
import BloodSugarAnalysis from "@/components/nutrition/blood-sugar-analysis";
import SmartRecommendations from "@/components/nutrition/smart-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, BookOpen, Calculator, ChefHat, TrendingUp, Sparkles, Utensils, AlertTriangle } from "lucide-react";
import type { MealWithDetails } from "@/types";

// Debounced search hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Meals() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, isPro } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState("browse");
  const [showHighGI, setShowHighGI] = useState(true); // Show all recipes for quality control
  const mealsGridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [lastViewedMeal, setLastViewedMeal] = useState<string | null>(null);
  const [showContinueMessage, setShowContinueMessage] = useState(false);

  // Debounce search to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Fetch meals data with infinite scrolling
  const {
    data: mealsData,
    isLoading: mealsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["/api/meals", selectedCategory, debouncedSearchQuery],
    queryFn: async ({ pageParam = 0, signal }) => {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
      params.set('limit', '30');
      params.set('offset', pageParam.toString());
      
      const url = `/api/meals?${params.toString()}`;
      const res = await fetch(url, { 
        credentials: "include",
        signal // Enable fetch cancellation for better performance
      });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    enabled: !isLoading && isAuthenticated, // CRITICAL: Wait for auth loading to complete
    retry: false,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    initialPageParam: 0,
  });

  // Flatten the paginated data into a single array
  const rawMeals = useMemo(() => {
    return mealsData?.pages.flatMap(page => page.items) || [];
  }, [mealsData]);

  // Intersection observer for automatic infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter out high-GI meals by default for safety
  const meals = rawMeals ? rawMeals.filter(meal => {
    if (!showHighGI && meal.glycemicIndex === 'high') {
      return false;
    }
    return true;
  }) : undefined;

  // Count high-GI meals for display
  const highGICount = rawMeals ? rawMeals.filter(meal => meal.glycemicIndex === 'high').length : 0;

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

  // Load saved browsing position on component mount
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('meals-scroll-position');
    const savedLastMeal = localStorage.getItem('meals-last-viewed');
    const savedTimestamp = localStorage.getItem('meals-last-visit');
    
    if (savedLastMeal && savedTimestamp) {
      const lastVisit = new Date(savedTimestamp);
      const now = new Date();
      const hoursSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);
      
      // Show continue message if last visit was within 24 hours
      if (hoursSinceLastVisit < 24) {
        setLastViewedMeal(savedLastMeal);
        setShowContinueMessage(true);
      }
    }

    // Restore scroll position after meals load (only if not jumping to letter)
    const targetLetter = localStorage.getItem('jump-to-letter');
    if (!targetLetter && savedScrollPosition && activeTab === "browse") {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }, 100);
    }
  }, [activeTab]);

  // Handle alphabet navigation jump when meals data becomes available
  useEffect(() => {
    const targetLetter = localStorage.getItem('jump-to-letter');
    
    // Jump to letter if coming from recipe page and meals are now loaded
    if (targetLetter && meals && meals.length > 0) {
      localStorage.removeItem('jump-to-letter'); // Clear the flag
      setTimeout(() => {
        jumpToLetter(targetLetter);
      }, 300); // Give a bit more time for DOM to be ready
    }
  }, [meals]); // Only trigger when meals data changes

  // Save scroll position when scrolling (throttled to prevent main thread blocking)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (activeTab !== "browse") return;
      
      // Throttle localStorage writes to prevent main thread blocking
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        // Use requestIdleCallback when available for better performance  
        if (typeof window !== 'undefined') {
          const scrollPosition = window.scrollY || window.pageYOffset || 0;
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              localStorage.setItem('meals-scroll-position', scrollPosition.toString());
            });
          } else {
            localStorage.setItem('meals-scroll-position', scrollPosition.toString());
          }
        }
      }, 2000); // Reduced frequency to every 2 seconds for better performance
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [activeTab]);

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

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
  };

  const toggleHighGI = (checked: boolean) => {
    setShowHighGI(checked);
  };

  const continueToBrowsing = () => {
    if (lastViewedMeal) {
      const mealElement = document.querySelector(`[data-testid="meal-card-${lastViewedMeal}"]`);
      if (mealElement) {
        mealElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the meal briefly
        mealElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          mealElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 3000);
      }
    }
    setShowContinueMessage(false);
  };

  const jumpToLetter = (letter: string) => {
    
    // Clear any existing category filter but use search to filter by letter
    setSelectedCategory("");
    setSearchQuery(letter.toLowerCase());
    
    // Scroll to top to see the filtered results
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
  };

  const saveMealView = (mealId: string, mealName: string) => {
    localStorage.setItem('meals-last-viewed', mealId);
    localStorage.setItem('meals-last-viewed-name', mealName);
    localStorage.setItem('meals-last-visit', new Date().toISOString());
    localStorage.setItem('meals-scroll-position', window.scrollY.toString());
  };

  const hasActiveFilters = selectedCategory || searchQuery;
  const totalMeals = rawMeals?.length || 0;
  const visibleMeals = meals?.length || 0;

  return (
    <div className="min-h-screen bg-background" data-testid="meals-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Nutrition & Meals</h1>
          <p className="text-muted-foreground">Complete nutrition management with advanced tracking and personalized insights</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="browse" data-testid="tab-browse">
              <Utensils className="w-4 h-4 mr-2" />
              Browse Meals
            </TabsTrigger>
            <TabsTrigger value="education" data-testid="tab-education">
              <BookOpen className="w-4 h-4 mr-2" />
              GI Education
            </TabsTrigger>
            <TabsTrigger value="calculator" data-testid="tab-calculator">
              <Calculator className="w-4 h-4 mr-2" />
              Carb Counter
            </TabsTrigger>
            <TabsTrigger value="planner" data-testid="tab-planner">
              <ChefHat className="w-4 h-4 mr-2" />
              Meal Planning
            </TabsTrigger>
            <TabsTrigger value="analysis" data-testid="tab-analysis">
              <TrendingUp className="w-4 h-4 mr-2" />
              Blood Sugar
            </TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Continue where you left off */}
            {showContinueMessage && lastViewedMeal && (
              <Card className="bg-primary/5 border-primary/20 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-primary">📍</div>
                      <div>
                        <p className="font-medium text-primary">Continue where you left off</p>
                        <p className="text-sm text-muted-foreground">
                          Last viewed: {localStorage.getItem('meals-last-viewed-name') || 'Recipe'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={continueToBrowsing} data-testid="button-continue-browsing">
                        Continue
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowContinueMessage(false)}
                        data-testid="button-dismiss-continue"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Clean Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by ingredient, meal name, or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-xl border-2 shadow-sm"
              data-testid="input-search-meals"
            />
          </div>

          {/* Quick Jump to Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="text-sm text-muted-foreground">Click any letter to jump to recipes starting with that letter</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => {
                return (
                  <Button
                    key={letter}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 text-sm font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
                    onClick={() => jumpToLetter(letter)}
                    data-testid={`jump-letter-${letter}`}
                  >
                    {letter}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 mb-6 justify-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory && (
                <Badge variant="secondary" className="capitalize px-3 py-1" data-testid={`filter-badge-${selectedCategory}`}>
                  {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory("")}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                    data-testid={`remove-filter-${selectedCategory}`}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="px-3 py-1" data-testid="filter-badge-search">
                  "{searchQuery}"
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                    data-testid="remove-filter-search"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                data-testid="button-clear-filters"
                className="text-primary hover:text-primary/80"
              >
                Clear All
              </Button>
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Meal Categories */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <MealCategories 
                onCategorySelect={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
              
              {/* Progress info - only when more recipes are available */}
              {mealsData?.pages?.[0]?.total && mealsData.pages[0].total > visibleMeals && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {visibleMeals} of {mealsData.pages[0].total} recipes • Scroll down to load more
                  </p>
                </div>
              )}
            </div>

            {/* Meals Grid */}
            <div className="mt-8">
              {mealsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
                      <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : !meals || meals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No meals found matching your criteria</p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      data-testid="button-clear-search"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="meals-grid" ref={mealsGridRef}>
                    {meals.map((meal) => (
                      <MealCard 
                        key={meal.id} 
                        meal={meal} 
                        onMealView={() => saveMealView(meal.id, meal.name)}
                      />
                    ))}
                  </div>
                  
                  {/* Infinite scroll load more trigger */}
                  {hasNextPage && (
                    <div ref={loadMoreRef} className="flex flex-col items-center py-8 space-y-4">
                      {isFetchingNextPage ? (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading more recipes...</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {mealsData?.pages?.[0]?.total && (
                                `${visibleMeals} of ${mealsData.pages[0].total} recipes loaded`
                              )}
                            </p>
                            <div className="w-64 bg-muted rounded-full h-2">
                              {mealsData?.pages?.[0]?.total && (
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${(visibleMeals / mealsData.pages[0].total) * 100}%` }}
                                />
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="default" 
                            onClick={() => fetchNextPage()}
                            data-testid="button-load-more"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                            size="lg"
                          >
                            📄 Load More Recipes
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Or simply scroll down to load automatically
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Show total count or upgrade prompt for free users */}
                  {!hasNextPage && meals && meals.length > 0 && (
                    <>
                      {!isPro && meals.length >= 25 ? (
                        <Card className="mt-8 border-4 border-primary bg-gradient-to-br from-primary/10 to-purple-500/10 shadow-xl">
                          <CardContent className="py-10 text-center space-y-6">
                            <div className="text-6xl mb-2">🔒</div>
                            <h3 className="text-3xl font-bold text-primary">To Unlock More Recipes, Upgrade!</h3>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto border-2 border-primary/30">
                              <p className="text-xl font-semibold text-foreground mb-3">
                                You're viewing <span className="text-primary font-bold">25 of 550+</span> recipes
                              </p>
                              <p className="text-lg text-muted-foreground">
                                Upgrade to <span className="font-bold text-foreground">Premium</span> or <span className="font-bold text-foreground">Pro</span> to unlock all low-glycemic recipes!
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                              <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-2xl text-3xl font-extrabold px-16 py-10 animate-pulse"
                                onClick={() => window.location.href = '/subscription'}
                                data-testid="button-upgrade-recipes"
                              >
                                🚀 UPGRADE NOW
                              </Button>
                            </div>
                            <p className="text-base text-muted-foreground font-medium">
                              Get unlimited recipes, advanced meal planning, and personalized insights
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>Showing all {meals.length} recipes</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Recommended Meals Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("education")}
                    data-testid="button-quick-education"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Learn GI Basics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("calculator")}
                    data-testid="button-quick-calculator"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Count Carbs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("planner")}
                    data-testid="button-quick-planner"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Plan Meals
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("recommendations")}
                    data-testid="button-quick-recommendations"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Smart Tips
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="education">
            <GlycemicEducation />
          </TabsContent>

          <TabsContent value="calculator">
            <CarbCalculator />
          </TabsContent>

          <TabsContent value="planner">
            <MealPlanner />
          </TabsContent>

          <TabsContent value="analysis">
            <BloodSugarAnalysis />
          </TabsContent>

          <TabsContent value="recommendations">
            <SmartRecommendations />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
