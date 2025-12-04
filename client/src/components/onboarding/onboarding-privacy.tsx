import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";

interface OnboardingPrivacyProps {
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OnboardingPrivacy({ onNext, onBack, isLoading }: OnboardingPrivacyProps) {
  return (
    <Card className="w-full" data-testid="onboarding-privacy">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your Data, Your Control</h1>
        <p className="text-muted-foreground">
          Your data is securely stored and never shared. You can delete it anytime in Settings.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Privacy features */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Lock className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <div className="font-medium">Secure Storage</div>
              <div className="text-sm text-muted-foreground">
                Your health data is encrypted and stored securely in compliance with privacy standards.
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Eye className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <div className="font-medium">Never Shared</div>
              <div className="text-sm text-muted-foreground">
                We never sell or share your personal health information with third parties.
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-medium">Full Control</div>
              <div className="text-sm text-muted-foreground">
                Delete your account and all associated data anytime from Settings.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Your privacy matters.</strong> By continuing, you agree to our Terms of Service and Privacy Policy, which outline how we protect your information.
          </p>
        </div>

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
            onClick={onNext}
            className="flex-1"
            disabled={isLoading}
            data-testid="button-continue"
          >
            {isLoading ? 'Completing...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
