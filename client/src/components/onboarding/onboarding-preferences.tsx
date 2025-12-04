import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Utensils } from "lucide-react";
import strings from "@/i18n/en.json";

interface OnboardingPreferencesProps {
  data: {
    dietary: string[];
    dislikes: string;
  };
  onNext: (data: { preferences: { dietary: string[]; dislikes: string } }) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function OnboardingPreferences({ data, onNext, onBack, isLoading }: OnboardingPreferencesProps) {
  const [dietary, setDietary] = useState(data.dietary);
  const [dislikes, setDislikes] = useState(data.dislikes);
  const preferences = strings.onboarding.preferences;

  const handleDietaryChange = (option: string, checked: boolean) => {
    if (checked) {
      setDietary(prev => [...prev, option]);
    } else {
      setDietary(prev => prev.filter(item => item !== option));
    }
  };

  const handleNext = () => {
    onNext({
      preferences: {
        dietary,
        dislikes
      }
    });
  };

  return (
    <Card className="w-full" data-testid="onboarding-preferences">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Utensils className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-xl">{preferences.title}</CardTitle>
        <p className="text-muted-foreground">{preferences.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dietary preferences */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {preferences.dietary}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(preferences.dietaryOptions).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={dietary.includes(key)}
                  onCheckedChange={(checked) => handleDietaryChange(key, checked as boolean)}
                  data-testid={`checkbox-dietary-${key}`}
                />
                <Label htmlFor={key} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Food dislikes */}
        <div className="space-y-2">
          <Label htmlFor="dislikes" className="text-sm font-medium">
            {preferences.dislikes}
          </Label>
          <Input
            id="dislikes"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            placeholder={preferences.dislikesPlaceholder}
            data-testid="input-dislikes"
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            data-testid="button-back-preferences"
          >
            {preferences.back}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1"
            data-testid="button-continue-preferences"
          >
            {isLoading ? "Saving..." : preferences.continue}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}