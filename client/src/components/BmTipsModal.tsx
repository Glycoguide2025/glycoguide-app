import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface BmTip {
  text: string;
  category?: 'nutrition' | 'lifestyle' | 'natural' | 'general';
}

interface BmTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome?: 'success' | 'tips_ease' | 'tips_daily' | 'general';
  tips?: string[];
  title?: string;
}

const BM_TIP_CATEGORIES = {
  nutrition: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    title: "🥬 Nutrition Strategies",
    tips: [
      "Increase fiber gradually: Aim for 25-35g daily from whole foods",
      "Stay hydrated: Water helps fiber work effectively", 
      "Include probiotic foods: Yogurt, kefir, sauerkraut, kimchi",
      "Add healthy fats: Olive oil, avocados, nuts help lubricate",
      "Consider magnesium-rich foods: Leafy greens, nuts, seeds"
    ]
  },
  lifestyle: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    title: "🚶‍♀️ Lifestyle Support", 
    tips: [
      "Regular physical activity: Even 10-15 minutes of walking helps",
      "Establish a routine: Try to go at the same time each day",
      "Don't delay: When you feel the urge, respond promptly",
      "Proper positioning: Feet flat on floor (or footstool), lean slightly forward",
      "Manage stress: Chronic stress disrupts digestion"
    ]
  },
  natural: {
    icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
    title: "🌱 Gentle Natural Aids",
    tips: [
      "Warm water with lemon: First thing in the morning",
      "Prunes or prune juice: Natural sorbitol content helps",
      "Psyllium husk: Gentle bulk-forming fiber",
      "Herbal teas: Ginger, peppermint, or fennel"
    ]
  }
};

export function BmTipsModal({ isOpen, onClose, outcome = 'general', tips, title }: BmTipsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstTipRef = useRef<HTMLLIElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getModalContent = () => {
    if (tips && tips.length > 0) {
      // Custom tips provided
      return {
        title: title || "Digestive Wellness Tips",
        icon: <Info className="w-5 h-5 text-blue-600" />,
        content: tips
      };
    }

    // Default content based on outcome
    switch (outcome) {
      case 'success':
        return {
          title: "Great Job! Keep It Up",
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          content: [
            "Regular, comfortable bowel movements indicate good digestive health.",
            "Continue eating fiber-rich foods to maintain healthy digestion.", 
            "Stay consistent with your current diet and hydration habits.",
            "Keep tracking your progress - consistency is key!"
          ]
        };
      
      case 'tips_ease':
        return {
          title: "Tips for Greater Comfort",
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          content: [
            "Drink water steadily through the day.",
            "Add fiber-rich foods like fruit, veggies, whole grains, or flaxseed.",
            "Take a short walk or do light stretching after meals.",
            "Try a warm drink in the morning, like herbal tea or warm water with lemon.",
            "Give yourself time and relax — don't rush."
          ]
        };
      
      case 'tips_daily':
        return {
          title: "Daily Habits for Regularity",
          icon: <Info className="w-5 h-5 text-blue-600" />,
          content: [
            "Sip water regularly — keep a bottle nearby.",
            "Balance your plate with fiber, protein, and healthy fats.", 
            "Create a daily routine — try going at the same time each day.",
            "Move your body; even 10–15 minute walks help.",
            "Respond to the urge; don't hold it in."
          ]
        };
      
      default:
        return {
          title: "Comprehensive BM Wellness Guide",
          icon: <Info className="w-5 h-5 text-blue-600" />,
          content: Object.values(BM_TIP_CATEGORIES)
        };
    }
  };

  const modalContent = getModalContent();

  const renderTips = () => {
    if (Array.isArray(modalContent.content) && typeof modalContent.content[0] === 'string') {
      // Simple string array
      return (
        <ul className="space-y-3" role="list">
          {(modalContent.content as string[]).map((tip, index) => (
            <li 
              key={index}
              ref={index === 0 ? firstTipRef : undefined}
              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
              role="listitem"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      // Category-based tips
      return (
        <div className="space-y-6">
          {Object.values(BM_TIP_CATEGORIES).map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                {category.icon}
                <h3>{category.title}</h3>
              </div>
              <ul className="space-y-2 ml-7" role="list">
                {category.tips.map((tip, tipIndex) => (
                  <li 
                    key={tipIndex}
                    ref={categoryIndex === 0 && tipIndex === 0 ? firstTipRef : undefined}
                    className="flex items-start gap-2 text-sm text-gray-600"
                    role="listitem"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-hidden"
        aria-describedby="bm-tips-description"
      >
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <div className="flex items-center gap-2">
            {modalContent.icon}
            <DialogTitle className="text-lg font-semibold">
              {modalContent.title}
            </DialogTitle>
          </div>
          <Button 
            ref={closeButtonRef}
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            aria-label="Close tips modal"
            data-testid="button-close-bm-tips"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div id="bm-tips-description" className="sr-only">
          Bowel movement health tips and guidance for better digestive wellness
        </div>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {renderTips()}
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Remember:</strong> These are general wellness tips. Always consult with your healthcare provider 
                about digestive concerns, especially if you have diabetes or other chronic conditions.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={onClose}
            variant="default"
            data-testid="button-close-tips"
          >
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BmTipsModal;