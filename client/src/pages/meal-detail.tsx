import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Users, ChefHat, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { buildImageSrc } from "@/lib/image-utils";
import CGMMealOverlay from "@/components/CGMMealOverlay";
import type { MealWithDetails } from "@/types";

export default function MealDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Improved scroll management with error prevention
  useEffect(() => {
    // Delay scroll to ensure DOM is ready and prevent conflicts
    const scrollTimeout = setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: 'auto' }); // Use 'auto' for immediate positioning
      } catch (error) {
        console.warn('Scroll error:', error);
      }
    }, 100);
    
    const handleScroll = () => {
      try {
        setShowBackToTop(window.scrollY > 300);
      } catch (error) {
        console.warn('Scroll handler error:', error);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id]); // Re-run when recipe ID changes

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // No need to fetch all meals - alphabet navigation will work on demand

  const jumpToLetter = (letter: string) => {
    // Store the target letter in localStorage so meals page can use it
    localStorage.setItem('jump-to-letter', letter);
    setLocation('/meals');
  };

  const { data: meal, isLoading, error } = useQuery<MealWithDetails>({
    queryKey: ['/api/meals', id],
    queryFn: async () => {
      if (!id) {
        console.warn('No meal ID provided');
        throw new Error('No meal ID provided');
      }
      
      
      try {
        const res = await fetch(`/api/meals/${id}`, { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!res.ok) {
          console.error(`API Error: ${res.status} ${res.statusText} for meal ${id}`);
          if (res.status === 404) {
            throw new Error(`Recipe not found`);
          }
          if (res.status >= 500) {
            throw new Error(`Server error - please try again`);
          }
          throw new Error(`Failed to load recipe (${res.status})`);
        }
        
        const data = await res.json();
        return data;
        
      } catch (fetchError) {
        console.error('Fetch error for meal:', id, fetchError);
        throw fetchError;
      }
    },
    enabled: !!id && id.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404s or client errors
      if (error.message.includes('not found') || error.message.includes('Recipe not found')) {
        return false;
      }
      // Retry network errors and server errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff
  });

  const getGIBadgeClass = (gi: string) => {
    switch (gi) {
      case 'low': return 'gi-low';
      case 'medium': return 'gi-medium';
      default: return 'gi-low';
    }
  };

  const getGIDisplay = () => {
    if (meal?.glycemicValue) {
      return `GI: ${meal.glycemicValue}`;
    }
    return `${meal?.glycemicIndex} GI`;
  };

  const logMeal = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Meal logging will be available soon.",
    });
  };

  // Add error boundary for navigation issues
  if (error) {
    console.error('Meal detail error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Recipe Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The recipe you're looking for could not be loaded.
            </p>
            <Button 
              onClick={() => setLocation('/meals')} 
              className="w-full"
              data-testid="button-back-to-meals"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-muted-foreground">Meal Not Found</h2>
        <p className="text-muted-foreground">Sorry, we couldn't find that recipe.</p>
        <Button onClick={() => setLocation('/meals')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meals
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/meals')}
              className="flex items-center"
              data-testid="button-back-to-meals"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Meals
            </Button>
            <Button 
              onClick={logMeal}
              data-testid="button-log-meal"
            >
              Log This Meal
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Hero Section */}
          <div className="mb-8">
            {meal.imageUrl ? (
              <div className="relative">
                <img 
                  src={buildImageSrc(meal.imageUrl, meal.imageVersion)} 
                  alt={meal.name}
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={`${getGIBadgeClass(meal.glycemicIndex)} text-sm font-medium shadow-sm`}>
                    {getGIDisplay()}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-muted to-muted/60 rounded-lg flex items-center justify-center relative">
                <div className="text-muted-foreground text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-lg">No image available</p>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={`${getGIBadgeClass(meal.glycemicIndex)} text-sm font-medium shadow-sm`}>
                    {getGIDisplay()}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="capitalize">
                  {meal.category}
                </Badge>
                {meal.prepTime && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {meal.prepTime} minutes
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="meal-detail-name">
                {meal.name}
              </h1>
              
              {meal.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {meal.description}
                </p>
              )}
            </div>
          </div>

          {/* CGM Meal Impact Analysis */}
          <div className="mb-8">
            <CGMMealOverlay 
              mealName={meal.name}
              className="max-w-2xl mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Ingredients */}
              {meal.ingredients && meal.ingredients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ChefHat className="w-5 h-5 mr-2" />
                      Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2" data-testid="ingredients-list">
                      {meal.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="capitalize">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              {meal.instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none" data-testid="instructions-text">
                      <p className="whitespace-pre-line">{meal.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Sticky on desktop */}
            <div className="space-y-6 md:sticky md:top-24 md:self-start">
              {/* Nutritional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="nutrition-info">
                  {meal.calories && (
                    <div className="flex justify-between">
                      <span className="font-medium">Calories</span>
                      <span>{meal.calories}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {meal.carbohydrates && (
                    <div className="flex justify-between">
                      <span>Carbohydrates</span>
                      <span>{meal.carbohydrates}g</span>
                    </div>
                  )}
                  
                  {meal.protein && (
                    <div className="flex justify-between">
                      <span>Protein</span>
                      <span>{meal.protein}g</span>
                    </div>
                  )}
                  
                  {meal.fat && (
                    <div className="flex justify-between">
                      <span>Fat</span>
                      <span>{meal.fat}g</span>
                    </div>
                  )}
                  
                  {meal.fiber && (
                    <div className="flex justify-between">
                      <span>Fiber</span>
                      <span>{meal.fiber}g</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={logMeal}
                    data-testid="sidebar-log-meal"
                  >
                    Log This Meal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Adding to favorites will be available soon.",
                      });
                    }}
                    data-testid="sidebar-add-favorite"
                  >
                    Add to Favorites
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Adding to meal plan will be available soon.",
                      });
                    }}
                    data-testid="sidebar-add-meal-plan"
                  >
                    Add to Meal Plan
                  </Button>
                  {showBackToTop && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={scrollToTop}
                      data-testid="sidebar-back-to-top"
                      aria-label="Scroll back to top of page"
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Back to Top
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Alphabet Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Jump to Recipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Click any letter to browse recipes</p>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                      <Button
                        key={letter}
                        variant="outline"
                        size="sm"
                        className="h-8 w-full p-0 text-xs hover:bg-primary hover:text-primary-foreground"
                        onClick={() => jumpToLetter(letter)}
                        data-testid={`recipe-jump-letter-${letter}`}
                      >
                        {letter}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating Back to Top button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-6 right-6 z-50 md:hidden rounded-full w-12 h-12 p-0 shadow-lg"
          onClick={scrollToTop}
          data-testid="floating-back-to-top"
          aria-label="Scroll back to top of page"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}

    </div>
  );
}