import { useEffect, useState } from "react";
import { useConnectivity } from "@/hooks/useConnectivity";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function OfflineIndicator() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const { online } = useConnectivity();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  // Handle reconnection toast
  useEffect(() => {
    if (ready && online && wasOffline) {
      // Show "Back online" toast regardless of dismiss state
      setShowOnlineToast(true);
      setDismissed(false); // Reset dismiss state for next offline period
      
      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
        setWasOffline(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (ready && !online) {
      setWasOffline(true);
      setShowOnlineToast(false);
    }
  }, [online, ready, wasOffline]);

  if (!ready) return null;

  // Show "Back online" toast
  if (showOnlineToast) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className="gg-offline fixed left-1/2 -translate-x-1/2 rounded-xl bg-green-400 text-green-900 px-4 py-3 shadow-lg border-2 border-green-600 font-medium text-sm z-40"
        style={{ 
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          pointerEvents: 'none'
        }}
      >
        ✅ Back online
      </div>
    );
  }

  // Don't show offline banner if online or dismissed
  if (online || dismissed) return null;
  
  return (
    <div 
      role="status" 
      aria-live="polite"
      className="gg-offline fixed left-1/2 -translate-x-1/2 rounded-xl bg-yellow-400 text-yellow-900 px-4 py-3 shadow-lg border-2 border-yellow-600 font-medium text-sm z-40"
      style={{ 
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        pointerEvents: 'none'
      }}
    >
      <div className="flex items-center gap-2">
        <span>🚫 You're offline. Changes will sync when you're back.</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0 hover:bg-yellow-500 text-yellow-900"
          aria-label="Dismiss offline notice"
          style={{ pointerEvents: 'auto' }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}