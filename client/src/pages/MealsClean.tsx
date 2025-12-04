import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useLocalInfinite, Sentinel } from "@/components/LocalInfinite";
import { buildAlphaIndex, scrollToIndex } from "@/lib/alphaIndex";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useConnectivity } from "@/hooks/useConnectivity";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CategoryPills from "@/components/CategoryPills";
import { Search, X } from "lucide-react";
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

// Categories for CategoryPills component
const categories = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' }, // Changed from 'snack' to 'snacks' to match icons
  { id: 'soups', label: 'Soups' }, // Changed from 'soup' to 'soups' to match icons
  { id: 'desserts', label: 'Desserts' }, // Changed from 'dessert' to 'desserts' to match icons
];

// Meal card component with lazy loading
function CleanMealCard({ meal }: { meal: MealWithDetails }) {
  const [, setLocation] = useLocation();

  const getGIBadgeClass = (gi: string) => {
    switch (gi) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const viewDetails = () => {
    setLocation(`/meals/${meal.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      onClick={viewDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          viewDetails();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${meal.name}`}
      data-recipe={meal.name}
      data-testid={`meal-card-${meal.id}`}
    >
      <div className="relative">
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            loading="lazy"
            decoding="async"
            width={320}
            height={240}
            className="w-full h-auto aspect-[4/3] object-cover bg-gray-100"
            style={{ contentVisibility: "auto", containIntrinsicSize: "240px 320px" }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={`${getGIBadgeClass(meal.glycemicIndex)} text-xs font-medium shadow-sm border`}>
            {meal.glycemicValue ? `GI: ${meal.glycemicValue}` : `${meal.glycemicIndex} GI`}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1" data-testid={`meal-name-${meal.id}`}>
            {meal.name}
          </h3>
          {meal.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {meal.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="capitalize">{meal.category}</span>
          {meal.calories && <span>{meal.calories} cal</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MealsClean() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { simulate, toggleSimulate, online } = useConnectivity();
  
  // Debounce search to 200ms as specified
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Fetch all meals for local processing (no server calls after this)
  const { data: allMeals, isLoading: mealsLoading, error } = useQuery<MealWithDetails[]>({
    queryKey: ['/api/meals', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/meals?limit=10000', { // Large limit to get all meals
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      return data.items || [];
    },
    enabled: true, // Always fetch - backend enforces tier limits
    staleTime: 5 * 60 * 1000, // 5 minutes - meals don't change often
  });

  // Filter meals locally - no server calls
  const filteredMeals = useMemo(() => {
    if (!allMeals) return [];
    
    return allMeals.filter(meal => {
      // Category filter
      if (selectedCategory && meal.category !== selectedCategory) return false;
      
      // Search filter
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const searchable = [
          meal.name,
          meal.description,
          meal.category,
          ...(meal.ingredients || [])
        ].join(' ').toLowerCase();
        
        if (!searchable.includes(query)) return false;
      }
      
      return true;
    });
  }, [allMeals, selectedCategory, debouncedSearchQuery]);

  // Build A-Z index from filtered meals
  const alphaIndex = useMemo(() => {
    return buildAlphaIndex(filteredMeals.map(meal => ({ title: meal.name })));
  }, [filteredMeals]);

  // Local infinite scroll - no server calls
  const { items, hasMore, loadMore } = useLocalInfinite(alphaIndex.sorted.map(item => {
    return filteredMeals.find(meal => meal.name === item.title)!;
  }).filter(Boolean), 48);

  // A-Z navigation handler
  const jumpToLetter = useCallback((letter: string) => {
    // Clear search and category filters when jumping to a letter
    // This ensures we can always find recipes starting with that letter
    setSearchQuery("");
    setSelectedCategory("");
    
    // Wait for the filters to clear and re-render
    setTimeout(() => {
      // Now work with all meals (unfiltered)
      const allMealsIndex = buildAlphaIndex(allMeals?.map(meal => ({ title: meal.name })) || []);
      const targetIndex = allMealsIndex.map[letter];
      
      if (targetIndex === undefined) return;
      
      // Load items until we reach the target index, then scroll
      const loadUntilTarget = () => {
        // Check DOM for current elements
        const elements = document.querySelectorAll('[data-recipe]');
        
        // If target is beyond current elements and we can load more, load more
        if (targetIndex >= elements.length && hasMore) {
          loadMore();
          setTimeout(loadUntilTarget, 100);
          return;
        }
        
        // Scroll to the target element with better positioning
        const actualIndex = Math.min(targetIndex, elements.length - 1);
        const targetElement = elements[actualIndex];
        if (targetElement) {
          // Scroll with some offset to center the first recipe of that letter better
          const elementRect = targetElement.getBoundingClientRect();
          const headerHeight = 160; // Account for sticky header + nav
          const scrollTop = window.pageYOffset + elementRect.top - headerHeight;
          
          window.scrollTo({
            top: scrollTop,
            behavior: "smooth"
          });
        }
      };
      
      loadUntilTarget();
    }, 50); // Small delay to let state update
  }, [allMeals, hasMore, loadMore]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.match(/[a-z]/i)) {
        e.preventDefault();
        jumpToLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jumpToLetter]);

  if (isLoading || mealsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meals...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>{error ? 'Failed to load meals' : 'Please sign in to view meals'}</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div 
        className="container mx-auto px-4 py-6"
        style={{
          paddingBottom: !online ? 'calc(56px + env(safe-area-inset-bottom, 0px))' : undefined
        }}
      >
        {/* Clean Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by ingredient, meal name, or cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 bg-white focus:ring-2 focus:ring-primary/20"
            data-testid="search-input"
            aria-label="Search meals"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
              data-testid="clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Pills with Icons */}
        <CategoryPills
          categories={categories}
          activeId={selectedCategory || null}
          onPick={(id) => setSelectedCategory(id === selectedCategory ? "" : id)}
          large={true}
          showIcons={true}
        />

        {/* A-Z Jump Navigation (Sticky Header Letters) */}
        <nav 
          className="sticky top-0 z-30 bg-white border-y md:bg-white/80 md:backdrop-blur border-gray-200 mb-6"
          aria-label="Alphabetical navigation"
        >
          <div className="flex flex-wrap gap-1 p-3 justify-center">
            {letters.map(letter => {
              const hasRecipes = alphaIndex.map[letter] !== undefined;
              return (
                <Button
                  key={letter}
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-2 text-sm font-medium rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${
                    hasRecipes 
                      ? 'text-primary hover:bg-primary/10 hover:text-primary focus:bg-primary/20' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  onClick={() => hasRecipes && jumpToLetter(letter)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && hasRecipes) {
                      e.preventDefault();
                      jumpToLetter(letter);
                    }
                  }}
                  disabled={!hasRecipes}
                  tabIndex={hasRecipes ? 0 : -1}
                  data-testid={`letter-${letter}`}
                  aria-label={`Jump to recipes starting with ${letter}${hasRecipes ? '' : ' - no recipes available'}`}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredMeals.length} recipes {selectedCategory && `in ${selectedCategory}`}
            {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
          </p>
          
          {/* Simple Test Offline Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSimulate}
            className="ml-4 text-xs bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
            data-testid="button-test-offline-toggle"
            aria-pressed={simulate}
          >
            {simulate ? "✅ Test Offline ON" : "📱 Test Offline"}
          </Button>
        </div>

        {/* Meals Grid with Local Infinite Scroll */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {items.map((meal) => (
            <CleanMealCard key={meal.id} meal={meal} />
          ))}
        </div>

        {/* Infinite Scroll Sentinel */}
        {hasMore && <Sentinel onHit={loadMore} />}

        {/* Empty State */}
        {filteredMeals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No meals found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or category filter
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              data-testid="clear-filters"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}