import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Sun, Moon, Apple, Soup, Cookie, Pizza, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealCategoriesProps {
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
}

const categories = [
  { id: 'breakfast', name: 'Breakfast', icon: Coffee, color: 'text-primary', count: 134 },
  { id: 'lunch', name: 'Lunch', icon: Sun, color: 'text-warning', count: 128 },
  { id: 'dinner', name: 'Dinner', icon: Moon, color: 'text-accent', count: 164 },
  { id: 'snack', name: 'Snacks', icon: Apple, color: 'text-success', count: 95 },
  { id: 'soup', name: 'Soups', icon: Soup, color: 'text-info', count: 11 },
  { id: 'dessert', name: 'Desserts', icon: Cookie, color: 'text-secondary', count: 26 },
  { id: 'pizza', name: 'Pizza', icon: Pizza, color: 'text-red-600', count: 14 },
  { id: 'beverage', name: 'Beverages', icon: GlassWater, color: 'text-blue-600', count: 8 },
];

export default function MealCategories({ onCategorySelect, selectedCategory }: MealCategoriesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="meal-categories">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <Card 
            key={category.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-secondary/50"
            )}
            onClick={() => onCategorySelect(isSelected ? '' : category.id)}
            data-testid={`category-${category.id}`}
          >
            <CardContent className="p-6 text-center">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors",
                isSelected ? "bg-primary/20" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-colors",
                  isSelected ? "text-primary" : category.color
                )} />
              </div>
              <h3 className="font-medium mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.count} meals
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
