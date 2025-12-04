import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Download, BarChart3 } from "lucide-react";
import { useCheckout, useConfirmSubscription, useProducts } from "@/hooks/useBilling";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan?: string;
  feature?: string;
}

export function UpgradeModal({ isOpen, onClose, requiredPlan, feature }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(requiredPlan || 'premium');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  
  const checkout = useCheckout();
  const confirmSubscription = useConfirmSubscription();
  const { data: productsData } = useProducts();

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      tagline: 'Enhanced diabetes management',
      price: billingInterval === 'monthly' ? '$19.99/month' : '$199.99/year',
      savings: billingInterval === 'yearly' ? 'Save $40/year' : null,
      features: [
        'CSV data exports',
        'Advanced insights & trends',
        '14-day data range',
        'PDF meal reports',
        'Priority support'
      ],
      highlighted: requiredPlan === 'premium'
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Zap,
      tagline: 'Complete wellness platform',
      price: billingInterval === 'monthly' ? '$15.00/month' : '$150.00/year',
      savings: billingInterval === 'yearly' ? 'Save $30/year' : null,
      features: [
        'Everything in Premium',
        'Advanced meal planning',
        '30-day data range',
        'Advanced PDF reports',
        'Community access',
        'Expert consultations'
      ],
      highlighted: requiredPlan === 'pro'
    }
  ];

  const handleUpgrade = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    try {
      const { url } = await checkout.mutateAsync({
        tier: plan.id
      });
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {feature ? `Upgrade Required for ${feature}` : 'Unlock Premium Features'}
          </DialogTitle>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Choose a plan that fits your wellness journey
          </p>
        </DialogHeader>

        {feature && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 dark:text-blue-200">
                <strong>{feature}</strong> requires a {requiredPlan} plan or higher to access advanced diabetes management features.
              </p>
            </div>
          </div>
        )}

        {/* Billing interval toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isHighlighted = plan.highlighted;

            return (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : isHighlighted
                    ? 'ring-2 ring-orange-400 border-orange-400'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center items-center space-x-2">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {isHighlighted && (
                      <Badge variant="destructive">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{plan.tagline}</p>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">{plan.price}</p>
                    {plan.savings && (
                      <p className="text-green-600 text-sm font-medium">{plan.savings}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={checkout.isPending || confirmSubscription.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {checkout.isPending || confirmSubscription.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}`
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Secure checkout powered by Stripe. Cancel anytime from your profile settings.
        </p>
      </DialogContent>
    </Dialog>
  );
}