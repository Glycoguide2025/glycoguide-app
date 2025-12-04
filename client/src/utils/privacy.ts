// Stage 15: Centralized privacy and consent management
export interface PrivacySettings {
  analytics: boolean;
  personalizedInsights: boolean;
  dataSharing: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
}

// Non-medical privacy copy for GlycoGuide
export const PRIVACY_COPY = {
  mainDisclaimer: "GlycoGuide is a wellness and lifestyle tracking platform designed to help you make informed food choices and track your health data. It is not a medical device and does not provide medical advice, diagnosis, or treatment.",
  
  dataCollection: "We collect information you provide to improve your experience, including meal logs, health metrics, and usage patterns. All data is stored securely and you maintain full control over your information.",
  
  analytics: {
    title: "Usage Analytics",
    description: "Help us improve GlycoGuide by sharing anonymous usage data. This includes feature usage and performance metrics.",
    note: "No personal health data is included in analytics."
  },
  
  personalizedInsights: {
    title: "Personalized Insights",
    description: "Allow GlycoGuide to analyze your data patterns to provide personalized recommendations and insights.",
    note: "All analysis is performed automatically and securely."
  },
  
  dataSharing: {
    title: "Data Sharing",
    description: "Enable sharing anonymized, aggregated data to support wellness research and platform improvements.",
    note: "Individual data is never shared. Only statistical summaries are used."
  },
  
  marketingEmails: {
    title: "Marketing Communications",
    description: "Receive occasional emails about new features, wellness tips, and platform updates.",
    note: "You can unsubscribe at any time."
  },
  
  productUpdates: {
    title: "Product Updates",
    description: "Get notified about important platform updates, maintenance, and new features.",
    note: "Essential service notifications will always be sent regardless of this setting."
  },
  
  dataRights: {
    title: "Your Data Rights",
    points: [
      "Access: View all your personal data at any time",
      "Export: Download your complete data in portable format",
      "Correction: Update or correct any inaccurate information",
      "Deletion: Permanently delete your account and all associated data",
      "Portability: Transfer your data to other services"
    ]
  },
  
  disclaimers: {
    wellness: "GlycoGuide focuses on wellness, nutrition tracking, and lifestyle management. It's designed to complement, not replace, professional healthcare guidance.",
    accuracy: "While we strive for accuracy in our food database and calculations, individual responses may vary. Always consider your personal health circumstances.",
    professional: "For medical advice, diagnosis, or treatment, always consult qualified healthcare professionals who can consider your complete medical history."
  }
};

// Privacy settings management
export class PrivacyManager {
  private static STORAGE_KEY = 'glycoguide-privacy-settings';
  
  static getDefaultSettings(): PrivacySettings {
    return {
      analytics: true,
      personalizedInsights: true,
      dataSharing: false,
      marketingEmails: false,
      productUpdates: true
    };
  }
  
  static getSettings(): PrivacySettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultSettings(), ...parsed };
      }
    } catch (error) {
      console.warn('Failed to parse privacy settings, using defaults:', error);
    }
    return this.getDefaultSettings();
  }
  
  static updateSettings(updates: Partial<PrivacySettings>): PrivacySettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      
      // Handle analytics opt-out (maintain backward compatibility)
      const analyticsOptOut = localStorage.getItem('analytics-opt-out');
      if (updates.analytics !== undefined) {
        if (updates.analytics) {
          localStorage.removeItem('analytics-opt-out');
        } else {
          localStorage.setItem('analytics-opt-out', 'true');
        }
      }
      
      console.log('Privacy settings updated:', updates);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
    
    return updated;
  }
  
  static canCollectAnalytics(): boolean {
    return this.getSettings().analytics;
  }
  
  static canPersonalizeInsights(): boolean {
    return this.getSettings().personalizedInsights;
  }
  
  static canShareData(): boolean {
    return this.getSettings().dataSharing;
  }
  
  static exportSettings(): string {
    const settings = this.getSettings();
    const exportData = {
      privacySettings: settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }
}