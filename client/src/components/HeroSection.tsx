import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function HeroSection() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);

  const handleExploreRecipes = () => {
    if (user) {
      // User is logged in, show them the 25 free recipes
      setLocation('/recipes');
    } else {
      // User is not logged in, show dialog prompting to join
      setShowRecipeDialog(true);
    }
  };

  return (
    <header
      className="
        relative overflow-hidden
        bg-gradient-to-br from-emerald-50 via-white to-rose-50
        dark:from-gray-900 dark:via-gray-950 dark:to-gray-900
        border-b border-emerald-100/60 dark:border-gray-800
      "
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-400/10" />

      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/60 px-4 py-1 text-sm font-medium text-emerald-800 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/60 dark:text-emerald-300">
          🍃 GlycoGuide
        </div>

        <h1 id="hero-heading" className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white">
          500+ Low-GI Recipes • Wellness Guides • Progress Tracking
        </h1>

        <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <span className="font-semibold">GlycoGuide was created with you in mind</span> — to make balanced living simple, supportive, and sustainable.
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-base text-gray-600 dark:text-gray-400">
          Our approach blends modern nutrition science with mindful awareness, helping you understand how food, movement, and lifestyle work together to support lasting wellbeing.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/auth?mode=register"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            data-testid="button-signup"
          >
            Join for Free
          </a>
          
          <a
            href="/auth?mode=login"
            className="inline-flex items-center justify-center rounded-full border-2 border-emerald-600 px-8 py-3 text-emerald-700 font-semibold hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:text-emerald-300 dark:border-emerald-400 dark:hover:bg-emerald-400/10 dark:focus:ring-offset-gray-950"
            data-testid="button-login"
          >
            Log In
          </a>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button 
              onClick={handleExploreRecipes}
              className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-6 py-3 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/70 dark:hover:bg-emerald-400/10"
              data-testid="button-explore-recipes"
            >
              Explore Recipes 🍲
            </button>
            <a 
              href="#wellness" 
              className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-6 py-3 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/70 dark:hover:bg-emerald-400/10"
              data-testid="link-wellness"
            >
              Discover Wellness Guides 🌱
            </a>
            <a 
              href="#progress" 
              className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-6 py-3 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/70 dark:hover:bg-emerald-400/10"
              data-testid="link-progress"
            >
              Track Your Progress 📈
            </a>
          </div>
        </div>
      </div>

      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Join Free to Unlock 25 Recipes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-8 text-center">
              <Sparkles className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-3">
                Discover 25 Low-GI Recipes — Free
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Join GlycoGuide today and get instant access to <span className="font-semibold">25 delicious recipes</span> from our collection — completely free.
              </p>
              <a href="/auth?mode=register">
                <Button 
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
                  data-testid="button-join-free-recipes"
                >
                  Join for Free
                </Button>
              </a>
            </div>

            <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Want full access to all 500+ recipes?
              </p>
              <a href="#pricing">
                <Button 
                  variant="outline" 
                  className="border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={() => setShowRecipeDialog(false)}
                  data-testid="button-view-pricing"
                >
                  View Pro & Premium Plans
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
