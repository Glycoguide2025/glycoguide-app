import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Droplet, Dumbbell, Heart, Moon, Smile, Circle } from "lucide-react";
import { useState } from "react";

interface OnboardingHealthFocusProps {
  onNext: (data: { healthFocus: string[] }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OnboardingHealthFocus({ onNext, onBack, isLoading }: OnboardingHealthFocusProps) {
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  const handleToggle = (focus: string) => {
    setSelectedFocus(prev =>
      prev.includes(focus)
        ? prev.filter(f => f !== focus)
        : [...prev, focus]
    );
  };

  const handleNext = () => {
    onNext({ healthFocus: selectedFocus });
  };

  const healthOptions = [
    { value: 'blood_pressure', label: 'Blood Pressure', icon: Heart, color: 'text-red-500' },
    { value: 'blood_sugar', label: 'Blood Sugar', icon: Droplet, color: 'text-blue-500' },
    { value: 'hydration', label: 'Hydration', icon: Droplet, color: 'text-cyan-500' },
    { value: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-orange-500' },
    { value: 'sleep', label: 'Sleep', icon: Moon, color: 'text-purple-500' },
    { value: 'mood', label: 'Mood', icon: Smile, color: 'text-yellow-500' },
    { value: 'bowel_movements', label: 'Bowel Movements', icon: Circle, color: 'text-amber-600' }
  ];

  return (
    <Card className="w-full" data-testid="onboarding-health-focus">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Choose Your Health Focus</h1>
        <p className="text-muted-foreground">
          Tell us what's most important to you right now. GlycoGuide will prioritize those areas in your dashboard.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedFocus.includes(option.value);
            
            return (
              <button
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                data-testid={`button-focus-${option.value}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-green-500' : option.color}`} />
                  <span className="font-medium text-foreground">{option.label}</span>
                  {isSelected && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          You can edit these anytime in Settings.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1"
            disabled={isLoading}
            data-testid="button-continue"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
