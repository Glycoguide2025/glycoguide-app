import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Clock } from "lucide-react";
import strings from "@/i18n/en.json";

interface OnboardingWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingWelcome({ onNext, onSkip }: OnboardingWelcomeProps) {
  const welcome = strings.onboarding.welcome;

  return (
    <Card className="w-full" data-testid="onboarding-welcome">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{welcome.title}</h1>
        <p className="text-lg text-muted-foreground">{welcome.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-center text-muted-foreground">
          {welcome.description}
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium">Personalized Goals</div>
              <div className="text-sm text-muted-foreground">Set targets that work for your lifestyle</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Heart className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-medium">Food Preferences</div>
              <div className="text-sm text-muted-foreground">Get recommendations you'll actually enjoy</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium">Gentle Reminders</div>
              <div className="text-sm text-muted-foreground">Stay on track with helpful nudges</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="flex-1"
            data-testid="button-skip-onboarding"
          >
            {welcome.skip}
          </Button>
          <Button 
            onClick={onNext}
            className="flex-1"
            data-testid="button-start-onboarding"
          >
            {welcome.getStarted}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}