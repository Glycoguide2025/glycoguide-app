import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

export default function RecipesPreviewSection() {
  // Fetch specific categories with limits for free preview
  const { data: dinnerData } = useQuery({
    queryKey: ['/api/meals', { category: 'dinner', limit: 10 }],
  });
  
  const { data: lunchData } = useQuery({
    queryKey: ['/api/meals', { category: 'lunch', limit: 5 }],
  });
  
  const { data: soupData } = useQuery({
    queryKey: ['/api/meals', { category: 'soup', limit: 2 }],
  });
  
  const { data: snackData } = useQuery({
    queryKey: ['/api/meals', { category: 'snack', limit: 2 }],
  });
  
  const { data: beverageData } = useQuery({
    queryKey: ['/api/meals', { category: 'beverage', limit: 1 }],
  });

  const isLoading = !dinnerData && !lunchData && !soupData && !snackData && !beverageData;

  // Combine all meals in order
  const meals = [
    ...((dinnerData as any)?.items || []),
    ...((lunchData as any)?.items || []),
    ...((soupData as any)?.items || []),
    ...((snackData as any)?.items || []),
    ...((beverageData as any)?.items || []),
  ];

  return (
    <section id="recipes" className="px-6 py-20 bg-gray-50 dark:bg-gray-900" aria-labelledby="recipes-preview-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="recipes-preview-heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Our Recipe Library – Create a free account to start with 25 recipes.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-3">
            Browse 25 free low-glycemic recipes: 10 Dinners, 5 Lunches, 2 Soups, 2 Snacks, 1 Beverage
          </p>
          <p className="text-base text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            Upgrade to Premium for access to our full collection of 500+ recipes!
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {meals.slice(0, 25).map((meal: any) => (
                <Card key={meal.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg h-48 bg-gray-100 dark:bg-gray-800">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        🍽️
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      GI: {meal.glycemicValue || 'Low'}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {meal.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {meal.category}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-emerald-100 dark:border-gray-700">
              <Sparkles className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Want Access to 500+ Recipes?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Upgrade to Premium for our complete collection of 500+ recipes, meal planning tools, and personalized nutrition guidance!
              </p>
              <a href="#pricing">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full">
                  Upgrade to Premium <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
