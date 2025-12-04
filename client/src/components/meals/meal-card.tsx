import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { buildImageSrc } from "@/lib/image-utils";
import type { MealWithDetails } from "@/types";

interface MealCardProps {
  meal: MealWithDetails;
  onMealView?: () => void;
}

export default function MealCard({ meal, onMealView }: MealCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const getGIBadgeClass = (gi: string) => {
    switch (gi) {
      case 'low': return 'gi-low';
      case 'medium': return 'gi-medium';
      case 'high': return 'gi-low';
      default: return 'gi-low';
    }
  };

  const getGIDisplay = () => {
    if (meal.glycemicValue) {
      return `GI: ${meal.glycemicValue}`;
    }
    return `${meal.glycemicIndex} GI`;
  };

  const logMeal = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Meal logging from cards will be available soon.",
    });
  };

  const viewDetails = () => {
    // Save the browsing position before navigating
    onMealView?.();
    setLocation(`/meals/${meal.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" data-testid={`meal-card-${meal.id}`}>
      <div className="relative" onClick={viewDetails}>
        {meal.imageUrl ? (
          <img 
            src={buildImageSrc(meal.imageUrl, meal.imageVersion)}
            alt={meal.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            decoding="async"
            width="384"
            height="192"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={`${getGIBadgeClass(meal.glycemicIndex)} text-xs font-medium shadow-sm`}>
            {getGIDisplay()}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1" data-testid={`meal-name-${meal.id}`}>
            {meal.name}
          </h3>
          {meal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {meal.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-3">
            <span className="capitalize font-medium text-foreground">
              {meal.category}
            </span>
            <span>{meal.carbohydrates || '0'}g carbs</span>
            {meal.prepTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {meal.prepTime}m
              </span>
            )}
          </div>
        </div>

        {meal.calories && (
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">Calories:</span>
            <span className="font-medium">{meal.calories}</span>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              logMeal();
            }}
            data-testid={`button-log-${meal.id}`}
          >
            Log Meal
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "Feature Coming Soon",
                description: "Meal favorites will be available soon.",
              });
            }}
            data-testid={`button-favorite-${meal.id}`}
          >
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
