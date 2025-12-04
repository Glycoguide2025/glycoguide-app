import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Heart, Flame, Moon } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import WearablesSparkline from "./WearablesSparkline";
import WearablesImport from "./WearablesImport";

export default function WearablesSummary() {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const entitlements = useEntitlements();
  const { isAuthenticated } = useAuth();
  const { open: openUpgradeModal } = useUpgradeModal();
  
  // Use entitlements system for cleaner plan checking
  const hasProPlusAccess = !entitlements.isLoading && isAuthenticated && entitlements.data?.pro;
  const isProPlan = entitlements.data?.pro;
  
  


  // Fetch wearables summary data
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['/api/wearables/summary'],
    queryFn: async () => {
      if (!hasProPlusAccess) return null;
      
      const res = await fetch('/api/wearables/summary?range=7d', { credentials: 'include' });
      if (res.status === 402) {
        return null; // Pro+ required
      }
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data.summary : null;
    },
    enabled: Boolean(hasProPlusAccess),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const summary = summaryData || {
    totalSteps: 0,
    averageHeartRate: null,
    totalCalories: 0,
    totalSleepHours: 0
  };

  // Show loading state while entitlements are loading
  if (entitlements.isLoading) {
    return (
      <Card data-testid="wearables-summary-loading">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Wearable Data Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading your plan details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasProPlusAccess) {
    // Determine the right CTA based on auth status and plan
    const needsAuth = !isAuthenticated && entitlements.data?.pro;
    const needsUpgrade = !entitlements.data?.pro;
    
    return (
      <Card data-testid={needsAuth ? "wearables-summary-signin" : "wearables-summary-upgrade"}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Wearable Data Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-medium mb-2">Track Your Activity Data</h3>
            <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Import data from Fitbit, Apple Health, Google Fit and more to see comprehensive wellness insights
            </p>
            {needsAuth ? (
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full"
                data-testid="button-signin-wearables-summary"
              >
                Sign In to Access Your Pro Features
              </Button>
            ) : (
              <Button 
                onClick={() => openUpgradeModal("premium")}
                className="w-full"
                data-testid="button-upgrade-wearables-summary"
              >
                Upgrade to Premium for Wearable Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center py-4" data-testid="wearables-summary">
      <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Import data from Fitbit, Apple Health, Google Fit and more
      </p>
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => setImportModalOpen(true)}
          data-testid="button-import-wearables-data"
        >
          Import Data
        </Button>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Wearable Data</DialogTitle>
          </DialogHeader>
          <WearablesImport />
        </DialogContent>
      </Dialog>
    </div>
  );
}