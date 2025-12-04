import { useEffect, useRef } from "react";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";

type Need = "pro" | "premium";

export default function UpgradeModal() {
  const { isOpen, need, close } = useUpgradeModal();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen || !need) return null;

  async function startCheckout() {
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier: need })
      });
      
      if (!res.ok) {
        console.error("Checkout failed:", res.status);
        alert("Checkout failed. Please try again.");
        return;
      }
      
      const j = await res.json();
      if (j?.url) {
        window.location.href = j.url; // Stripe Checkout redirect
      } else {
        alert("Missing checkout URL");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again.");
    }
  }

  const title = need === "premium" ? "Unlock Premium" : "Upgrade to Pro";
  const bullets =
    need === "premium"
      ? ["30-day insights", "CSV & PDF exports", "Advanced analytics", "Priority support"]
      : ["90-day insights", "CSV export", "CGM import"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="upgrade-title"
      aria-modal="true"
      role="dialog"
      data-testid="modal-upgrade"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      {/* modal */}
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

        <h2 id="upgrade-title" className="text-xl font-semibold mb-2 text-gray-900 dark:text-white" data-testid="text-modal-title">
          {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3" data-testid="text-modal-description">
          Wellness features to help you spot patterns with less effort.
        </p>

        <ul className="mb-4 list-disc pl-5 text-sm text-gray-800 dark:text-gray-200 space-y-1" data-testid="list-features">
          {bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>

        <div className="flex gap-2">
          <button
            onClick={startCheckout}
            className="flex-1 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            data-testid="button-checkout"
          >
            Continue to Checkout
          </button>
          <button
            onClick={close}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            data-testid="button-not-now"
          >
            Not now
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400" data-testid="text-disclaimer">
          You can cancel anytime. GlycoGuide is a wellness companion and does not provide medical advice.
        </p>
      </div>
    </div>
  );
}