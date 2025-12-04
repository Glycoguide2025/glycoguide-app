import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function CommunityPromoStrip() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isPro } = useAuth();
  const { toast } = useToast();

  const handleEnterHub = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    // CRITICAL: Use stable isPro from useAuth hook
    if (isPro) {
      setLocation("/community");
    } else {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to unlock this feature. Scroll down to view pricing.",
        variant: "default",
      });
      // Scroll to pricing section after a brief delay
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  };

  const handleSeeTheme = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    // CRITICAL: Use stable isPro from useAuth hook
    if (isPro) {
      setLocation("/community");
    } else {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to unlock this feature. Scroll down to view pricing.",
        variant: "default",
      });
      // Scroll to pricing section after a brief delay
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  };

  return (
    <section
      id="community-promo"
      className="
        relative overflow-hidden
        px-6 py-10
        bg-gradient-to-br from-emerald-50 via-white to-rose-50
        border-y border-emerald-100/60
        dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 dark:border-gray-800
      "
      aria-labelledby="community-promo-heading"
    >
      <div className="pointer-events-none absolute -left-16 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" />
      <div className="pointer-events-none absolute -right-16 -bottom-12 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-400/10" />

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 id="community-promo-heading" className="text-2xl font-extrabold text-gray-900 dark:text-white">
            🌍 Community Hub
          </h3>
          <p className="mt-1 text-gray-700 dark:text-gray-300">
            Share your wellness journey, celebrate wins, ask questions, and connect with others on similar paths.
            Whether you're focusing on your holistic lifestyle or navigating your diabetes journey — we've got you covered.
          </p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
            This week's theme: <span className="font-semibold">Gratitude Practices</span> • New prompts every week
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleEnterHub}
              className="
                inline-flex items-center justify-center rounded-full
                bg-emerald-600 px-6 py-2 text-white shadow hover:bg-emerald-700
                focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-gray-950
              "
              data-testid="button-enter-hub"
            >
              Enter the Hub
            </button>
            <button
              onClick={handleSeeTheme}
              className="
                inline-flex items-center justify-center rounded-full
                border border-emerald-600 px-6 py-2
                text-emerald-700 hover:bg-emerald-50
                dark:text-emerald-300 dark:border-emerald-400/70 dark:hover:bg-emerald-400/10
              "
              data-testid="button-see-theme"
            >
              See This Week's Theme
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            ⭐ Premium-only feature • Upgrade to access
          </p>
        </div>
      </div>
    </section>
  );
}
