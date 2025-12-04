import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { Settings as SettingsIcon, Trash2, Shield, FileText, Download, Mail, Clock, Volume2, VolumeX, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/utils/analytics";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isSoundEnabled, setSoundEnabled } from "@/utils/soundCues";
import CSVExport from "@/components/export/csv-export";
import PDFExport from "@/components/export/pdf-export";

// Import i18n translations (assuming there's a translation hook)
// For now, using static translations
const t = {
  settings: {
    title: "Settings",
    analytics_title: "Share anonymous usage",
    analytics_desc: "Helps improve the app. You can turn this off anytime.",
    delete_title: "Delete account",
    delete_desc: "This will remove your data. This can't be undone.",
    delete_confirm: "Type DELETE to confirm",
    save: "Save changes",
    privacy: "Privacy policy",
    disclaimer: "GlycoGuide is a wellness and self-tracking app. It does not diagnose, treat, or provide medical advice."
  },
  exports: {
    title: "Export Your Data",
    csv: {
      title: "CSV Export", 
      description: "Spreadsheet format for analysis"
    },
    pdf: {
      title: "PDF Report",
      description: "Formatted summary report"
    }
  }
};

export default function Settings() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(!analytics.isOptedOut());
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [soundCuesEnabled, setSoundCuesEnabled] = useState(isSoundEnabled());
  const [aiReflectionEnabled, setAiReflectionEnabled] = useState(() => {
    return localStorage.getItem('ai_reflection_enabled') !== 'false';
  });
  const { toast } = useToast();
  const { user, isPro } = useAuth();

  // Phase 5: Emotion-Aware Reminder Preferences
  const { data: reminderPrefs, isLoading: reminderPrefsLoading } = useQuery<{
    emailOptIn: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'paused';
    timezone: string;
  }>({
    queryKey: ['/api/user/reminder-preferences'],
  });

  const [emailOptIn, setEmailOptIn] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly' | 'paused'>('paused');
  const [timezone, setTimezone] = useState('America/New_York');

  useEffect(() => {
    if (reminderPrefs) {
      setEmailOptIn(reminderPrefs.emailOptIn || false);
      setReminderFrequency(reminderPrefs.reminderFrequency || 'paused');
      setTimezone(reminderPrefs.timezone || 'America/New_York');
    }
  }, [reminderPrefs]);

  const updateReminderPrefsMutation = useMutation({
    mutationFn: (prefs: any) => apiRequest('/api/user/reminder-preferences', 'PUT', prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/reminder-preferences'] });
      toast({
        title: "Preferences saved",
        description: "Your reminder preferences have been updated 💚"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveReminderPrefs = () => {
    updateReminderPrefsMutation.mutate({
      emailOptIn,
      reminderFrequency,
      timezone
    });
  };

  // Track page view
  useEffect(() => {
    analytics.track('page_view', { 
      page_type: 'settings',
      userId: (user as any)?.id || 'anonymous',
      plan: isPro ? 'premium' : 'free'
    });
  }, [user, isPro]);

  const handleSoundCuesToggle = (enabled: boolean) => {
    setSoundCuesEnabled(enabled);
    setSoundEnabled(enabled);
    toast({
      title: enabled ? "Sound cues enabled" : "Sound cues disabled",
      description: enabled ? "Gentle audio feedback is now active 🎵" : "Sound cues have been turned off"
    });
  };

  const handleAiReflectionToggle = (enabled: boolean) => {
    setAiReflectionEnabled(enabled);
    localStorage.setItem('ai_reflection_enabled', enabled ? 'true' : 'false');
    toast({
      title: enabled ? "Reflection feedback enabled" : "Reflection feedback disabled",
      description: enabled ? "You'll receive empathetic responses to your reflections" : "Reflection feedback has been turned off"
    });
  };

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    if (enabled) {
      analytics.optIn();
      toast({
        title: "Analytics enabled",
        description: "Thank you for helping us improve the app!"
      });
    } else {
      analytics.optOut();
      toast({
        title: "Analytics disabled", 
        description: "Your usage data will no longer be collected."
      });
    }

    // Track the toggle action (will only work if analytics is enabled)
    analytics.track('analytics_toggle', {
      action: enabled ? 'enabled' : 'disabled',
      context: 'settings_page'
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: 'Please type "DELETE" to confirm account deletion.',
        variant: "destructive"
      });
      return;
    }

    try {
      // Track delete attempt (before actually deleting)
      analytics.track('delete_account_attempt', {
        userId: (user as any)?.id || 'anonymous',
        context: 'settings_page'
      });

      // TODO: Implement actual account deletion API call
      // const response = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      // if (!response.ok) throw new Error('Failed to delete account');
      
      toast({
        title: "Account deletion requested",
        description: "Your account deletion is being processed. This feature will be fully implemented soon.",
        variant: "destructive"
      });
      
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  };


  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setTimeout(() => {
        window.location.replace('/auth');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      queryClient.clear();
      window.location.replace('/auth');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-24" data-testid="settings-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-settings-title">
            {t.settings.title}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Logout Button - Visible and accessible on mobile */}
        <Card data-testid="card-logout">
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout-settings"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Settings */}
        <Card data-testid="card-analytics-settings">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="analytics-toggle" className="text-base font-medium" data-testid="label-analytics-title">
                  {t.settings.analytics_title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-analytics-desc">
                  {t.settings.analytics_desc}
                </p>
              </div>
              <Switch
                id="analytics-toggle"
                checked={analyticsEnabled}
                onCheckedChange={handleAnalyticsToggle}
                data-testid="switch-analytics-toggle"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="reflection-feedback-toggle" className="text-base font-medium" data-testid="label-reflection-feedback">
                  Reflection feedback
                </Label>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-reflection-feedback-desc">
                  Get empathetic responses to your community reflections using privacy-first keyword analysis
                </p>
              </div>
              <Switch
                id="reflection-feedback-toggle"
                checked={aiReflectionEnabled}
                onCheckedChange={handleAiReflectionToggle}
                data-testid="switch-reflection-feedback"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stage 6: Sound Cues Toggle */}
        <Card data-testid="card-sound-cues">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {soundCuesEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              Sound Cues
            </CardTitle>
            <CardDescription>
              Gentle audio feedback for your wellness actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="sound-cues-toggle" className="text-base font-medium" data-testid="label-sound-cues">
                  Enable sound cues
                </Label>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-sound-cues-desc">
                  Hear gentle chimes when saving, soft whooshes when opening panels, and subtle tones for achievements
                </p>
              </div>
              <Switch
                id="sound-cues-toggle"
                checked={soundCuesEnabled}
                onCheckedChange={handleSoundCuesToggle}
                data-testid="switch-sound-cues"
              />
            </div>
          </CardContent>
        </Card>

        {/* Region & Blood Sugar Unit Settings */}
        <Link href="/region-selection">
          <Card className="cursor-pointer hover:bg-accent transition-colors" data-testid="card-region-settings">
            <CardHeader>
              <CardTitle className="text-lg">Region & Units</CardTitle>
              <CardDescription>
                Change your region to display blood sugar readings in your preferred unit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-change-region">
                Change Region Settings
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Emotion-Aware Reminder Preferences - Phase 5 */}
        <Card data-testid="card-reminder-preferences">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Wellness Check-In Reminders
            </CardTitle>
            <CardDescription>
              Get gentle email reminders to check in with your mood and energy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Opt-In Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="email-opt-in" className="text-base font-medium">
                  Email reminders
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive gentle check-in emails based on your preferences
                </p>
              </div>
              <Switch
                id="email-opt-in"
                checked={emailOptIn}
                onCheckedChange={setEmailOptIn}
                disabled={reminderPrefsLoading}
                data-testid="switch-email-opt-in"
              />
            </div>

            {emailOptIn && (
              <>
                <Separator />
                
                {/* Reminder Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="reminder-frequency" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Frequency
                  </Label>
                  <Select 
                    value={reminderFrequency} 
                    onValueChange={(value: 'daily' | 'weekly' | 'paused') => setReminderFrequency(value)}
                    disabled={reminderPrefsLoading}
                  >
                    <SelectTrigger id="reminder-frequency" data-testid="select-reminder-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily" data-testid="option-daily">Daily check-ins</SelectItem>
                      <SelectItem value="weekly" data-testid="option-weekly">Weekly check-ins</SelectItem>
                      <SelectItem value="paused" data-testid="option-paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {reminderFrequency === 'daily' && 'You\'ll receive check-in emails morning and evening'}
                    {reminderFrequency === 'weekly' && 'You\'ll receive one check-in email per week'}
                    {reminderFrequency === 'paused' && 'No reminders will be sent'}
                  </p>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Your timezone</Label>
                  <Select 
                    value={timezone} 
                    onValueChange={setTimezone}
                    disabled={reminderPrefsLoading}
                  >
                    <SelectTrigger id="timezone" data-testid="select-timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                      <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEDT/AEST)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Reminders will be sent based on your timezone
                  </p>
                </div>

                <Separator />

                {/* Save Button */}
                <Button 
                  onClick={handleSaveReminderPrefs}
                  disabled={updateReminderPrefsMutation.isPending || reminderPrefsLoading}
                  className="w-full"
                  data-testid="button-save-reminder-prefs"
                >
                  {updateReminderPrefsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* CSV Export */}
        <CSVExport />

        {/* PDF Export */}
        <PDFExport />

        {/* Contact Support */}
        <Card data-testid="card-contact-support">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Need help? We're here for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm">
                Have questions or need assistance? Our support team is ready to help.
              </p>
              
              <div className="bg-background p-3 rounded border">
                <p className="text-xs text-muted-foreground mb-1">Email us at:</p>
                <a 
                  href="mailto:support@glycoguide.app?subject=GlycoGuide Support Request"
                  className="text-primary font-medium hover:underline"
                  data-testid="link-support-email"
                >
                  support@glycoguide.app
                </a>
              </div>
              
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => window.location.href = 'mailto:support@glycoguide.app?subject=GlycoGuide Support Request'}
                data-testid="button-contact-support"
              >
                <Mail className="w-4 h-4 mr-2" />
                Open Email App
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              We typically respond within 24 hours
            </p>
          </CardContent>
        </Card>

        {/* Legal & Disclaimer */}
        <Card data-testid="card-legal">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Legal & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm" data-testid="text-disclaimer">
                {t.settings.disclaimer}
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link href="/science" className="text-primary hover:underline text-sm" data-testid="link-science">
                Science & Research
              </Link>
              <Link href="/insight-history" className="text-primary hover:underline text-sm" data-testid="link-insight-history">
                Insight History
              </Link>
              <Link href="/privacy" className="text-primary hover:underline text-sm" data-testid="link-privacy">
                {t.settings.privacy}
              </Link>
              <Link href="/terms" className="text-primary hover:underline text-sm" data-testid="link-terms">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="text-primary hover:underline text-sm" data-testid="link-refund">
                Refund Policy
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}