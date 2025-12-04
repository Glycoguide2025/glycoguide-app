import { useOfflineDetection } from '@/hooks/useOfflineDetection';

// Global offline detection component that just initializes the hook
// The toast notifications are handled within the hook itself
export function OfflineIndicator() {
  // This hook automatically shows toast notifications for offline/online states
  const { isOnline } = useOfflineDetection();
  
  // Optional: Add a subtle indicator in development mode
  if (import.meta.env.DEV && !isOnline) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground text-center py-1 text-sm z-50"
        data-testid="offline-indicator"
      >
        📡 Offline Mode - Changes will sync when connected
      </div>
    );
  }
  
  return null;
}