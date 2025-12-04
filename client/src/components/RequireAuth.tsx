import { ComponentType } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PremiumFeaturePrompt } from "./PremiumFeaturePrompt";

interface RequireAuthProps {
  Component: ComponentType;
  featureName: string;
  description?: string;
}

export function RequireAuth({ Component, featureName, description }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if not authenticated
  if (!isAuthenticated) {
    return <PremiumFeaturePrompt featureName={featureName} description={description} />;
  }

  // Render the actual component if authenticated
  return <Component />;
}
