import { Sparkles } from "lucide-react";

export function HomepageWelcomeBanner() {
  return (
    <div 
      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 text-center"
      data-testid="banner-welcome"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm sm:text-base">
          <span className="font-semibold">Welcome to GlycoGuide.</span>{" "}
          <span className="hidden sm:inline">
            Explore features, tools, and membership options to support your wellness journey.
          </span>
          <span className="sm:hidden">
            Explore features and tools for your wellness journey.
          </span>
        </p>
      </div>
    </div>
  );
}

export default HomepageWelcomeBanner;
