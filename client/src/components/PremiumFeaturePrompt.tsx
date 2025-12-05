import { Crown, ExternalLink, LogIn, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PremiumFeaturePromptProps {
  featureName?: string;
  description?: string;
}

export function PremiumFeaturePrompt({ 
  featureName = "this feature",
  description = "This is a premium feature available to our members."
}: PremiumFeaturePromptProps) {
  const [, setLocation] = useLocation();

  const handleLearnMore = () => {
    window.open('https://glycoguide.app', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-2">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-premium-title">
              Premium Feature
            </h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p data-testid="text-premium-message-1">
                This feature is available to GlycoGuide Premium members.
              </p>
              <p data-testid="text-premium-message-2">
                If you already have a Premium account, please sign in.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500" data-testid="text-premium-message-3">
                To learn more about GlycoGuide, visit our website.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleLearnMore}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
              size="lg"
              data-testid="button-learn-more"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Learn More
            </Button>
            
            <Link href="/auth" data-testid="link-sign-in">
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
                data-testid="button-sign-in"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            
            <Link href="/" data-testid="link-home">
              <Button 
                variant="ghost" 
                className="w-full text-gray-500"
                data-testid="button-cancel"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
