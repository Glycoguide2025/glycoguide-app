import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Import i18n - using static for now
const t = {
  errors: {
    offline: "You're offline. Changes will sync when you're back."
  }
};

export function useOfflineDetection() {
  // Guard for browser environment to prevent SSR/hydration issues
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
  const [isOnline, setIsOnline] = useState(isBrowser ? navigator.onLine : true);
  const [wasOffline, setWasOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Return early if not in browser environment
    if (!isBrowser) return;
    const handleOnline = () => {
      setIsOnline(true);
      
      // Show reconnection toast if was previously offline
      if (wasOffline) {
        toast({
          title: "You're back online!",
          description: "Your connection has been restored.",
          duration: 3000,
        });
        setWasOffline(false);
      }

      // Track connectivity event if analytics available and user consented
      try {
        const optOut = localStorage.getItem('analytics-opt-out');
        const analytics = (window as any).analytics;
        
        if (optOut !== 'true' && analytics && typeof analytics.track === 'function') {
          analytics.track('connectivity_restored', {
            context: 'offline_detection',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Silently fail analytics
        console.debug('Analytics tracking failed in connectivity:', error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      
      // Show offline toast
      toast({
        title: "Connection lost",
        description: t.errors.offline,
        duration: 5000, // Show longer for offline
        variant: "destructive"
      });

      // Track connectivity event if analytics available and user consented  
      try {
        const optOut = localStorage.getItem('analytics-opt-out');
        const analytics = (window as any).analytics;
        
        if (optOut !== 'true' && analytics && typeof analytics.track === 'function') {
          analytics.track('connectivity_lost', {
            context: 'offline_detection', 
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Silently fail analytics
        console.debug('Analytics tracking failed in connectivity:', error);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, toast]);

  return {
    isOnline,
    wasOffline
  };
}