import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Check, Star, Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import strings from "@/i18n/en.json";
import { trackUpgradeClick } from "@/utils/analytics";
import { useAuth } from "@/hooks/useAuth";
import { useBillingStatus } from "@/hooks/useBilling";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  reason?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, reason }: UpgradeModalProps) {
  const [, setLocation] = useLocation();
  const billing = strings.billing;
  const { user } = useAuth();
  const { data: billingStatus } = useBillingStatus();
  
  const handleViewPlans = () => {
    // Track upgrade click event
    if (user) {
      const userId = (user as any)?.sub || 'anonymous';
      const currentPlan = billingStatus?.plan || 'free';
      const context = feature ? `modal_${feature.toLowerCase().replace(/\s+/g, '_')}` : 'upgrade_modal';
      trackUpgradeClick(userId, currentPlan, context);
    }
    
    onClose();
    setLocation("/subscribe");
  };

  const plans = [
    {
      id: 'premium',
      name: billing.plans.premium,
      price: '$9',
      period: '/month',
      icon: <Star className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        billing.features.unlimited,
        billing.features.insights,
        billing.features.exports,
        "Premium wellness content",
        "Community participation"
      ]
    },
    {
      id: 'pro',
      name: billing.plans.pro,
      price: '$19',
      period: '/month',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        "Everything in Premium",
        billing.features.coaching,
        "Custom meal planning",
        "Priority support",
        "Group coaching calls"
      ],
      popular: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="upgrade-modal">
        <DialogHeader>
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl">{billing.upgrade.title}</DialogTitle>
            <DialogDescription className="text-lg mt-2">
              {billing.upgrade.subtitle}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Feature-specific message */}
        {(feature && reason) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">
              {billing.upgrade.title}
            </h3>
            <p className="text-amber-700 text-sm">
              {reason}
            </p>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.borderColor} ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-12 h-12 ${plan.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <div className={plan.color}>{plan.icon}</div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={handleViewPlans}
                  data-testid={`button-upgrade-${plan.id}`}
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current plan info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Currently on {billing.plans.free}</h3>
          <p className="text-sm text-muted-foreground">
            You have access to basic wellness tracking. Upgrade to unlock unlimited features and advanced insights.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            data-testid="button-maybe-later"
          >
            {billing.upgrade.close}
          </Button>
          <Button 
            onClick={handleViewPlans}
            className="flex-1"
            data-testid="button-view-all-plans"
          >
            {billing.upgrade.viewPlans}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}