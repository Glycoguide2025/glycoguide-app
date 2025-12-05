import { useEffect, useRef } from "react";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { Crown, ExternalLink, LogIn } from "lucide-react";
import { useLocation } from "wouter";

export default function UpgradeModal() {
  const { isOpen, need, close } = useUpgradeModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen || !need) return null;

  const handleLearnMore = () => {
    window.open('https://glycoguide.app', '_blank');
    close();
  };

  const handleSignIn = () => {
    setLocation('/auth');
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="premium-title"
      aria-modal="true"
      role="dialog"
      data-testid="modal-premium"
    >
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div
        ref={dialogRef}
        className="relative w-[92%] max-w-md rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-xl"
      >
        <button
          onClick={close}
          className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
          data-testid="button-close-modal"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 id="premium-title" className="text-xl font-semibold mb-3 text-gray-900 dark:text-white text-center" data-testid="text-modal-title">
          Premium Feature
        </h2>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center space-y-2">
          <p data-testid="text-modal-message-1">
            This feature is available to GlycoGuide Premium members.
          </p>
          <p data-testid="text-modal-message-2">
            If you already have a Premium account, please sign in.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-modal-message-3">
            To learn more about GlycoGuide, visit our website.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleLearnMore}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 transition-colors"
            data-testid="button-learn-more"
          >
            <ExternalLink className="w-4 h-4" />
            Learn More
          </button>
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            data-testid="button-sign-in"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={close}
            className="w-full rounded-lg px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            data-testid="button-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
