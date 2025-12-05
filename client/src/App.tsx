import React, { useEffect, useState, Suspense, lazy } from "react";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { MiniSurveys } from "@/components/surveys/MiniSurveys";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { GlobalFAB } from "@/components/layout/GlobalFAB";
import { PerformanceBadge } from "@/components/ui/performance-badge";
import CookieBanner from "@/components/CookieBanner";
import LegalFooter from "@/components/layout/LegalFooter";
import { useAuth } from "@/hooks/useAuth";
import { setupGlobalErrorHandling } from "@/utils/errorReporting";
import { StartupAnimation } from "@/components/StartupAnimation";
import UpgradeModal from "@/components/UpgradeModal";
import { UpgradeProvider } from "@/hooks/useUpgradeModal";
import { RequireAuth } from "@/components/RequireAuth";

// Direct imports for main pages and auth pages to avoid HMR issues  
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import AuthTest from "@/pages/auth-test";
import AuthDebug from "@/pages/auth-debug";
import ForgotPasswordPage from "@/pages/forgot-password";
import SimpleLogin from "@/pages/simple-login";
import MinimalLogin from "@/pages/minimal-login";
import CleanLogin from "@/pages/clean-login";
import UltraSimpleLogin from "@/pages/ultra-simple-login";
import ResetPasswordPage from "@/pages/reset-password";
import LoggedOut from "@/pages/logged-out";
import Recipes from "@/pages/recipes";
import MealDetail from "@/pages/meal-detail";
import MealsRoute from "@/routes/MealsRoute";
const Profile = lazy(() => import("@/pages/profile"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
import NotFound from "@/pages/not-found";
const BillingTest = lazy(() => import("@/pages/billing-test"));
const Messages = lazy(() => import("@/pages/messages"));
const Settings = lazy(() => import("@/pages/settings"));
const Press = lazy(() => import("@/pages/Press"));
import CommunityMVP from "@/pages/CommunityMVP";
const Mindfulness = lazy(() => import("@/pages/mindfulness"));
const Movement = lazy(() => import("@/pages/movement"));
const CGM = lazy(() => import("@/pages/cgm"));
const Sleep = lazy(() => import("@/pages/sleep"));
const BowelMovement = lazy(() => import("@/pages/bm"));
import BloodPressure from "@/pages/blood-pressure";
import BPTest from "@/pages/bp-test";
import BloodSugar from "@/pages/blood-sugar";
const Subscribe = lazy(() => import("@/pages/subscribe"));
const EnergyChecker = lazy(() => import("@/pages/energy-checker"));
const EveningWindDownPage = lazy(() => import("@/pages/EveningWindDownPage"));
const GratitudePage = lazy(() => import("@/pages/GratitudePage"));
const QuickStressReliefPage = lazy(() => import("@/pages/QuickStressReliefPage"));
const DeleteAccount = lazy(() => import("@/pages/delete-account"));
const WellnessArticle = lazy(() => import("@/pages/WellnessArticle"));
const MovementHub = lazy(() => import("@/pages/MovementHub"));
const TermsOfService = lazy(() => import("@/pages/legal/terms"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/privacy"));
const RefundPolicy = lazy(() => import("@/pages/legal/refund"));
const SciencePage = lazy(() => import("@/pages/science"));
const InsightHistory = lazy(() => import("@/pages/insight-history"));
import AboutPage from "@/pages/about";
import EducationPage from "@/pages/education";
import PrediabetesRiskPage from "@/pages/prediabetes-risk";
import RegionSelectionPage from "@/pages/region-selection";
import MembershipPage from "@/pages/membership";

// Stage 8 RC Hardening: Lazy load heavy components
const Insights = lazy(() => import("@/pages/insights"));
const Providers = lazy(() => import("@/pages/providers"));

// Fallback loading component with opaque background to cover any content underneath
const PageLoader = () => (
  <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Lazy-loaded route components
const LazyInsights = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <Insights />
      </Suspense>
    )}
    featureName="health insights"
    description="Get personalized insights and analytics about your wellness journey and blood sugar patterns."
  />
);

const LazyProviders = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <Providers />
      </Suspense>
    )}
    featureName="healthcare providers"
    description="Connect with trusted healthcare professionals specialized in diabetes and metabolic health."
  />
);

const LazyProfile = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <Profile />
      </Suspense>
    )}
    featureName="your profile settings"
    description="Access your personalized wellness dashboard, manage your health data, and customize your GlycoGuide experience."
  />
);

const LazyMindfulness = () => (
  <Suspense fallback={<PageLoader />}>
    <Mindfulness />
  </Suspense>
);

const LazySleep = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <Sleep />
      </Suspense>
    )}
    featureName="sleep tracking"
    description="Monitor your sleep patterns and discover how quality rest impacts your blood sugar levels and overall wellness."
  />
);

const LazyMovement = () => (
  <Suspense fallback={<PageLoader />}>
    <Movement />
  </Suspense>
);

const LazyMovementHub = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <MovementHub />
      </Suspense>
    )}
    featureName="movement education"
    description="Learn personalized movement strategies designed to help manage your blood sugar and boost your energy."
  />
);

const LazyGratitude = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <GratitudePage />
      </Suspense>
    )}
    featureName="gratitude practice"
    description="Cultivate positivity and reduce stress with our guided gratitude exercises for better wellness."
  />
);

const LazyEveningWindDown = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <EveningWindDownPage />
      </Suspense>
    )}
    featureName="evening wind-down"
    description="Prepare for restful sleep with calming evening routines designed for better metabolic health."
  />
);

const LazyQuickStressRelief = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <QuickStressReliefPage />
      </Suspense>
    )}
    featureName="stress relief tools"
    description="Quick, effective techniques to manage stress and support healthy blood sugar balance."
  />
);

const LazyOnboarding = () => (
  <Suspense fallback={<PageLoader />}>
    <Onboarding />
  </Suspense>
);

const LazyBillingTest = () => (
  <Suspense fallback={<PageLoader />}>
    <BillingTest />
  </Suspense>
);

const LazyMessages = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <Messages />
      </Suspense>
    )}
    featureName="messages"
    description="Connect with your wellness community and receive personalized support from our team."
  />
);

const LazySettings = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <Settings />
      </Suspense>
    )}
    featureName="settings"
    description="Customize your GlycoGuide experience with personalized preferences and notification controls."
  />
);

const LazyPress = () => (
  <Suspense fallback={<PageLoader />}>
    <Press />
  </Suspense>
);

const LazyCGM = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <CGM />
      </Suspense>
    )}
    featureName="continuous glucose monitoring"
    description="Connect your CGM device to track real-time blood sugar trends and receive intelligent insights."
  />
);

const LazyBowelMovement = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <BowelMovement />
      </Suspense>
    )}
    featureName="digestive health tracking"
    description="Monitor your digestive wellness and discover how it connects to your overall metabolic health."
  />
);

const LazySubscribe = () => (
  <Suspense fallback={<PageLoader />}>
    <Subscribe />
  </Suspense>
);

const LazyEnergyChecker = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <EnergyChecker />
      </Suspense>
    )}
    featureName="energy checker"
    description="Track your daily energy patterns and uncover insights about what affects your vitality."
  />
);

const LazyDeleteAccount = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <DeleteAccount />
      </Suspense>
    )}
    featureName="account management"
    description="Manage your account settings and data preferences securely."
  />
);

const LazyWellnessArticle = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <WellnessArticle />
      </Suspense>
    )}
    featureName="wellness education"
    description="Access our comprehensive library of evidence-based wellness articles tailored to your health goals."
  />
);

const LazyTermsOfService = () => (
  <Suspense fallback={<PageLoader />}>
    <TermsOfService />
  </Suspense>
);

const LazyPrivacyPolicy = () => (
  <Suspense fallback={<PageLoader />}>
    <PrivacyPolicy />
  </Suspense>
);

const LazyRefundPolicy = () => (
  <Suspense fallback={<PageLoader />}>
    <RefundPolicy />
  </Suspense>
);

const LazySciencePage = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <SciencePage />
      </Suspense>
    )}
    featureName="science library"
    description="Explore evidence-based research and scientific insights about diabetes management and metabolic health."
  />
);

const LazyInsightHistory = () => (
  <RequireAuth 
    Component={() => (
      <Suspense fallback={<PageLoader />}>
        <InsightHistory />
      </Suspense>
    )}
    featureName="insight history"
    description="Review your historical wellness insights and track your progress over time."
  />
);

function AppRoutes() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Render Education page FIRST to avoid all suspension/auth issues
  // Match any /education route including subpaths like /education/content/:id
  if (location.startsWith('/education')) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1">
          <EducationPage />
        </div>
        <LegalFooter />
        <BottomNavigation />
        <GlobalFAB />
        <PerformanceBadge />
        <CookieBanner />
      </div>
    );
  }

  // Blood Pressure & Blood Sugar pages now handled in main authenticated routes Switch below

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // TEST PAGE - accessible even when logged in
  if (location === '/ultra-simple-login') {
    return <UltraSimpleLogin />;
  }

  // Logged out confirmation page - accessible regardless of auth state
  if (location === '/logged-out') {
    return <LoggedOut />;
  }

  // Critical: Render auth pages OUTSIDE the main layout to prevent any landing page components from loading
  // Allow auth pages to be accessible regardless of authentication state
  if (location === '/auth' || location === '/auth-test' || location === '/auth-debug' || location === '/forgot-password' || location.startsWith('/reset-password') || location === '/simple-login' || location === '/minimal-login' || location === '/clean-login') {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/auth-test" component={AuthTest} />
        <Route path="/auth-debug" component={AuthDebug} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password/:token" component={ResetPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/simple-login" component={SimpleLogin} />
        <Route path="/minimal-login" component={MinimalLogin} />
        <Route path="/clean-login" component={CleanLogin} />
      </Switch>
    );
  }

  // Unauthenticated public routes (non-auth pages)
  // CRITICAL: Only redirect to landing if we're SURE the user is not authenticated (not loading)
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1">
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/meals" component={MealsRoute} />
            <Route path="/meals/:id" component={MealDetail} />
            <Route path="/mindfulness" component={LazyMindfulness} />
            <Route path="/community" component={CommunityMVP} />
            <Route path="/blood-sugar" component={BloodSugar} />
            <Route path="/blood-pressure" component={BloodPressure} />
            <Route path="/dashboard" component={Home} />
            <Route path="/movement" component={LazyMovement} />
            <Route path="/about" component={AboutPage} />
            <Route path="/membership" component={MembershipPage} />
            <Route path="/prediabetes-risk" component={PrediabetesRiskPage} />
            <Route path="/press" component={LazyPress} />
            <Route path="/privacy" component={LazyPrivacyPolicy} />
            <Route path="/terms" component={LazyTermsOfService} />
            <Route path="/refund-policy" component={LazyRefundPolicy} />
            
            {/* Premium routes - show upgrade prompts instead of 404 */}
            <Route path="/profile" component={LazyProfile} />
            <Route path="/settings" component={LazySettings} />
            <Route path="/cgm" component={LazyCGM} />
            <Route path="/sleep" component={LazySleep} />
            <Route path="/bm" component={LazyBowelMovement} />
            <Route path="/insights" component={LazyInsights} />
            <Route path="/providers" component={LazyProviders} />
            <Route path="/messages" component={LazyMessages} />
            <Route path="/subscribe" component={LazySubscribe} />
            <Route path="/energy-checker" component={LazyEnergyChecker} />
            <Route path="/evening-wind-down" component={LazyEveningWindDown} />
            <Route path="/gratitude" component={LazyGratitude} />
            <Route path="/quick-stress-relief" component={LazyQuickStressRelief} />
            <Route path="/movement-education" component={LazyMovementHub} />
            <Route path="/articles/:category/:slug" component={LazyWellnessArticle} />
            <Route path="/science" component={LazySciencePage} />
            <Route path="/insight-history" component={LazyInsightHistory} />
            <Route path="/region-selection" component={RegionSelectionPage} />
            
            {/* Catch truly unknown routes - show 404 */}
            <Route component={NotFound} />
          </Switch>
        </div>
        
        {/* Global Components for public pages */}
        <BottomNavigation />
        <GlobalFAB />
        <PerformanceBadge />
        <CookieBanner />
        <LegalFooter />
        <OfflineIndicator />
      </div>
    );
  }

  // Authenticated routes
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
          <Switch>
            {/* Marketing page - view landing page when logged in for App Store screenshots */}
            <Route path="/marketing" component={Landing} />
            
            {/* Step 1: Simplified 4-tab wellness app structure */}
            <Route path="/bp-test" component={BPTest} />
            <Route path="/blood-pressure" component={BloodPressure} />
            <Route path="/blood-pressure/logs" component={BloodPressure} />
            <Route path="/blood-sugar" component={BloodSugar} />
            <Route path="/blood-sugar/logs" component={BloodSugar} />
            <Route path="/" component={Home} />
            <Route path="/onboarding" component={LazyOnboarding} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/meals" component={MealsRoute} />
            <Route path="/meals/:id" component={MealDetail} />
          <Route path="/mindfulness" component={LazyMindfulness} />
          <Route path="/cgm" component={LazyCGM} />
          <Route path="/insights" component={LazyInsights} />
          <Route path="/profile" component={LazyProfile} />
          <Route path="/providers" component={LazyProviders} />
          <Route path="/messages" component={LazyMessages} />
          <Route path="/settings" component={LazySettings} />
          <Route path="/region-selection" component={RegionSelectionPage} />
          <Route path="/science" component={LazySciencePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/membership" component={MembershipPage} />
          <Route path="/prediabetes-risk" component={PrediabetesRiskPage} />
          <Route path="/insight-history" component={LazyInsightHistory} />
          <Route path="/billing-test" component={LazyBillingTest} />
          <Route path="/subscribe" component={LazySubscribe} />
          <Route path="/delete-account" component={LazyDeleteAccount} />
          
          {/* Redirects from old complex structure to new simplified tabs */}
          <Route path="/dashboard" component={Home} />
          <Route path="/tracking" component={LazyInsights} />
          <Route path="/planning" component={Home} />
          <Route path="/consultations" component={LazyProfile} />
          <Route path="/chat" component={LazyInsights} />
          <Route path="/sleep" component={LazySleep} />
          <Route path="/bm" component={LazyBowelMovement} />
          <Route path="/community" component={CommunityMVP} />
          <Route path="/journal" component={LazyInsights} />
          <Route path="/overview" component={Home} />
          <Route path="/movement" component={LazyMovement} />
          <Route path="/movement-education" component={LazyMovementHub} />
          
          {/* Wellness sections */}
          <Route path="/energy-checker" component={LazyEnergyChecker} />
          <Route path="/evening-wind-down" component={LazyEveningWindDown} />
          <Route path="/gratitude" component={LazyGratitude} />
          <Route path="/quick-stress-relief" component={LazyQuickStressRelief} />
          
          {/* Wellness Education Articles */}
          <Route path="/articles/:category/:slug" component={LazyWellnessArticle} />
          
          {/* Legal pages - accessible to all authenticated users */}
          <Route path="/privacy" component={LazyPrivacyPolicy} />
          <Route path="/terms" component={LazyTermsOfService} />
          <Route path="/refund-policy" component={LazyRefundPolicy} />
          
          {/* Catch truly unknown routes */}
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Legal footer - visible on all pages except mobile */}
      <LegalFooter />
      
      {/* Global navigation and actions - only for authenticated users */}
      {isAuthenticated && (
        <>
          <BottomNavigation />
          <GlobalFAB />
        </>
      )}
      
      {/* Stage 8 RC Hardening: Performance monitoring badge (dev only) */}
      <PerformanceBadge />
      
      {/* Cookie consent banner */}
      <CookieBanner />
    </div>
  );
}

function App() {
  // CRITICAL: Do NOT call useLocation() here - Router context not available yet
  // Router is rendered inside the return statement, so any routing hooks must be used INSIDE Router
  
  // Stage 7: Startup animation - TEMPORARILY DISABLED FOR DEBUGGING
  // BUT: Never show on auth pages (it blocks inputs)
  const [showStartup, setShowStartup] = useState(() => {
    return false; // Temporarily disabled to debug blank screen
  });

  const handleStartupComplete = () => {
    sessionStorage.setItem('glycoguide_startup_shown', 'true');
    setShowStartup(false);
  };

  // Stage 15: Initialize global error handling and promise rejection tracking
  useEffect(() => {
    // Set up Stage 15 error tracking system
    setupGlobalErrorHandling();
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Log unhandled rejections for debugging while allowing them to surface
      console.warn('Unhandled promise rejection:', event.reason);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter>
          <UpgradeProvider>
            {showStartup && <StartupAnimation onComplete={handleStartupComplete} />}
            <Toaster />
            <OfflineIndicator />
            <UpgradeModal />
            <AppRoutes />
          </UpgradeProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
