import { useState, useEffect } from "react";
import { Target, Bell, Heart, Shield, Download, Trash2, Edit, FileText, Crown, Lock, Settings, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { downloadCsv } from "@/lib/download";
import { useBillingStatus, useConfirmSubscription, entitlements, isUpgradeRequiredError } from "@/hooks/useBilling";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import CGMImport from "@/components/CGMImport";
import { PrivacyManager, PRIVACY_COPY, type PrivacySettings } from "@/utils/privacy";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

// Sample user data for Step 1
const USER_DATA = {
  dailyCarbTarget: 180,
  reminderTimes: {
    breakfast: "8:00 AM",
    lunch: "12:30 PM", 
    dinner: "6:30 PM",
    reflection: "8:00 PM"
  },
  dietaryPrefs: ["vegetarian"],
  dislikedIngredients: ["mushrooms", "seafood"]
};

export default function Profile() {
  const [carbTarget, setCarbTarget] = useState(USER_DATA.dailyCarbTarget);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, requiredPlan: '', feature: '' });
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(PrivacyManager.getDefaultSettings());

  // Get billing status - CRITICAL: Check loading state to prevent false "upgrade" prompts
  const { data: billingStatus, isLoading: billingLoading } = useBillingStatus();
  const userPlan = billingStatus?.plan || 'free';
  const permissions = entitlements(userPlan);
  const confirmSubscription = useConfirmSubscription();

  // Load privacy settings on component mount
  useEffect(() => {
    setPrivacySettings(PrivacyManager.getSettings());
  }, []);

  // Handle Stripe checkout return - CRITICAL FIX
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && !confirmSubscription.isPending && !confirmSubscription.isSuccess) {
      console.log('[PROFILE] Confirming Stripe session:', sessionId);
      confirmSubscription.mutate({ sessionId }, {
        onSuccess: (data) => {
          console.log('[PROFILE] Subscription confirmed:', data);
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
          // Show success message
          alert(`Successfully upgraded to ${data.plan}!`);
        },
        onError: (error) => {
          console.error('[PROFILE] Confirmation failed:', error);
          alert('Subscription confirmation failed. Please contact support.');
        }
      });
    }
  }, [confirmSubscription]);

  const handleSaveTarget = () => {
    console.log("Saving carb target:", carbTarget);
    setIsEditingTarget(false);
    // TODO: Step 2 will implement actual saving
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      await downloadCsv(); // Downloads with proper headers: date,time,type,recipe_title,carbs_g,fiber_g,calories_kcal,notes,value,context,linked_meal_title
    } catch (error: any) {
      if (isUpgradeRequiredError(error) || error.message === "UPGRADE_REQUIRED") {
        setUpgradeModal({ open: true, requiredPlan: 'pro', feature: 'CSV Export' });
      } else {
        alert(error.message ?? "CSV export failed");
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      // TODO: Implement PDF export API call
      const res = await fetch('/export/pdf', { credentials: 'include' });
      if (res.status === 402) {
        setUpgradeModal({ open: true, requiredPlan: 'premium', feature: 'PDF Reports' });
        return;
      }
      if (!res.ok) throw new Error('PDF export failed');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GlycoGuide_Report_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      if (isUpgradeRequiredError(error) || error.message === "UPGRADE_REQUIRED") {
        setUpgradeModal({ open: true, requiredPlan: 'premium', feature: 'PDF Reports' });
      } else {
        alert(error.message ?? "PDF export failed");
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    console.log("Delete account request - placeholder for Step 2");
    // TODO: Step 2 will implement account deletion
  };

  const handlePrivacySettingChange = (setting: keyof PrivacySettings, value: boolean) => {
    const updated = PrivacyManager.updateSettings({ [setting]: value });
    setPrivacySettings(updated);
  };

  // Show loading screen while billing status loads to prevent false "upgrade" prompts
  if (billingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Your Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Customize your wellness journey
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link href="/settings" data-testid="link-settings">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription Status Card - Prominent */}
        <Card data-testid="card-subscription" className="border-2 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-emerald-600" />
                Your Subscription
              </div>
              <Badge 
                variant={userPlan === 'free' ? 'secondary' : 'default'} 
                className={userPlan !== 'free' ? 'bg-emerald-600' : ''}
              >
                {userPlan === 'free' ? 'Starter (Free)' : 
                 userPlan === 'pro' ? 'Care Plan' : 
                 'Premium Care'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userPlan === 'free' ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unlock full access to 500+ low-GI recipes, wellness tracking, and personalized health coaching.
                  </p>
                  <Button 
                    onClick={() => setUpgradeModal({ open: true, requiredPlan: 'premium', feature: 'Premium Features' })}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-testid="button-upgrade"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You're subscribed to {userPlan === 'pro' ? 'Care Plan' : 'Premium Care'}. Manage your subscription below.
                  </p>
                  <Button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/billing/portal', {
                          method: 'POST',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        });
                        console.log('[PORTAL DEBUG] Response status:', res.status);
                        const data = await res.json();
                        console.log('[PORTAL DEBUG] Response data:', data);
                        if (data.url) {
                          window.open(data.url, '_blank', 'noopener,noreferrer');
                        } else {
                          console.error('[PORTAL DEBUG] No URL in response:', data);
                          alert('Unable to open subscription management. Please try again.');
                        }
                      } catch (error) {
                        console.error('[PORTAL DEBUG] Failed to open customer portal:', error);
                        alert('Unable to open subscription management. Please try again.');
                      }
                    }}
                    variant="outline" 
                    className="w-full"
                    data-testid="button-manage-subscription"
                  >
                    Manage Subscription
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Carb Target */}
        <Card data-testid="card-carb-target">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Daily Carb Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {isEditingTarget ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={carbTarget}
                      onChange={(e) => setCarbTarget(Number(e.target.value))}
                      className="w-20"
                      data-testid="input-carb-target"
                    />
                    <span className="text-gray-600 dark:text-gray-400">grams</span>
                    <Button size="sm" onClick={handleSaveTarget} data-testid="button-save-target">
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsEditingTarget(false)}
                      data-testid="button-cancel-target"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{carbTarget}g</span>
                    <span className="text-gray-600 dark:text-gray-400">per day</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsEditingTarget(true)}
                      data-testid="button-edit-target"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Default is 180g - adjust based on your personal wellness goals
            </p>
          </CardContent>
        </Card>

        {/* Reminder Times */}
        <Card data-testid="card-reminders">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-green-600" />
              Daily Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(USER_DATA.reminderTimes).map(([meal, time]) => (
                <div key={meal} className="flex items-center justify-between">
                  <Label className="capitalize">{meal}</Label>
                  <Badge variant="secondary" data-testid={`reminder-${meal}`}>
                    {time}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              data-testid="button-edit-reminders"
            >
              Edit Times
            </Button>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card data-testid="card-dietary-prefs">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-purple-600" />
              Dietary Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Dietary Style</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {USER_DATA.dietaryPrefs.map((pref) => (
                    <Badge key={pref} variant="secondary" data-testid={`pref-${pref}`}>
                      {pref}
                    </Badge>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline"
                    data-testid="button-edit-dietary"
                  >
                    Edit
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Disliked Ingredients</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {USER_DATA.dislikedIngredients.map((ingredient) => (
                    <Badge 
                      key={ingredient} 
                      variant="destructive"
                      data-testid={`disliked-${ingredient}`}
                    >
                      {ingredient}
                    </Badge>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline"
                    data-testid="button-edit-dislikes"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Data Management */}
        <Card data-testid="card-data-management">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Data Management
              <Badge variant="outline" className="text-xs">
                Current Plan: {userPlan}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* CSV Export - Pro+ Required */}
              <div className="relative">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={permissions.csv ? handleExportData : () => setUpgradeModal({ open: true, requiredPlan: 'pro', feature: 'CSV Export' })}
                  disabled={exportLoading}
                  className={`w-full justify-start ${!permissions.csv ? 'opacity-60' : ''}`}
                  data-testid="button-export-data"
                >
                  {!permissions.csv && <Lock className="h-4 w-4 mr-2" />}
                  {permissions.csv && <Download className="h-4 w-4 mr-2" />}
                  {exportLoading ? "Preparing…" : "Export My Data (CSV)"}
                  {!permissions.csv && (
                    <Badge variant="secondary" className="ml-auto">
                      Pro+
                    </Badge>
                  )}
                </Button>
                {!permissions.csv && (
                  <p className="text-xs text-gray-500 mt-1">
                    Upgrade to Pro to export your diabetes data in CSV format
                  </p>
                )}
              </div>

              {/* PDF Export - Premium+ Required */}
              <div className="relative">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={permissions.pdf ? handleExportPdf : () => setUpgradeModal({ open: true, requiredPlan: 'premium', feature: 'PDF Reports' })}
                  disabled={pdfLoading}
                  className={`w-full justify-start ${!permissions.pdf ? 'opacity-60' : ''}`}
                  data-testid="button-export-pdf"
                >
                  {!permissions.pdf && <Lock className="h-4 w-4 mr-2" />}
                  {permissions.pdf && <FileText className="h-4 w-4 mr-2" />}
                  {pdfLoading ? "Generating…" : "Export Health Report (PDF)"}
                  {!permissions.pdf && (
                    <Badge variant="secondary" className="ml-auto">
                      Premium+
                    </Badge>
                  )}
                </Button>
                {!permissions.pdf && (
                  <p className="text-xs text-gray-500 mt-1">
                    Upgrade to Premium for comprehensive PDF health reports
                  </p>
                )}
              </div>
              
              {/* CGM Import */}
              <div className="mt-4">
                <CGMImport />
              </div>
              
              {/* Give Feedback Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setFeedbackModalOpen(true)}
                className="w-full justify-start"
                data-testid="button-give-feedback"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data Settings */}
        <Card data-testid="card-privacy-settings">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Privacy & Data Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {PRIVACY_COPY.dataCollection}
              </div>

              <div className="space-y-4">
                {/* Analytics */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <Label className="text-sm font-medium">{PRIVACY_COPY.analytics.title}</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {PRIVACY_COPY.analytics.description}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {PRIVACY_COPY.analytics.note}
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.analytics}
                    onCheckedChange={(value) => handlePrivacySettingChange('analytics', value)}
                    data-testid="switch-analytics"
                  />
                </div>

                <Separator />

                {/* Personalized Insights */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <Label className="text-sm font-medium">{PRIVACY_COPY.personalizedInsights.title}</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {PRIVACY_COPY.personalizedInsights.description}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {PRIVACY_COPY.personalizedInsights.note}
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.personalizedInsights}
                    onCheckedChange={(value) => handlePrivacySettingChange('personalizedInsights', value)}
                    data-testid="switch-personalized-insights"
                  />
                </div>

                <Separator />

                {/* Data Sharing */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <Label className="text-sm font-medium">{PRIVACY_COPY.dataSharing.title}</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {PRIVACY_COPY.dataSharing.description}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {PRIVACY_COPY.dataSharing.note}
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(value) => handlePrivacySettingChange('dataSharing', value)}
                    data-testid="switch-data-sharing"
                  />
                </div>

                <Separator />

                {/* Marketing Emails */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <Label className="text-sm font-medium">{PRIVACY_COPY.marketingEmails.title}</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {PRIVACY_COPY.marketingEmails.description}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {PRIVACY_COPY.marketingEmails.note}
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.marketingEmails}
                    onCheckedChange={(value) => handlePrivacySettingChange('marketingEmails', value)}
                    data-testid="switch-marketing-emails"
                  />
                </div>

                <Separator />

                {/* Product Updates */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <Label className="text-sm font-medium">{PRIVACY_COPY.productUpdates.title}</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {PRIVACY_COPY.productUpdates.description}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {PRIVACY_COPY.productUpdates.note}
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.productUpdates}
                    onCheckedChange={(value) => handlePrivacySettingChange('productUpdates', value)}
                    data-testid="switch-product-updates"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">{PRIVACY_COPY.dataRights.title}</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {PRIVACY_COPY.dataRights.points.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updated Wellness Disclaimer */}
        <Card className="border-blue-200 dark:border-blue-800" data-testid="card-disclaimer">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
              <Shield className="h-5 w-5 mr-2" />
              Wellness Platform Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
              <p>
                {PRIVACY_COPY.mainDisclaimer}
              </p>
              
              <div className="space-y-2">
                <p><strong>Wellness Focus:</strong> {PRIVACY_COPY.disclaimers.wellness}</p>
                <p><strong>Data Accuracy:</strong> {PRIVACY_COPY.disclaimers.accuracy}</p>
                <p><strong>Professional Care:</strong> {PRIVACY_COPY.disclaimers.professional}</p>
              </div>
              
              <p className="font-medium text-center mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
                Your wellness companion • Evidence-based insights • Always consult healthcare professionals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, requiredPlan: '', feature: '' })}
        requiredPlan={upgradeModal.requiredPlan as 'premium' | 'pro'}
        feature={upgradeModal.feature}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
      
      <BottomNavigation />
    </div>
  );
}