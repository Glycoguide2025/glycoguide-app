import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingWelcome } from "./onboarding-welcome";
import { OnboardingRegion } from "./onboarding-region";
import { OnboardingHealthFocus } from "./onboarding-health-focus";
import { OnboardingReminders } from "./onboarding-reminders";
import { OnboardingPrivacy } from "./onboarding-privacy";
import { OnboardingCompleted } from "./onboarding-completed";
import strings from "@/i18n/en.json";
import { trackOnboardingStep, trackFeatureUse } from "@/utils/analytics";

interface OnboardingData {
  region: {
    region: string;
    bloodSugarUnit: string;
  };
  healthFocus: {
    healthFocus: string[];
  };
  reminders: {
    breakfast: string;
    lunch: string;
    dinner: string;
    reflection: string;
    enabled: boolean;
  };
}

export default function OnboardingFlow() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    region: {
      region: 'Other',
      bloodSugarUnit: 'mmol/L'
    },
    healthFocus: {
      healthFocus: []
    },
    reminders: {
      breakfast: '08:00',
      lunch: '12:30', 
      dinner: '18:30',
      reflection: '21:30',
      enabled: true
    }
  });

  // Get user's current onboarding step
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isAuthenticated,
  });

  // Update onboarding step mutation
  const updateOnboardingMutation = useMutation({
    mutationFn: async (stepData: any) => {
      return await apiRequest('PATCH', '/api/user/onboarding', stepData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (finalData: OnboardingData) => {
      return await apiRequest('PATCH', '/api/user/onboarding/complete', {
        ...finalData,
        onboardingCompleted: true,
        onboardingStep: 'completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Setup Complete!",
        description: "Welcome to your personalized wellness journey!"
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Set initial step from user profile
  useEffect(() => {
    if (userProfile && typeof userProfile === 'object' && 'onboardingStep' in userProfile && userProfile.onboardingStep !== 'completed') {
      setCurrentStep(userProfile.onboardingStep as string);
    }
  }, [userProfile]);

  const steps = ['welcome', 'region', 'healthFocus', 'reminders', 'privacy', 'completed'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = async (stepData?: any) => {
    if (stepData) {
      setOnboardingData(prev => ({ ...prev, ...stepData }));
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      const nextStep = steps[nextStepIndex];
      setCurrentStep(nextStep);
      
      // Track onboarding progress
      trackOnboardingStep(nextStepIndex + 1);
      
      // Save progress to server
      await updateOnboardingMutation.mutateAsync({
        onboardingStep: nextStep,
        ...stepData
      });
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex]);
    }
  };

  const handleComplete = async () => {
    // Track onboarding completion
    trackFeatureUse('onboarding_complete', 'complete');
    
    await completeOnboardingMutation.mutateAsync(onboardingData);
    // Redirect handled by parent component
  };

  const handleSkip = () => {
    // Skip onboarding, mark as completed but with minimal data
    completeOnboardingMutation.mutate({
      region: { region: 'Other', bloodSugarUnit: 'mmol/L' },
      healthFocus: { healthFocus: [] },
      reminders: { 
        breakfast: '08:00', lunch: '12:30', dinner: '18:30', 
        reflection: '21:30', enabled: false 
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onNext={() => handleNext()}
            onSkip={handleSkip}
          />
        );
      case 'region':
        return (
          <OnboardingRegion
            onNext={(data) => handleNext({ region: data })}
            onBack={handleBack}
            isLoading={updateOnboardingMutation.isPending}
          />
        );
      case 'healthFocus':
        return (
          <OnboardingHealthFocus
            onNext={(data) => handleNext({ healthFocus: data })}
            onBack={handleBack}
            isLoading={updateOnboardingMutation.isPending}
          />
        );
      case 'reminders':
        return (
          <OnboardingReminders
            data={onboardingData.reminders}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            isLoading={updateOnboardingMutation.isPending}
          />
        );
      case 'privacy':
        return (
          <OnboardingPrivacy
            onNext={handleComplete}
            onBack={handleBack}
            isLoading={completeOnboardingMutation.isPending}
          />
        );
      case 'completed':
        return <OnboardingCompleted />;
      default:
        return <OnboardingWelcome onNext={handleNext} onSkip={handleSkip} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to complete onboarding.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="onboarding-flow">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress bar */}
        {currentStep !== 'completed' && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStepIndex + 1} of {steps.length - 1}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step content */}
        {renderStep()}
      </div>
    </div>
  );
}