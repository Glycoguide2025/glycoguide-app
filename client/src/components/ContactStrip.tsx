import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function ContactStrip() {
  const [, setLocation] = useLocation();
  const { user, isPro } = useAuth();
  const { toast } = useToast();

  const handleEmailSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    // Email support is available to everyone - no authentication required
    window.location.href = "mailto:support@glycoguide.app?subject=GlycoGuide Support Request";
  };

  const handleCommunityHub = (e: React.MouseEvent) => {
    e.preventDefault();
    
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
        description: "Upgrade to Premium to access these features",
        variant: "default",
      });
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };

  return (
    <section
      id="contact"
      className="
        px-6 py-12 text-center
        bg-gradient-to-br from-emerald-50 via-white to-rose-50
        border-y border-emerald-100/60
        dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 dark:border-gray-800
      "
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2 id="contact-heading" className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Questions? We're here to help.
        </h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Email us anytime or join the Community Hub to get support from others on a similar path.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={handleEmailSupport}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            data-testid="button-email-support"
          >
            📩 Email Support
          </button>
          <button
            onClick={handleCommunityHub}
            className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-6 py-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/70 dark:hover:bg-emerald-400/10"
            data-testid="button-community-hub"
          >
            Visit Community Hub
          </button>
        </div>
      </div>
    </section>
  );
}
