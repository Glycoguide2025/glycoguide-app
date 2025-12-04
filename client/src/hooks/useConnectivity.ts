import { useEffect, useState } from "react";

export function useConnectivity() {
  const [online, setOnline] = useState(true); // Start optimistic
  const [simulate, setSimulate] = useState(false);

  useEffect(() => {
    // Check for simulation flag in localStorage or URL
    const checkSimulate = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlOffline = urlParams.get('offline') === '1';
      const storageOffline = localStorage.getItem('simulateOffline') === '1';
      return urlOffline || storageOffline;
    };

    // Update real online status
    const updateOnline = () => {
      setOnline(navigator.onLine);
    };

    // Update simulate status
    const updateSimulate = () => {
      setSimulate(checkSimulate());
    };

    // Initialize
    updateOnline();
    updateSimulate();

    // Listen for real network changes
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    
    // Listen for storage changes (simulate toggle from other tabs)
    window.addEventListener('storage', updateSimulate);

    // Listen for custom simulate events
    const handleSimulateEvent = () => updateSimulate();
    window.addEventListener('connectivity-simulate', handleSimulateEvent);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      window.removeEventListener('storage', updateSimulate);
      window.removeEventListener('connectivity-simulate', handleSimulateEvent);
    };
  }, []);

  const toggleSimulate = () => {
    const newValue = !simulate;
    localStorage.setItem('simulateOffline', newValue ? '1' : '0');
    
    // Dispatch custom event to update all components
    window.dispatchEvent(new CustomEvent('connectivity-simulate'));
  };

  // Effective online status: false if simulating offline OR actually offline
  const effectiveOnline = simulate ? false : online;

  return {
    online: effectiveOnline,
    simulate,
    toggleSimulate
  };
}