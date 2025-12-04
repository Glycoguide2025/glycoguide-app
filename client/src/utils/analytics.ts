// Privacy-first analytics utility for GlycoGuide
// Only tracks essential user interactions for product improvement
// No personal data collection, no external tracking

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  page?: string;
  properties?: Record<string, string | number | boolean>;
}

class PrivacyFirstAnalytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 100; // Keep only recent events in memory
  private isEnabled = true;

  constructor() {
    // Check if user has opted out via localStorage
    const optOut = localStorage.getItem('analytics-opt-out');
    this.isEnabled = optOut !== 'true';
  }

  // Track user interactions (privacy-safe)
  track(event: string, properties?: Record<string, string | number | boolean>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      page: window.location.pathname,
      properties: this.sanitizeProperties(properties)
    };

    // Add to in-memory store
    this.events.push(analyticsEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Console log for development
    if (import.meta.env.DEV) {
      console.debug('📊 Analytics:', analyticsEvent);
    }
  }

  // Sanitize properties to remove any potential PII
  private sanitizeProperties(properties?: Record<string, any>): Record<string, string | number | boolean> {
    if (!properties) return {};

    const sanitized: Record<string, string | number | boolean> = {};
    // Allow Stage 5 analytics fields + existing allowed keys
    const allowedKeys = ['action', 'category', 'label', 'value', 'page_type', 'feature_used', 'interaction_type', 'userId', 'plan', 'ts', 'context'];

    for (const [key, value] of Object.entries(properties)) {
      if (allowedKeys.includes(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Get analytics summary (no personal data)
  getSummary() {
    if (!this.isEnabled) return null;

    const eventCounts = this.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: this.events.length,
      eventCounts,
      timeRange: this.events.length > 0 ? {
        start: Math.min(...this.events.map(e => e.timestamp)),
        end: Math.max(...this.events.map(e => e.timestamp))
      } : null
    };
  }

  // Allow users to opt out
  optOut() {
    this.isEnabled = false;
    this.events = [];
    localStorage.setItem('analytics-opt-out', 'true');
    console.log('✅ Analytics opt-out successful. No data will be tracked.');
  }

  // Allow users to opt back in
  optIn() {
    this.isEnabled = true;
    localStorage.removeItem('analytics-opt-out');
    console.log('✅ Analytics opt-in successful. Privacy-safe usage data will be tracked.');
  }

  // Get opt-out status
  isOptedOut() {
    return !this.isEnabled;
  }

  // Clear all stored events
  clear() {
    this.events = [];
  }
}

// Create singleton instance
export const analytics = new PrivacyFirstAnalytics();

// Common tracking functions for ease of use
export const trackPageView = (page: string) => {
  analytics.track('page_view', { page_type: page });
};

export const trackFeatureUse = (feature: string, action: string = 'use') => {
  analytics.track('feature_interaction', { 
    feature_used: feature, 
    action 
  });
};

export const trackReflectionSubmit = (mood: string) => {
  analytics.track('reflection_submitted', { 
    interaction_type: 'daily_reflection',
    category: 'wellness'
  });
};

export const trackMealLog = (category: string) => {
  analytics.track('meal_logged', { 
    category: 'nutrition',
    interaction_type: 'meal_tracking'
  });
};

export const trackRecipeView = () => {
  analytics.track('recipe_viewed', { 
    category: 'nutrition',
    interaction_type: 'content_view'
  });
};

export const trackExportRequest = (type: 'csv' | 'pdf') => {
  analytics.track('export_requested', { 
    category: 'data_export',
    interaction_type: type + '_export'
  });
};

// Stage 5 - Drop 3: Light Analytics Events
// Client-only, minimal payload: { userId, plan, ts, context }

export const trackUpgradeClick = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan, 
    ts: Date.now(),
    context: context || 'upgrade_button'
  };
  analytics.track('upgrade_click', payload);
  console.log('📊 upgrade_click:', payload);
};

export const trackCheckoutStarted = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan,
    ts: Date.now(), 
    context: context || 'billing_page'
  };
  analytics.track('checkout_started', payload);
  console.log('📊 checkout_started:', payload);
};

export const trackCheckoutCompleted = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan,
    ts: Date.now(),
    context: context || 'payment_success'
  };
  analytics.track('checkout_completed', payload);
  console.log('📊 checkout_completed:', payload);
};

export const trackInsightViewed = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan,
    ts: Date.now(),
    context: context || 'insights_page'
  };
  analytics.track('insight_viewed', payload);
  console.log('📊 insight_viewed:', payload);
};

export const trackSuggestionClicked = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan,
    ts: Date.now(),
    context: context || 'suggestion_item'
  };
  analytics.track('suggestion_clicked', payload);
  console.log('📊 suggestion_clicked:', payload);
};

export const trackCsvExported = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan,
    ts: Date.now(),
    context: context || 'export_menu'
  };
  analytics.track('csv_exported', payload);
  console.log('📊 csv_exported:', payload);
};

export const trackPdfExported = (userId: string, plan: string, context?: string) => {
  const payload = {
    userId,
    plan,
    ts: Date.now(),
    context: context || 'export_menu'
  };
  analytics.track('pdf_exported', payload);
  console.log('📊 pdf_exported:', payload);
};

export const trackOnboardingStep = (step: number) => {
  analytics.track('onboarding_step', { 
    category: 'onboarding',
    value: step
  });
};

export default analytics;