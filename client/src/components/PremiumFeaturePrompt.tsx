import { Lock, Crown, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PremiumFeaturePromptProps {
  featureName?: string;
  description?: string;
}

export function PremiumFeaturePrompt({ 
  featureName = "this feature",
  description = "This is a premium feature available to our subscribers."
}: PremiumFeaturePromptProps) {
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Premium Feature
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Please upgrade to access {featureName}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/subscribe" data-testid="link-upgrade">
              <Button 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                size="lg"
                data-testid="button-upgrade-now"
              >
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/" data-testid="link-home">
              <Button 
                variant="ghost" 
                className="w-full"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
