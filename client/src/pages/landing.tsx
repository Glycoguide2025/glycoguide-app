import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/HeroSection";
import WellnessPreviewSection from "@/components/WellnessPreviewSection";
import ProgressPreviewSection from "@/components/ProgressPreviewSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CommunityPromoStrip from "@/components/CommunityPromoStrip";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import FooterCTA from "@/components/FooterCTA";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactStrip from "@/components/ContactStrip";
import HomepageWelcomeBanner from "@/components/HomepageWelcomeBanner";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (user) {
    return null;
  }

  return (
    <main>
      <HomepageWelcomeBanner />
      <HeroSection />
      <WellnessPreviewSection />
      <ProgressPreviewSection />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CommunityPromoStrip />
      <ScreenshotsSection />
      <FooterCTA />
      <PricingSection />
      <FAQSection />
      <ContactStrip />
    </main>
  );
}
