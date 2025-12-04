import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Target } from "lucide-react";
import strings from "@/i18n/en.json";

interface OnboardingGoalsProps {
  data: {
    carbTarget: number;
    primaryGoal: string;
  };
  onNext: (data: { goals: { carbTarget: number; primaryGoal: string } }) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function OnboardingGoals({ data, onNext, onBack, isLoading }: OnboardingGoalsProps) {
  const [carbTarget, setCarbTarget] = useState(data.carbTarget);
  const [primaryGoal, setPrimaryGoal] = useState(data.primaryGoal);
  const goals = strings.onboarding.goals;

  const handleNext = () => {
    onNext({
      goals: {
        carbTarget,
        primaryGoal
      }
    });
  };

  return (
    <Card className="w-full" data-testid="onboarding-goals">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">{goals.title}</CardTitle>
        <p className="text-muted-foreground">{goals.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Carb target */}
        <div className="space-y-2">
          <Label htmlFor="carb-target" className="text-sm font-medium">
            {goals.carbTarget}
          </Label>
          <Input
            id="carb-target"
            type="number"
            value={carbTarget}
            onChange={(e) => setCarbTarget(parseInt(e.target.value) || 0)}
            placeholder="180"
            min="50"
            max="500"
            data-testid="input-carb-target"
          />
          <p className="text-xs text-muted-foreground">
            {goals.carbTargetHelper}
          </p>
        </div>

        {/* Primary goal */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {goals.primary}
          </Label>
          <RadioGroup 
            value={primaryGoal} 
            onValueChange={setPrimaryGoal}
            className="space-y-2"
          >
            {Object.entries(goals.primaryOptions).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={key} 
                  id={key}
                  data-testid={`radio-goal-${key}`}
                />
                <Label htmlFor={key} className="flex-1 cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            data-testid="button-back-goals"
          >
            {goals.back}
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isLoading || carbTarget < 50}
            className="flex-1"
            data-testid="button-continue-goals"
          >
            {isLoading ? "Saving..." : goals.continue}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}