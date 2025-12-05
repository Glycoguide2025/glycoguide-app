import { Crown, ExternalLink, LogIn, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ApplePremiumPopupProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function ApplePremiumPopup({ 
  isOpen,
  onClose,
  featureName = "this feature"
}: ApplePremiumPopupProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleLearnMore = () => {
    window.open('https://glycoguide.app', '_blank');
    onClose();
  };

  const handleSignIn = () => {
    setLocation('/auth');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="modal-apple-premium"
    >
      <Card 
        className="max-w-md w-[90%] mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="pt-6 text-center space-y-5">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
            data-testid="button-close-popup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-popup-title">
              Premium Feature
            </h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p data-testid="text-popup-message-1">
                This feature is available to GlycoGuide Premium members.
              </p>
              <p data-testid="text-popup-message-2">
                If you already have a Premium account, please sign in.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500" data-testid="text-popup-message-3">
                To learn more about GlycoGuide, visit our website.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleLearnMore}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
              size="lg"
              data-testid="button-learn-more"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Learn More
            </Button>
            
            <Button 
              onClick={handleSignIn}
              variant="outline"
              className="w-full"
              size="lg"
              data-testid="button-sign-in"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="w-full text-gray-500"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplePremiumPopup;
