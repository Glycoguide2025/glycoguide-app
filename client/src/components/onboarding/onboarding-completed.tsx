import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import strings from "@/i18n/en.json";

export function OnboardingCompleted() {
  const [, setLocation] = useLocation();
  const completed = strings.onboarding.completed;

  const handleGoToDashboard = () => {
    setLocation("/");
  };

  const handleExploreFeatures = () => {
    setLocation("/recipes");
  };

  return (
    <Card className="w-full" data-testid="onboarding-completed">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{completed.title}</h1>
        <p className="text-lg text-muted-foreground">{completed.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-center text-muted-foreground">
          {completed.description}
        </p>

        {/* Success animation or celebration */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-green-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Setup Complete!</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Next steps */}
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Your goals are set</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              We'll provide recommendations based on your preferences
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Smart suggestions ready</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Your dashboard now shows personalized meal recommendations
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline"
            onClick={handleExploreFeatures}
            className="flex-1"
            data-testid="button-explore-features"
          >
            {completed.exploreFeatures}
          </Button>
          <Button 
            onClick={handleGoToDashboard}
            className="flex-1"
            data-testid="button-go-dashboard"
          >
            {completed.goToDashboard}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}