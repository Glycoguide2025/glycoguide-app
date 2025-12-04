import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user has completed onboarding
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user
  });

  useEffect(() => {
    // If user has completed onboarding, redirect to home
    if (userProfile && (userProfile as any).onboardingCompleted) {
      setLocation('/');
    }
  }, [userProfile, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingFlow />
    </div>
  );
}