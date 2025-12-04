import { useState, useEffect } from "react";
import { Calendar, Target, Utensils, Droplets, Heart, Play, Activity, Moon, X } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getHomeStrings, getSuggestionStrings, formatTimeOfDay } from '@/utils/insights';
import { formatString } from '@/utils/format';
import WeekStrip from '@/components/reflection/week-strip';
import DailyReflection from '@/components/reflection/daily-reflection';
import { trackPageView, trackMealLog, trackRecipeView } from '@/utils/analytics';
import HydrationSection from '@/components/HydrationSection';
import BloodPressureSection from '@/components/BloodPressureSection';
import BloodSugarSection from '@/components/BloodSugarSection';
import WearablesSummary from '@/components/WearablesSummary';
import WeeklyActivityChecklist, { EnhancedWeeklyChecklist } from '@/components/WeeklyActivityChecklist';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import Header from '@/components/layout/header';
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import JourneyTracker from '@/components/JourneyTracker';
import { AmbientAudioPlayer } from '@/components/AmbientAudioPlayer';
import { CommunityReflectionFeed } from '@/components/CommunityReflectionFeed';
import { AdaptiveWellnessInsights } from '@/components/AdaptiveWellnessInsights';
import { PremiumOnboardingCarousel } from '@/components/onboarding/PremiumOnboardingCarousel';
import { playSound } from '@/utils/soundCues';
import { MoodToActionGuidance } from '@/components/MoodToActionGuidance';
import { GuidedCommunityCircles } from '@/components/GuidedCommunityCircles';
import { getRandomSupportiveResponse } from '@/data/supportiveResponses';
import { getInsightForMood } from '@/data/moodToInsightMap';
import { getTodaysReflection } from '@/data/dailyReflections';

// Morning Greeting Animation Component
function MorningGreeting({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 6000); // Show for 6 seconds, then fade out

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Sunrise gradient background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          background: [
            'linear-gradient(135deg, #F4E9D8 0%, #FFEBD1 50%, #FFF8E3 100%)',
            'linear-gradient(135deg, #FFEBD1 0%, #FFF8E3 50%, #FFF3D6 100%)',
            'linear-gradient(135deg, #FFF8E3 0%, #FFF3D6 50%, #FFEBD1 100%)',
            'linear-gradient(135deg, #FFEBD1 0%, #FFF8E3 50%, #FFF3D6 100%)',
          ]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Sunrise glow animation */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full"
        initial={{ scale: 0.8, opacity: 0.3 }}
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: 'radial-gradient(circle, rgba(255,235,209,0.8) 0%, rgba(255,248,227,0.3) 50%, transparent 100%)'
        }}
      />

      {/* Sun rays and leaf decorations */}
      <motion.div
        className="absolute top-20 right-1/4 text-4xl"
        animate={{ 
          opacity: [0.4, 0.9, 0.4],
          rotate: [0, 20, 0]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ☀️
      </motion.div>
      <motion.div
        className="absolute top-32 left-1/4 text-3xl"
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          y: [0, -10, 0]
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        🌿
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-1/4 text-3xl"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
      >
        ✨
      </motion.div>

      {/* Greeting content */}
      <motion.div
        className="relative text-center z-10 px-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
      >
        <h2 className="text-4xl font-semibold text-[#5C5044] mb-4">
          Good morning, {userName}
        </h2>
        <p className="text-lg text-[#5C5044] italic">
          "A new day, a fresh rhythm — start gently and stay present."
        </p>
      </motion.div>
    </motion.div>
  );
}

// Midday Reset Animation Component
function MiddayResetGreeting({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // Show for 5 seconds, then fade out

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Daylight gradient background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          background: [
            'linear-gradient(135deg, #FFFDF8 0%, #E8F1E3 50%, #DDEBF6 100%)',
            'linear-gradient(135deg, #E8F1E3 0%, #DDEBF6 50%, #F0F5F0 100%)',
            'linear-gradient(135deg, #DDEBF6 0%, #F0F5F0 50%, #E8F1E3 100%)',
            'linear-gradient(135deg, #E8F1E3 0%, #DDEBF6 50%, #FFFDF8 100%)',
          ]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Gentle floating light rays */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-1 h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent transform -rotate-45"
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          y: [0, 20, 0]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-1 h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent transform rotate-12"
        animate={{ 
          opacity: [0.15, 0.4, 0.15],
          y: [0, 15, 0]
        }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      />

      {/* Drifting leaf animations */}
      <motion.div
        className="absolute top-24 right-1/3 text-2xl"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          y: [0, 30, 0],
          x: [0, -10, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        🍃
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-1/3 text-2xl"
        animate={{ 
          opacity: [0.2, 0.6, 0.2],
          y: [0, -25, 0],
          x: [0, 10, 0],
          rotate: [0, -8, 0]
        }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
      >
        🍃
      </motion.div>

      {/* Greeting content */}
      <motion.div
        className="relative text-center z-10 px-6"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
      >
        <h2 className="text-4xl font-semibold text-[#506050] mb-4">
          Midday Reset
        </h2>
        <p className="text-lg text-[#506050] italic">
          "Take a breath, stretch your body, and sip some water."
        </p>
      </motion.div>
    </motion.div>
  );
}

// Evening Greeting Animation Component (6-8 PM)
function EveningGreeting({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // Show for 5 seconds, then fade out

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Dusk gradient background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          background: [
            'linear-gradient(135deg, #FFFEF8 0%, #E8DDE8 50%, #D0D4D8 100%)',
            'linear-gradient(135deg, #F5F0F5 0%, #DDD5E0 50%, #C8CCD8 100%)',
            'linear-gradient(135deg, #E8DDE8 0%, #D0D4D8 50%, #C0C8D0 100%)',
            'linear-gradient(135deg, #F5F0F5 0%, #DDD5E0 50%, #C8CCD8 100%)',
          ]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Soft evening elements */}
      <motion.div
        className="absolute top-24 right-1/3 text-3xl"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          y: [0, -15, 0]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🌅
      </motion.div>
      <motion.div
        className="absolute bottom-36 left-1/4 text-3xl"
        animate={{ 
          opacity: [0.4, 0.8, 0.4],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      >
        🍂
      </motion.div>

      {/* Greeting content */}
      <motion.div
        className="relative text-center z-10 px-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
      >
        <h2 className="text-4xl font-semibold text-[#5A5260] mb-4">
          Good evening, {userName}
        </h2>
        <p className="text-lg text-[#5A5260] italic">
          "Take a deep breath — you've done enough for today."
        </p>
      </motion.div>
    </motion.div>
  );
}

// Nighttime Greeting Animation Component (8 PM - 12 AM)
function NighttimeGreeting({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // Show for 5 seconds, then fade out

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Twilight gradient background with stars */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          background: [
            'linear-gradient(135deg, #FAFAFA 0%, #E9EEF0 50%, #C8D1D8 100%)',
            'linear-gradient(135deg, #E9EEF0 0%, #C8D1D8 50%, #B8C5D0 100%)',
            'linear-gradient(135deg, #C8D1D8 0%, #B8C5D0 50%, #A8B5C8 100%)',
            'linear-gradient(135deg, #E9EEF0 0%, #C8D1D8 50%, #B8C5D0 100%)',
          ]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Subtle stars */}
      <motion.div
        className="absolute top-20 right-1/4 text-4xl"
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-32 left-1/4 text-3xl"
        animate={{ 
          opacity: [0.2, 0.7, 0.2],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-1/3 text-5xl"
        animate={{ 
          opacity: [0.4, 0.9, 0.4],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        🌙
      </motion.div>

      {/* Greeting content */}
      <motion.div
        className="relative text-center z-10 px-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
      >
        <h2 className="text-4xl font-semibold text-[#4E4E4E] mb-4">
          Rest well, {userName}
        </h2>
        <p className="text-lg text-[#4E4E4E] italic">
          "The day is complete. Let stillness settle in."
        </p>
      </motion.div>
    </motion.div>
  );
}

// Sleep Mode Component (12 AM - 5:30 AM)
function SleepMode({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-gradient-to-br from-[#2A2A2A] via-[#383838] to-[#404040]"
    >
      {/* Dimmed moon icon */}
      <motion.div
        className="absolute top-1/4 text-6xl opacity-20"
        animate={{ 
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🌙
      </motion.div>

      {/* Sleep mode message */}
      <motion.div
        className="relative text-center z-10 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h2 className="text-3xl font-medium text-gray-400 mb-3">
          Rest mode active
        </h2>
        <p className="text-base text-gray-500 italic">
          GlycoGuide will greet you at sunrise.
        </p>
      </motion.div>
    </motion.div>
  );
}

// Custom Card Component - Responsive and compact on mobile
function Card({ title, icon, children, footer }: { title: string; icon?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section 
      className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 text-center"
      role="region"
      aria-labelledby={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <header className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
        {icon && <span className="text-2xl sm:text-3xl md:text-4xl leading-none" aria-hidden="true">{icon}</span>}
        <h2 
          id={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-base sm:text-lg md:text-xl font-bold text-blue-600 dark:text-white"
        >
          {title}
        </h2>
      </header>
      <div className="text-sm sm:text-base text-gray-700 dark:text-white space-y-3 sm:space-y-4">{children}</div>
      {footer && <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
    </section>
  );
}

// Custom Row Actions Component
function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

// Custom Button Component
function Btn({ children, onClick, variant = "primary", disabled = false, className = "", "aria-label": ariaLabel, ...props }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "primary"|"ghost"; 
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  [key: string]: any;
}) {
  const base = "px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
      : "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-50";
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${styles} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

// Energy Check-In Component with Contextual Guidance
function EnergyCheckIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<number | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Fetch today's energy log
  const { data: todaysEnergyLog } = useQuery({
    queryKey: ['/api/energy-checkin/today'],
    refetchOnWindowFocus: false,
  });

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  const timeOfDay = getTimeOfDay();

  // Check if guidance was already shown for this time period today
  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    const guidanceShown = localStorage.getItem(`energy_guidance_${todayKey}_${timeOfDay}`);
    if (guidanceShown && todaysEnergyLog) {
      setShowGuidance(true);
      setSelectedEnergyLevel(Number(guidanceShown));
    }
  }, [todaysEnergyLog, timeOfDay]);

  // Scroll to show guidance when it appears
  useEffect(() => {
    if (showGuidance) {
      // Use a small delay to ensure the DOM has updated
      setTimeout(() => {
        // Scroll to show the guidance card fully visible
        const energySection = document.getElementById('energy-checkin-section');
        if (energySection) {
          // Scroll the element into view at the top with some breathing room
          energySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [showGuidance]);

  // Log energy mutation
  const logEnergyMutation = useMutation({
    mutationFn: async (energyLevel: number) => {
      const energyMap = {
        1: { physical: 2, mental: 2, emotional: 2, drain: 'sleep' as const },
        2: { physical: 5, mental: 5, emotional: 5, drain: 'other' as const },
        3: { physical: 8, mental: 8, emotional: 8, drain: 'other' as const }
      };
      
      const energyData = energyMap[energyLevel as keyof typeof energyMap] || energyMap[2];
      
      return await apiRequest('POST', '/api/energy-checkin', {
        ...energyData,
        idempotencyKey: crypto.randomUUID()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/energy-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/energy-checkin/today'] });
      playSound('save'); // Gentle chime for save action
      toast({
        title: "Energy logged! 🌟",
        description: "Your daily energy check-in has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Oops!",
        description: "Failed to save your energy check-in. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEnergyLog = (level: number) => {
    setSelectedEnergyLevel(level);
    setShowGuidance(true);
    logEnergyMutation.mutate(level);
    
    // Store guidance preference for this time period
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`energy_guidance_${todayKey}_${timeOfDay}`, level.toString());
  };

  const getEnergyGuidance = (level: number) => {
    const timeOfDay = getTimeOfDay();
    
    // Tired in the morning
    if (level === 1 && timeOfDay === 'morning') {
      return {
        title: "🌅 Morning Fatigue",
        message: "Feeling tired this morning? Try these gentle energizers:",
        tips: [
          "🌤 Step outside for a few minutes of fresh air and natural light.",
          "🧘‍♂️ Do a few slow stretches to wake up your body.",
          "🍵 Sip warm water or herbal tea to hydrate and soothe.",
          "🎧 Listen to calming music or a short guided meditation to ease into the day.",
          "📝 Set one small intention to focus your energy."
        ],
        affirmation: "I greet this day with kindness and patience. My energy will rise with each gentle step.",
        color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700"
      };
    }
    
    // Tired in the afternoon
    if (level === 1 && timeOfDay === 'afternoon') {
      return {
        title: "🕒 Afternoon Slump",
        message: "Hit a mid-day dip? Here's how to lift your energy:",
        tips: [
          "🚶‍♀️ Take a brisk walk or do a few energizing movements.",
          "💧 Drink a glass of water—dehydration can sneak up on you.",
          "🍎 Grab a light, balanced snack to refuel.",
          "🌿 Step away from screens for a few minutes to reset your focus.",
          "🔄 Try a breathing exercise to refresh your mind."
        ],
        affirmation: "I honor my body's rhythm. A pause now helps me move forward with clarity.",
        color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700"
      };
    }
    
    // Tired in evening or general (post-workout tiredness)
    if (level === 1) {
      return {
        title: "💪 Post-Workout Tiredness",
        message: "Feeling drained after exercise? Recharge with care:",
        tips: [
          "🧘‍♀️ Cool down with gentle stretches to support recovery.",
          "💦 Rehydrate with water or an electrolyte-rich drink.",
          "🍽 Refuel with a nourishing, protein-rich snack.",
          "🛋 Rest for a few minutes—your body deserves it.",
          "🌸 Celebrate your effort with a moment of gratitude."
        ],
        affirmation: "I am proud of my effort. Rest is part of my strength.",
        color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700"
      };
    }

    // Okay/Balanced energy
    if (level === 2) {
      return {
        title: "👍 Balanced Energy",
        message: "You're in a good place today. Keep this momentum going:",
        tips: [
          "🚶‍♀️ Take a mindful walk to stay grounded.",
          "🍎 Enjoy a balanced snack or meal.",
          "📝 Reflect on what's helping you feel balanced.",
          "💧 Stay hydrated throughout the day.",
          "🧘‍♂️ Practice gentle movement or stretching."
        ],
        affirmation: "I honor my body's natural rhythm. Balance flows through me.",
        color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
      };
    }

    // Energized
    if (level === 3) {
      return {
        title: "⚡ Feeling Energized",
        message: "Great energy today! Channel it mindfully:",
        tips: [
          "🏃‍♀️ Use this energy for movement or exercise.",
          "✍️ Tackle a task that needs focus and clarity.",
          "🌟 Share your positive energy with others.",
          "🧘‍♀️ Balance activity with moments of calm.",
          "🎯 Set an intention for the day ahead."
        ],
        affirmation: "I embrace this energy with awareness and purpose.",
        color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
      };
    }

    return null;
  };

  const guidance = selectedEnergyLevel ? getEnergyGuidance(selectedEnergyLevel) : null;
  const energyEmojis = ["😴", "😐", "😀"];
  const energyLabels = ["Tired", "Okay", "Energized"];

  // Convert physical/mental values back to energy level (1-3)
  const getEnergyLevelFromLog = (log: any) => {
    if (!log || !log.physical) return null;
    const physical = Number(log.physical);
    if (physical <= 3) return 1; // Tired
    if (physical <= 6) return 2; // Okay
    return 3; // Energized
  };

  // If already logged today, show status with guidance
  if (todaysEnergyLog && showGuidance) {
    const currentLevel = selectedEnergyLevel || getEnergyLevelFromLog(todaysEnergyLog) || 2;
    const timeLabel = timeOfDay === 'morning' ? 'this morning' : timeOfDay === 'afternoon' ? 'this afternoon' : 'this evening';

    return (
      <div id="energy-checkin-section">
        <div className="text-base font-semibold text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mb-4">
          ✓ You're feeling "{energyLabels[currentLevel - 1]}" {timeLabel}
        </div>

        {guidance && (
          <div className={`p-5 rounded-xl border ${guidance.color} shadow-sm animate-in fade-in duration-500 space-y-3`}>
            <p className="font-semibold text-[#555555] dark:text-gray-300">{guidance.title}</p>
            
            {guidance.message && (
              <p className="text-base text-gray-700 dark:text-gray-300">{guidance.message}</p>
            )}
            
            <ul className="space-y-2 text-base text-gray-700 dark:text-gray-300">
              {guidance.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-base italic text-gray-700 dark:text-gray-300">
                💫 Affirmation: "{guidance.affirmation}"
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const getCheckInPrompt = () => {
    if (timeOfDay === 'morning') return "How rested do you feel this morning?";
    if (timeOfDay === 'afternoon') return "How's your energy this afternoon?";
    return "How are you feeling this evening?";
  };

  return (
    <div id="energy-checkin-section" role="group" aria-labelledby="energy-checkin-label">
      <p id="energy-checkin-label" className="mb-3">{getCheckInPrompt()}</p>
      <RowActions>
        <Btn 
          onClick={() => handleEnergyLog(1)} 
          variant="ghost" 
          disabled={logEnergyMutation.isPending} 
          data-testid="button-energy-1"
          aria-label="Log energy level as tired"
        >
          <span className="text-3xl mr-2" aria-hidden="true">😴</span>Tired
        </Btn>
        <Btn 
          onClick={() => handleEnergyLog(2)} 
          variant="ghost" 
          disabled={logEnergyMutation.isPending} 
          data-testid="button-energy-2"
          aria-label="Log energy level as okay"
        >
          <span className="text-3xl mr-2" aria-hidden="true">😐</span>Okay
        </Btn>
        <Btn 
          onClick={() => handleEnergyLog(3)} 
          variant="ghost" 
          disabled={logEnergyMutation.isPending} 
          data-testid="button-energy-3"
          aria-label="Log energy level as energized"
        >
          <span className="text-3xl mr-2" aria-hidden="true">😀</span>Energized
        </Btn>
      </RowActions>
      {logEnergyMutation.isPending && (
        <div className="text-xs text-gray-500 mt-2">
          Saving your check-in...
        </div>
      )}
    </div>
  );
}

// Grounding Moment Challenge Component
function GroundingChallenge({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { text: "Breathe in…", duration: 3000 },
    { text: "Hold…", duration: 2000 },
    { text: "Breathe out slowly…", duration: 4000 },
    { text: "Notice one thing you see, one thing you hear, one thing you feel.", duration: 5000 },
  ];

  useEffect(() => {
    if (step < steps.length && !isComplete) {
      const timer = setTimeout(() => {
        if (step === steps.length - 1) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          setStep(step + 1);
        }
      }, steps[step].duration);
      return () => clearTimeout(timer);
    }
  }, [step, isComplete]);

  if (isComplete) {
    return (
      <div className="text-center py-6 animate-in fade-in duration-500">
        <p className="text-lg font-medium text-green-600 dark:text-green-400">
          Beautiful work — you took a mindful minute. ✨
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 animate-in fade-in duration-500">
      <p className="text-2xl font-medium text-gray-700 dark:text-gray-300">
        {steps[step].text}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= step ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Wired Mind Module (Nighttime Restlessness/Overstimulation)
function WiredMindModule({ onComplete }: { onComplete: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showBadge, setShowBadge] = useState(false);

  const steps = [
    {
      icon: "⚡",
      title: "Slow the Spin",
      tips: [
        "📱 Turn down screen brightness and set devices aside for 10 minutes.",
        "🧘‍♀️ Take three deep, steady breaths—feel your body relax with each exhale.",
        "🕯 Focus on one comforting detail in your space (a sound, a scent, the weight of your blanket)."
      ],
      affirmation: "My thoughts can slow down. I give myself permission to rest."
    },
    {
      icon: "🌿",
      title: "Gentle Unwind",
      tips: [
        "☕ Sip something warm (herbal tea, warm water, or decaf cocoa).",
        "📖 Read or listen to something soothing—no goals, no screens.",
        "🌌 Dim your lights and let your body know it's nighttime."
      ],
      affirmation: "I allow stillness to replace busyness. My energy softens with every breath."
    },
    {
      icon: "🌜",
      title: "Drift Toward Sleep",
      tips: [
        "🗒 Write down one lingering thought and one gratitude.",
        "🧸 Lie back and imagine exhaling the day out of your body.",
        "🎧 Play a soft soundscape or focus on your breath."
      ],
      affirmation: "You found peace in stillness."
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);

    if (newCompleted.size === steps.length) {
      setShowBadge(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  if (showBadge) {
    return (
      <div className="text-center py-8 animate-in fade-in duration-700">
        <div className="mb-4">
          <div className="text-6xl mb-3">🌙✨</div>
          <div className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#AEBBCC] to-[#E2E7EC] text-gray-800 shadow-lg">
            <p className="text-xl font-semibold mb-1">🏅 Restful Mind</p>
            <p className="text-base opacity-90">You found peace in stillness.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Module Header */}
      <div className="text-center mb-6 space-y-2">
        <h3 className="text-[22px] font-semibold text-gray-800 dark:text-gray-200">
          🌌 Wired Mind: Calm Before Sleep
        </h3>
        <p className="text-[#555555] dark:text-gray-400 font-medium">
          "When your thoughts stay busy, let your body lead the way to stillness."
        </p>
        <p className="text-[#888888] dark:text-gray-500 text-sm italic">
          "Slow down, soften your focus, and settle into peace."
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`text-2xl ${
              completedSteps.has(i) ? 'opacity-100' : 'opacity-30'
            }`}
          >
            {completedSteps.has(i) ? '⭐' : '☆'}
          </div>
        ))}
      </div>

      {steps.map((step, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
            completedSteps.has(index) ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{step.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Step {index + 1}: {step.title}
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {step.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
              <div className="mb-3 space-y-2">
                <p className="text-xs italic text-gray-500 dark:text-gray-400">
                  💫 {step.affirmation}
                </p>
                <AmbientAudioPlayer 
                  affirmation={step.affirmation} 
                  audioType="calm"
                  compact
                />
              </div>
              {!completedSteps.has(index) && (
                <motion.button
                  onClick={() => handleStepComplete(index)}
                  className="relative px-4 py-2 rounded-lg bg-[#AEBBCC] hover:bg-[#AEBBCC]/90 text-white text-sm font-medium transition-colors overflow-hidden"
                  data-testid={`button-wired-mind-step-${index}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    initial={false}
                    animate={completedSteps.has(index) ? { opacity: 1 } : { opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-2xl"
                  >
                    🍃
                  </motion.span>
                  <motion.span
                    initial={false}
                    animate={completedSteps.has(index) ? {
                      scale: [1, 1.5, 0],
                      opacity: [1, 0.5, 0]
                    } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    ✅ I did it
                  </motion.span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Ease Into Sleep Module (Nighttime Anxiety)
function EaseIntoSleepModule({ onComplete }: { onComplete: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showBadge, setShowBadge] = useState(false);

  const steps = [
    {
      icon: "🌬",
      title: "Ground & Breathe",
      tips: [
        "🌬 Practice slow breathing: inhale for 4, exhale for 6.",
        "🛏 Try a calming body scan or gentle stretches in bed."
      ],
      affirmation: "I am safe in this moment. My breath anchors me in peace."
    },
    {
      icon: "🕯",
      title: "Create a Cozy Space",
      tips: [
        "🕯 Dim the lights and silence notifications.",
        "🎧 Listen to a calming soundscape or sleep story."
      ],
      affirmation: "I welcome rest. My space is quiet, and my mind can soften."
    },
    {
      icon: "🗒",
      title: "Reflect & Release",
      tips: [
        "🗒 Write down one worry and one gratitude.",
        "🌙 Repeat your affirmation: \"I release the weight of the day.\""
      ],
      affirmation: "I release the weight of the day."
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);

    if (newCompleted.size === steps.length) {
      setShowBadge(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  if (showBadge) {
    return (
      <div className="text-center py-8 animate-in fade-in duration-700">
        <div className="mb-4">
          <div className="text-6xl mb-3">🌙✨</div>
          <div className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#C3C2E0] to-[#E7E6F5] text-gray-800">
            <p className="text-xl font-semibold mb-1">🏅 Moonlight Calm</p>
            <p className="text-base opacity-90">You found peace in the quiet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Module Header */}
      <div className="text-center mb-6 space-y-2">
        <h3 className="text-[22px] font-semibold text-gray-800 dark:text-gray-200">
          🕯 Ease Into Sleep
        </h3>
        <p className="text-[#555555] dark:text-gray-400 font-medium">
          "A gentle path from tension to tranquility."
        </p>
        <p className="text-[#888888] dark:text-gray-500 text-sm italic">
          "Let go of the day and breathe your way toward rest."
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`text-2xl ${
              completedSteps.has(i) ? 'opacity-100' : 'opacity-30'
            }`}
          >
            {completedSteps.has(i) ? '⭐' : '☆'}
          </div>
        ))}
      </div>

      {steps.map((step, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
            completedSteps.has(index) ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{step.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Step {index + 1}: {step.title}
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {step.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
              <div className="mb-3 space-y-2">
                <p className="text-xs italic text-gray-500 dark:text-gray-400">
                  💫 {step.affirmation}
                </p>
                <AmbientAudioPlayer 
                  affirmation={step.affirmation} 
                  audioType="sleep"
                  compact
                />
              </div>
              {!completedSteps.has(index) && (
                <motion.button
                  onClick={() => handleStepComplete(index)}
                  className="relative w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium overflow-hidden"
                  data-testid={`button-sleep-step-${index + 1}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center text-2xl"
                    initial={{ scale: 0, opacity: 0 }}
                    whileTap={{
                      scale: [0, 2.5],
                      opacity: [0, 0.8, 0],
                      transition: { duration: 0.8, ease: "easeOut" }
                    }}
                  >
                    🍃
                  </motion.span>
                  ✅ I did it
                </motion.button>
              )}
              {completedSteps.has(index) && (
                <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Completed
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mood Check-In Component with Guidance
// Simplified Mood & Energy Quick Log
function MoodEnergyQuickLog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState(50);
  const [supportiveMessage, setSupportiveMessage] = useState<{ message: string; action: string; link?: string; linkText?: string } | null>(null);
  const [moodInsight, setMoodInsight] = useState<{ theme: string; text: string } | null>(null);
  const [showSupportiveModal, setShowSupportiveModal] = useState(false);
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    if (timeOfDay === 'morning') return 'Good morning';
    if (timeOfDay === 'afternoon') return 'Good afternoon';
    return 'Good evening';
  };

  // Handle mood selection and show supportive message in modal
  const handleMoodSelect = (mood: string) => {
    console.log('🔍 Mood selected:', mood);
    setSelectedMood(mood);
    const response = getRandomSupportiveResponse(mood);
    console.log('💬 Supportive response:', response);
    if (response) {
      setSupportiveMessage(response);
      setShowSupportiveModal(true);
      console.log('✅ Message set and modal opened:', response.message);
    } else {
      console.log('❌ No response found for mood:', mood);
    }
    
    // Get mood-based insight
    const insight = getInsightForMood(mood);
    if (insight) {
      setMoodInsight(insight);
      // Store in localStorage for display in Today's Insight card
      localStorage.setItem('todayInsight', JSON.stringify(insight));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: { 
      mood: string; 
      energy: number; 
      timeOfDay: string;
      supportiveMessage?: string;
      supportiveAction?: string;
    }) => {
      return apiRequest('POST', '/api/mood', data);
    },
    onSuccess: () => {
      toast({
        title: "Mood saved! 💚",
        description: supportiveMessage?.message || "Your mood and energy have been recorded.",
        duration: 6000,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/mood'] });
      
      // Reset form after a delay
      setTimeout(() => {
        setSelectedMood('');
        setSelectedEnergy(50);
        setSupportiveMessage(null);
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Couldn't save that",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Please select your mood",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      mood: selectedMood,
      energy: selectedEnergy,
      timeOfDay: getTimeOfDay(),
      supportiveMessage: supportiveMessage?.message,
      supportiveAction: supportiveMessage?.action,
    });
  };

  const moodOptions = [
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'confused', emoji: '😕', label: 'Confused' },
    { value: 'depressed', emoji: '😞', label: 'Depressed' },
    { value: 'energized', emoji: '⚡', label: 'Energized' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'grieving', emoji: '💔', label: 'Grieving' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'lonely', emoji: '😔', label: 'Lonely' },
    { value: 'overwhelmed', emoji: '😵', label: 'Overwhelmed' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'sick', emoji: '🤒', label: 'Sick' },
    { value: 'sleepy', emoji: '😴', label: 'Sleepy' },
    { value: 'tired', emoji: '😫', label: 'Tired' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-700 dark:text-white mb-4">{getGreeting()}</p>
      <div>
        <label className="block text-sm font-medium mb-2">How are you feeling?</label>
        <div className="grid grid-cols-3 gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedMood === mood.value
                  ? 'border-[#A9B89E] bg-[#A9B89E]/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              data-testid={`button-mood-${mood.value}`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-sm font-medium">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-[#A9B89E]">{selectedEnergy}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedEnergy < 30 ? 'Low Energy' : selectedEnergy < 70 ? 'Moderate Energy' : 'High Energy'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={selectedEnergy}
            onChange={(e) => setSelectedEnergy(Number(e.target.value))}
            className="w-full"
            data-testid="input-energy-slider"
          />
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-white">
              How much energy do you have right now?
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Must use the sliding blue line to indicate your energy level
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending || !selectedMood}
        className="w-full bg-[#A9B89E] text-white py-2 px-4 rounded-lg hover:bg-[#8FA084] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="button-submit-mood-energy"
      >
        {mutation.isPending ? 'Saving...' : 'Save My Mood'}
      </button>

      {/* Supportive Message Modal - Like a Friend Reaching Out */}
      <AnimatePresence>
        {showSupportiveModal && supportiveMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSupportiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            >
              {/* Gentle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A9B89E]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C5D4BA]/10 rounded-full blur-2xl" />
              
              {/* Close button */}
              <button
                onClick={() => setShowSupportiveModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Warm greeting with mood emoji */}
              <div className="text-center mb-6 relative z-10">
                <motion.div 
                  className="text-6xl mb-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  {moodOptions.find(m => m.value === selectedMood)?.emoji}
                </motion.div>
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  I hear you...
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-400 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  You're feeling {moodOptions.find(m => m.value === selectedMood)?.label.toLowerCase()}
                </motion.p>
              </div>

              {/* Supportive message with heart */}
              <motion.div 
                className="space-y-5 relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-gradient-to-br from-[#A9B89E]/15 to-[#C5D4BA]/10 border-l-4 border-[#A9B89E] rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-lg mt-0.5">💚</span>
                    <p className="text-base leading-relaxed font-medium text-gray-800 dark:text-gray-100 flex-1">
                      {supportiveMessage.message}
                    </p>
                  </div>
                  <div className="ml-7 pl-0.5 border-l-2 border-[#A9B89E]/30">
                    <p className="text-base text-gray-700 dark:text-gray-300 italic pl-3">
                      {supportiveMessage.action}
                    </p>
                  </div>
                </div>

                {/* Warm action buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  {supportiveMessage.link && supportiveMessage.linkText && (
                    <motion.button
                      onClick={() => {
                        setLocation(supportiveMessage.link!);
                        setShowSupportiveModal(false);
                      }}
                      className="w-full bg-gradient-to-r from-[#A9B89E] to-[#8FA084] text-white py-3.5 px-5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      data-testid="button-mindfulness-exercise"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>✨</span>
                      {supportiveMessage.linkText}
                    </motion.button>
                  )}
                  <button
                    onClick={() => setShowSupportiveModal(false)}
                    className="w-full bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-5 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all text-sm font-medium"
                  >
                    Thanks, I'll keep this in mind 🌿
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MoodCheckIn() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showGroundingChallenge, setShowGroundingChallenge] = useState(false);
  const [showSleepModule, setShowSleepModule] = useState(false);
  const [showWiredMindModule, setShowWiredMindModule] = useState(false);
  const [hasEarnedBadge, setHasEarnedBadge] = useState(false);
  const [hasEarnedMoonlightBadge, setHasEarnedMoonlightBadge] = useState(false);
  const [hasEarnedRestfulMindBadge, setHasEarnedRestfulMindBadge] = useState(false);

  // Check if mood was already logged today
  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    const storedMood = localStorage.getItem(`mood_checkin_${todayKey}`);
    const badgeEarned = localStorage.getItem(`calm_badge_${todayKey}`);
    const moonlightBadge = localStorage.getItem(`moonlight_badge_${todayKey}`);
    const restfulMindBadge = localStorage.getItem(`restful_mind_badge_${todayKey}`);
    if (storedMood) {
      setSelectedMood(storedMood);
      setShowGuidance(true);
    }
    if (badgeEarned) {
      setHasEarnedBadge(true);
    }
    if (moonlightBadge) {
      setHasEarnedMoonlightBadge(true);
    }
    if (restfulMindBadge) {
      setHasEarnedRestfulMindBadge(true);
    }
  }, []);

  const handleMoodSelect = (mood: string) => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`mood_checkin_${todayKey}`, mood);
    setSelectedMood(mood);
    setShowGuidance(true);

    toast({
      title: "Noted — thank you for checking in 💚",
      description: "Your mood has been recorded.",
    });
  };

  const handleGroundingComplete = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`calm_badge_${todayKey}`, 'true');
    setHasEarnedBadge(true);
    setShowGroundingChallenge(false);
    
    // Show animated toast with sparkle
    toast({
      title: (
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.span
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            🏅
          </motion.span>
          Badge Earned: Calm in the Storm
        </motion.div>
      ) as any,
      description: "You paused, breathed, and returned to calm.",
      duration: 5000,
    });
  };

  const handleSleepModuleComplete = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`moonlight_badge_${todayKey}`, 'true');
    setHasEarnedMoonlightBadge(true);
    setShowSleepModule(false);
    
    toast({
      title: (
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.span
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            🏅
          </motion.span>
          Badge Earned: Moonlight Calm
        </motion.div>
      ) as any,
      description: "You found peace in the quiet.",
      duration: 5000,
    });
  };

  const handleWiredMindComplete = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`restful_mind_badge_${todayKey}`, 'true');
    setHasEarnedRestfulMindBadge(true);
    setShowWiredMindModule(false);
    
    toast({
      title: (
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.span
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            🏅
          </motion.span>
          Badge Earned: Restful Mind
        </motion.div>
      ) as any,
      description: "You found peace in stillness.",
      duration: 5000,
    });
  };

  const isNighttime = () => {
    const hour = new Date().getHours();
    return hour >= 20; // 8 PM or later
  };

  const moodOptions = [
    { emoji: "😊", label: "Calm", value: "calm" },
    { emoji: "😌", label: "Content", value: "content" },
    { emoji: "😕", label: "Anxious", value: "anxious" },
    { emoji: "😔", label: "Tired", value: "tired" },
    { emoji: "🌿", label: "Grounded", value: "grounded" },
    { emoji: "😐", label: "Neutral", value: "neutral" },
  ];

  const getMoodGuidance = (mood: string) => {
    const nighttime = isNighttime();
    
    switch (mood) {
      case "calm":
        return {
          message: "Beautiful. Stay in that rhythm — maybe take a short walk or sip tea mindfully.",
          tip: "Remember: balance is nurtured in stillness.",
          affirmation: "I honor this calm within me. Peace flows through every breath.",
          color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
        };
      case "content":
        return {
          message: "Wonderful. Take a moment to acknowledge that peace.",
          tip: "What made today feel in flow for you?",
          affirmation: "I am grounded in gratitude. My heart is content.",
          color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
        };
      case "anxious":
        if (nighttime) {
          // Auto-trigger Ease Into Sleep module after 8 PM
          return {
            message: "Some nights feel heavier than others. If anxiety is keeping you up, this gentle flow is here to help you unwind, breathe, and rest.",
            showSleepModule: true,
            color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700",
          };
        }
        // Daytime anxiety support
        return {
          message: "Let's bring you back to center",
          tips: [
            "🌬 Take slow, deep breaths—in through your nose, out through your mouth.",
            "🌿 Step outside or find a quiet space to reconnect with the present moment.",
            "🧘‍♀️ Try a short mindfulness or grounding exercise to calm racing thoughts.",
            "🗒 Write down what's on your mind—naming it can help tame it.",
            "📱 Reach out to someone you trust or use a calming app for guided support."
          ],
          affirmation: "I am safe in this moment. I breathe in calm and exhale tension. Peace is within reach.",
          color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
          showChallenge: true,
        };
      case "tired":
        const currentHour = new Date().getHours();
        
        // Morning Fatigue (6 AM - 11 AM)
        if (currentHour >= 6 && currentHour < 12) {
          return {
            title: "🌅 Morning Fatigue",
            message: "Feeling tired this morning? Try these gentle energizers:",
            tips: [
              "🌤 Step outside for a few minutes of fresh air and natural light.",
              "🧘‍♂️ Do a few slow stretches to wake up your body.",
              "🍵 Sip warm water or herbal tea to hydrate and soothe.",
              "🎧 Listen to calming music or a short guided meditation to ease into the day.",
              "📝 Set one small intention to focus your energy."
            ],
            affirmation: "I greet this day with kindness and patience. My energy will rise with each gentle step.",
            color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700",
          };
        }
        
        // Afternoon Slump (12 PM - 5 PM)
        if (currentHour >= 12 && currentHour < 18) {
          return {
            title: "🕒 Afternoon Slump",
            message: "Hit a mid-day dip? Here's how to lift your energy:",
            tips: [
              "🚶‍♀️ Take a brisk walk or do a few energizing movements.",
              "💧 Drink a glass of water—dehydration can sneak up on you.",
              "🍎 Grab a light, balanced snack to refuel.",
              "🌿 Step away from screens for a few minutes to reset your focus.",
              "🔄 Try a breathing exercise to refresh your mind."
            ],
            affirmation: "I honor my body's rhythm. A pause now helps me move forward with clarity.",
            color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700",
          };
        }
        
        // Post-Workout Tiredness (6 PM - 10 PM)
        if (currentHour >= 18 && currentHour < 22) {
          return {
            title: "💪 Post-Workout Tiredness",
            message: "Feeling drained after exercise? Recharge with care:",
            tips: [
              "🧘‍♀️ Cool down with gentle stretches to support recovery.",
              "💦 Rehydrate with water or an electrolyte-rich drink.",
              "🍽 Refuel with a nourishing, protein-rich snack.",
              "🛋 Rest for a few minutes—your body deserves it.",
              "🌸 Celebrate your effort with a moment of gratitude."
            ],
            affirmation: "I am proud of my effort. Rest is part of my strength.",
            color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700",
          };
        }
        
        // Fallback (10 PM - 6 AM) - Late Night Rest
        return {
          message: "Your body is ready to rest. Dim lights, breathe deeply, and prepare for sleep.",
          affirmation: "I honor rest as renewal.",
          color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700",
        };
      case "grounded":
        return {
          message: "You're centered and present — beautiful work.",
          tip: "Carry this feeling forward. Notice what helped you get here.",
          affirmation: "I am rooted in this moment. My foundation is strong.",
          color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
        };
      case "neutral":
        if (nighttime) {
          // Auto-trigger Wired Mind module after 8 PM for restless/overstimulated users
          return {
            message: "Your mind feels alert, but your body is ready for rest. Let's ease the transition into calm together.",
            showWiredMindModule: true,
            color: "bg-[#FAFAFA] dark:bg-gray-800 border-[#E6E6E6] dark:border-gray-700",
          };
        }
        // Daytime neutral state
        return {
          message: "Sometimes neutral is exactly where we need to be.",
          tip: "Use this moment to check in: What does your body need right now?",
          affirmation: "I honor where I am. Every feeling is valid.",
          color: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        };
      default:
        return null;
    }
  };

  const guidance = selectedMood ? getMoodGuidance(selectedMood) : null;

  if (showGroundingChallenge) {
    return (
      <div>
        <p className="mb-4 text-gray-600">1-Minute Grounding Moment 🌿</p>
        <GroundingChallenge onComplete={handleGroundingComplete} />
      </div>
    );
  }

  if (showSleepModule) {
    return (
      <div>
        <p className="mb-4 text-gray-600 font-medium">🌙 Ease Into Sleep</p>
        <EaseIntoSleepModule onComplete={handleSleepModuleComplete} />
      </div>
    );
  }

  if (showWiredMindModule) {
    return (
      <div>
        <p className="mb-4 text-gray-600 font-medium">🧘‍♀️ Wired Mind: Can't Shut Off</p>
        <WiredMindModule onComplete={handleWiredMindComplete} />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-gray-600">How are you feeling today?</p>
      
      {!showGuidance ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              data-testid={`button-mood-${mood.value}`}
              aria-label={`Select mood: ${mood.label}`}
            >
              <span className="text-2xl" aria-hidden="true">{mood.emoji}</span>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{mood.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="text-base font-semibold text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mb-4">
            ✓ You're feeling "{moodOptions.find(m => m.value === selectedMood)?.label}" today
          </div>

          {guidance && (
            <div className={`p-5 rounded-xl border ${guidance.color} shadow-sm animate-in fade-in duration-500 space-y-3`}>
              {guidance.title && (
                <p className="font-semibold text-[#555555] dark:text-gray-300">{guidance.title}</p>
              )}
              
              {guidance.message && (
                <p className={`${guidance.title ? 'text-base' : 'text-base font-medium'} text-gray-700 dark:text-gray-300`}>
                  {guidance.message}
                </p>
              )}
              
              {guidance.showSleepModule ? (
                <>
                  {!hasEarnedMoonlightBadge && (
                    <button
                      onClick={() => setShowSleepModule(true)}
                      className="mt-3 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                      data-testid="button-ease-into-sleep"
                    >
                      Begin Ease Into Sleep Module 🌙
                    </button>
                  )}
                  {hasEarnedMoonlightBadge && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#C3C2E0] to-[#E7E6F5] rounded-lg text-center">
                      <p className="text-base font-semibold text-gray-800">
                        🏅 Moonlight Calm
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        You found peace in the quiet.
                      </p>
                    </div>
                  )}
                </>
              ) : guidance.showWiredMindModule ? (
                <>
                  {!hasEarnedRestfulMindBadge && (
                    <button
                      onClick={() => setShowWiredMindModule(true)}
                      className="mt-3 w-full px-4 py-2 bg-[#AEBBCC] hover:bg-[#AEBBCC]/90 text-white rounded-lg transition-colors font-medium"
                      data-testid="button-wired-mind"
                    >
                      Begin Wired Mind Flow 🌙
                    </button>
                  )}
                  {hasEarnedRestfulMindBadge && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#AEBBCC] to-[#E2E7EC] rounded-lg text-center shadow-sm">
                      <p className="text-base font-semibold text-gray-800">
                        🏅 Restful Mind
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        You found peace in stillness.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {guidance.tips ? (
                    <ul className="space-y-2 text-base text-gray-700 dark:text-gray-300">
                      {guidance.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  ) : guidance.tip ? (
                    <p className="text-base text-gray-700 dark:text-gray-300">{guidance.tip}</p>
                  ) : null}

                  {guidance.affirmation && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-base italic text-gray-700 dark:text-gray-300">
                        💫 Affirmation: "{guidance.affirmation}"
                      </p>
                    </div>
                  )}

                  {guidance.showChallenge && !hasEarnedBadge && (
                    <button
                      onClick={() => setShowGroundingChallenge(true)}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      data-testid="button-grounding-challenge"
                    >
                      Try a 1-Minute Grounding Moment 🌿
                    </button>
                  )}

                  {hasEarnedBadge && (
                    <div className="mt-3 p-3 bg-[#A9B89E] bg-opacity-20 border border-[#A9B89E] rounded-lg text-center">
                      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        🏅 Calm in the Storm
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        You paused, breathed, and returned to calm.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Daily Reflection Prompt Component
function DailyReflectionPrompt() {
  const today = new Date();
  const todayReflection = getTodaysReflection();
  
  // Fallback if no reflection found for today
  const fallbackPrompts = [
    "What does balance feel like in your body today?",
    "What one mindful choice can you make right now?",
    "How did your meals support your energy today?",
    "What emotion is asking for your attention?"
  ];
  
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div 
      className="animate-in fade-in duration-500"
      data-testid="daily-reflection-prompt"
    >
      <div 
        className="bg-[#FAFAFA] dark:bg-gray-800 border border-[#E6E6E6] dark:border-gray-700 rounded-xl p-5"
        style={{ animation: 'fadeIn 0.5s ease-in' }}
      >
        {/* Date Header */}
        <div className="text-center mb-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {dayOfWeek} · {monthDay}
          </p>
          {todayReflection?.theme && (
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
              {todayReflection.theme}
            </p>
          )}
        </div>

        {/* Main Reflection */}
        <p className="text-[#555555] dark:text-gray-300 text-base sm:text-lg leading-relaxed font-normal text-center mb-3">
          {todayReflection?.prompt || fallbackPrompts[today.getDay() % fallbackPrompts.length]}
        </p>

        {/* Holiday Observances */}
        {todayReflection?.observances && todayReflection.observances.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
            <div className="space-y-2">
              {todayReflection.observances.map((observance, index) => (
                <p 
                  key={index} 
                  className="text-base sm:text-lg font-semibold text-amber-700 dark:text-amber-400 text-center"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {observance}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="text-base font-medium text-gray-700 dark:text-gray-300 italic mt-4 text-center">
          Pause and reflect for a moment.
        </p>
      </div>
    </div>
  );
}

// Mindfulness Reminder Component
function MindfulnessReminder({ setLocation }: { setLocation: (location: string) => void }) {
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [lastMeditationDate, setLastMeditationDate] = useState<string | null>(null);
  const [daysSinceMeditation, setDaysSinceMeditation] = useState(0);

  useEffect(() => {
    const storedStreak = localStorage.getItem('meditation_streak');
    const storedLastDate = localStorage.getItem('last_meditation_date');
    
    if (storedStreak) setMeditationStreak(parseInt(storedStreak));
    if (storedLastDate) {
      setLastMeditationDate(storedLastDate);
      
      // Calculate days since last meditation
      const today = new Date();
      const lastDate = new Date(storedLastDate);
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDaysSinceMeditation(diffDays);
    }
  }, []);

  // Gentle reminder messages based on days since last meditation
  const getReminderMessage = () => {
    if (!lastMeditationDate) {
      return "Take your first 3-minute meditation break";
    }

    if (daysSinceMeditation === 0) {
      return `${meditationStreak} day streak - add another session today?`;
    }

    if (daysSinceMeditation === 1) {
      return "Continue your mindfulness practice with a quick session";
    }

    if (daysSinceMeditation === 2) {
      return "Want to take 3 minutes to reconnect?";
    }

    if (daysSinceMeditation >= 3) {
      return "No pressure - start fresh when you're ready";
    }

    return "Take 5 minutes to center yourself with guided meditation";
  };

  return (
    <div>
      <p>{getReminderMessage()}</p>
    </div>
  );
}

// Enhanced BM Check-In Component (Improved Flow)
function BmCheckIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Enhanced state management with proper types and persistent outcomes
  type Step = 1 | 2 | 3; // 1=choose yes/no, 2=comfort, 3=last-date
  type Choice = "yes" | "no" | null;
  type Outcome = "idle" | "success" | "tips_ease" | "tips_daily";

  const [step, setStep] = useState<Step>(1);
  const [choice, setChoice] = useState<Choice>(null);
  const [lastDate, setLastDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [comfortSelection, setComfortSelection] = useState<boolean | null>(null);

  // LOCAL UI STATE (persists through refetches)
  const [lastOutcome, setLastOutcome] = useState<Outcome>("idle");
  const [tips, setTips] = useState<string[]>([]);
  const [tipsTitle, setTipsTitle] = useState<string>("");

  // Fetch today's BM log
  const { data: todaysBmLog } = useQuery({
    queryKey: ['/api/bm/today'],
    refetchOnWindowFocus: false,
  });

  function showTips(title: string, items: string[]) {
    setTipsTitle(title);
    setTips(Array.isArray(items) ? items : []);
    setLastOutcome(title.includes("Easier") ? "tips_ease" : "tips_daily");
  }

  function hideTips() {
    setLastOutcome("idle");
    setTips([]);
    setTipsTitle("");
  }

  // Helper function to update weekly activity checklist when BM is completed
  async function updateWeeklyActivityForBM() {
    try {
      // Get current day of week in the format the checklist expects
      const today = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = dayNames[today.getDay()];
      
      // First fetch current weekly data
      const response = await fetch('/api/activity/weekly', { credentials: 'include' });
      if (!response.ok) return; // Fail silently if can't fetch
      
      const weeklyData = await response.json();
      
      // Find current week's data or create default structure
      let currentWeekData = weeklyData.weeks?.find((week: any) => 
        week.isoYear === weeklyData.current?.isoYear && 
        week.isoWeek === weeklyData.current?.isoWeek
      );
      
      // Create default structure if no data exists
      const defaultWeeklyState = {
        Mon: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
        Tue: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
        Wed: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
        Thu: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
        Fri: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
        Sat: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
        Sun: { energy: false, mindfulness: false, movement: false, sleep: false, hydration: false, bm: false },
      };
      
      const payload = currentWeekData?.payload || defaultWeeklyState;
      
      // Update today's BM to true
      if (payload[currentDay]) {
        payload[currentDay].bm = true;
      }
      
      // Save updated data back to server
      await fetch('/api/activity/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payload }),
      });
      
      // Invalidate weekly activity data to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/activity/weekly'] });
      
    } catch (error) {
      console.warn('Failed to update weekly activity for BM:', error);
      // Fail silently - BM check-in should still work even if weekly activity fails
    }
  }

  async function postCheckin(payload: any) {
    const res = await fetch("/api/bm/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to submit BM check-in');
    }
    
    return res.json();
  }

  // STEP 1: choose Yes/No
  function handleChooseYes() {
    hideTips();
    setChoice("yes");
    setComfortSelection(null); // Reset comfort selection
    setStep(2); // go to comfort step
    setStatus("");
  }

  function handleChooseNo() {
    hideTips();
    setChoice("no");
    setComfortSelection(null); // Reset comfort selection
    setStep(3); // show date field
    setStatus("");
  }

  // Handle comfort button click with visual feedback
  function handleComfortClick(comfy: boolean) {
    setComfortSelection(comfy); // Set visual selection immediately
    chooseComfort(comfy); // Then process the selection
  }

  // STEP 2: comfort selection (only for Yes)
  async function chooseComfort(comfy: boolean) {
    setStatus("Saving…");
    
    try {
      const data = await postCheckin({ had_bm_today: true, comfortable: comfy });

      if (data.outcome === "success") {
        setStatus("✅ Logged and comfortable");
        setStep(1);
        setChoice(null);
        setComfortSelection(null);
        setLastOutcome("success");
        
        toast({
          title: "Check-in Complete! 🎯",
          description: "Your comfortable bowel movement has been logged.",
        });
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bm/summary'] });
        
        // Update weekly activity checklist for today's BM
        updateWeeklyActivityForBM();
        return;
      }
      
      if (data.outcome === "tips_ease") {
        setStatus("⚠️ Movement logged (some discomfort) — tips below");
        showTips("Tips for Easier Elimination", data.tips || []);
        
        toast({
          title: "Check-in Complete",
          description: "Your entry has been logged with comfort tips.",
        });
        
        // Invalidate queries - tips will remain visible
        queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bm/summary'] });
        
        // Update weekly activity checklist for today's BM
        updateWeeklyActivityForBM();
        return;
      }
      
      setStatus("✅ Logged");
      setLastOutcome("success");
      setStep(1);
      setChoice(null);
      setComfortSelection(null);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/summary'] });
      
    } catch (error: any) {
      console.error(error);
      setStatus("⚠️ Could not save. Please try again.");
      setStep(1);
      setChoice(null);
      setComfortSelection(null);
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive",
      });
    }
  }

  // STEP 3: last-date submit (only for No)
  async function submitNoToday() {
    if (!lastDate) {
      setStatus("Please pick the last date.");
      return;
    }
    
    setStatus("Saving…");

    try {
      const data = await postCheckin({ had_bm_today: false, last_bm: lastDate });

      // Force showing tips on the NO path
      if (data.outcome === "tips_daily") {
        setStatus("ℹ️ No movement today — tips below");
        showTips("Tips for Encouraging Daily Movements", data.tips || []);
        
        toast({
          title: "Check-in Complete",
          description: "Your entry has been logged with daily movement tips.",
        });
        
        // Invalidate queries - tips will remain visible
        queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bm/summary'] });
        
        // For "No BM today", do NOT mark the weekly checklist as done
        // (only mark it when there WAS a BM)
        return;
      }
      
      setStatus("✅ Logged");
      setLastOutcome("success");
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/summary'] });
      
    } catch (error: any) {
      console.error(error);
      setStatus("⚠️ Could not save. Please try again.");
      setStep(1);
      setChoice(null);
      setLastDate("");
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Optional "Back" for usability
  function goBack() {
    hideTips();
    if (step === 2 || step === 3) {
      setStep(1);
      setChoice(null);
      setComfortSelection(null);
      setStatus("");
      setLastDate("");
    }
  }

  // Reset today's entry mutation  
  const resetTodayMutation = useMutation({
    mutationFn: async () => {
      return await fetch("/api/bm/reset-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bm/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bm/summary'] });
      toast({
        title: "Entry Reset",
        description: "Today's BM entry has been cleared. You can now check in again.",
      });
    },
  });

  // If already logged today, show status (but TIPS HAVE PRIORITY over completed state)
  if (todaysBmLog && (todaysBmLog as any).hasLog && lastOutcome !== "tips_ease" && lastOutcome !== "tips_daily") {
    const log = (todaysBmLog as any).log;
    let statusText = "";
    let statusColor = "";
    
    if (log.hasMovement) {
      if (log.comfortLevel >= 4) {
        statusText = "✅ Comfortable movement logged";
        statusColor = "text-green-600";
      } else if (log.comfortLevel >= 2) {
        statusText = "⚠️ Movement logged (some discomfort)";
        statusColor = "text-yellow-600";
      } else {
        statusText = "⚠️ Movement logged (uncomfortable)";
        statusColor = "text-yellow-600";
      }
    } else {
      statusText = "ℹ️ No movement today - tips provided";
      statusColor = "text-gray-600";
    }

    return (
      <div>
        <p className={statusColor}>{statusText}</p>
        <div className="text-xs text-gray-500 mt-2">
          Check-in complete for today ✓
        </div>
        <div className="mt-3">
          <Btn 
            onClick={() => resetTodayMutation.mutate()} 
            variant="ghost" 
            size="sm"
            disabled={resetTodayMutation.isPending}
            data-testid="button-reset-bm-today"
          >
            🔄 Reset Today's Entry
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Step 1: Yes/No (neither preselected) */}
      {step === 1 && (
        <>
          <p>Did you have a bowel movement today?</p>
          <RowActions>
            <Btn onClick={handleChooseYes} variant="ghost" data-testid="button-bm-yes">Yes</Btn>
            <Btn onClick={handleChooseNo} variant="ghost" data-testid="button-bm-no">No</Btn>
          </RowActions>
        </>
      )}

      {/* Step 2: Comfort (shown only after Yes) */}
      {step === 2 && (
        <>
          <p>Was it comfortable?</p>
          <RowActions>
            <Btn 
              onClick={() => handleComfortClick(true)} 
              variant={comfortSelection === true ? "primary" : "ghost"} 
              data-testid="button-bm-comfortable"
            >
              Comfortable
            </Btn>
            <Btn 
              onClick={() => handleComfortClick(false)} 
              variant={comfortSelection === false ? "primary" : "ghost"} 
              data-testid="button-bm-uncomfortable"
            >
              Not Comfortable
            </Btn>
          </RowActions>
          <div className="mt-2">
            <Btn onClick={goBack} variant="ghost" size="sm" data-testid="button-bm-back">← Back</Btn>
          </div>
        </>
      )}

      {/* Step 3: Last date (shown only after No) */}
      {step === 3 && (
        <>
          <p>When was your last bowel movement?</p>
          <div className="mt-2">
            <input 
              type="date" 
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
              data-testid="input-bm-last-date"
            />
          </div>
          <div className="mt-2" style={{ gap: 8 }}>
            <Btn onClick={submitNoToday} data-testid="button-bm-submit">Save & Show Tips</Btn>
            <Btn onClick={goBack} variant="ghost" size="sm" data-testid="button-bm-back">← Back</Btn>
          </div>
        </>
      )}

      {/* Status line */}
      {status && <div className="text-sm text-muted-foreground mt-2" data-testid="text-bm-status">{status}</div>}

      {/* TIPS HAVE PRIORITY OVER "COMPLETED" STATE */}
      {(lastOutcome === "tips_ease" || lastOutcome === "tips_daily") && (
        <div className="mt-3 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-600">
          <strong>{tipsTitle}</strong>
          <ul className="mt-2 ml-4 space-y-1">
            {(tips.length ? tips : ["(no tips returned)"]).map((t, i) => <li key={i} className="text-sm">{t}</li>)}
          </ul>
          <div className="mt-3">
            <a href="/content/BM_Why_It_Matters.html" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline">
              Learn more: Why regular bowel movements matter
            </a>
          </div>
          <div className="mt-3">
            <Btn onClick={hideTips} data-testid="button-dismiss-tips">
              Dismiss tips
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// Exercise Reminder Component
function ExerciseReminder({ setLocation }: { setLocation: (location: string) => void }) {
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  // Fetch exercise data
  const { data: exerciseLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/exercise-logs"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (exerciseLogs.length > 0) {
      const today = new Date().toDateString();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Calculate today's minutes
      const todayExercise = exerciseLogs.filter((log: any) => {
        return new Date(log.loggedAt).toDateString() === today;
      });
      const todayTotal = todayExercise.reduce((sum: number, log: any) => sum + (log.duration || 0), 0);
      setTodayMinutes(todayTotal);

      // Calculate weekly minutes
      const weeklyExercise = exerciseLogs.filter((log: any) => {
        return new Date(log.loggedAt) >= weekAgo;
      });
      const weeklyTotal = weeklyExercise.reduce((sum: number, log: any) => sum + (log.duration || 0), 0);
      setWeeklyMinutes(weeklyTotal);
    }
  }, [exerciseLogs]);

  const getMessage = () => {
    if (todayMinutes > 0) {
      return `Great! ${todayMinutes} minutes today. Weekly progress: ${weeklyMinutes}/150 min`;
    }
    return "Even 10 minutes of walking can make a difference";
  };

  return (
    <div>
      <p>{getMessage()}</p>
    </div>
  );
}

// Quick Sleep Log Component  
function QuickSleepLog({ setLocation }: { setLocation: (location: string) => void }) {
  const { data: recentSleepLogs = [] } = useQuery({
    queryKey: ['/api/sleep-logs'],
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <p>Track your rest for better balance</p>
    </div>
  );
}

// Wearables Summary Component (using existing logic)
function WearablesDataInsights() {
  return <WearablesSummary />;
}

// Hydration Component (using existing logic)
function HydrationComponent() {
  return <HydrationSection />;
}

// BM Stats Component
function BmStats() {
  const { data: bmSummary } = useQuery({
    queryKey: ['/api/bm/summary'],
    refetchOnWindowFocus: false,
  });

  if (!bmSummary) return null;

  const summary = (bmSummary as any)?.summary;
  
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
        {summary.daysTracked} Days Tracked
      </div>
      <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
        {summary.regularDaysPct}% Regular Days
      </div>
      <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium">
        {summary.comfortablePct}% Comfortable
      </div>
      <div className="bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium">
        Daily Recommended
      </div>
    </div>
  );
}

// Weekly Insight Cards Component
function WeeklyInsightCard() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const insightCards = [
    {
      tip: "Did you know slow breathing helps steady glucose response?",
      detail: "Deep, controlled breathing activates the parasympathetic nervous system, reducing stress hormones that can spike blood sugar."
    },
    {
      tip: "Stretching for two minutes lowers cortisol levels.",
      detail: "Gentle stretching releases muscle tension and signals your body to shift from stress mode to rest mode."
    },
    {
      tip: "Walking after meals improves glucose uptake by 30%.",
      detail: "Just 10-15 minutes of light walking helps muscles absorb glucose more efficiently, preventing post-meal spikes."
    },
    {
      tip: "Hydration supports stable blood sugar throughout the day.",
      detail: "Water helps kidneys flush out excess glucose and prevents dehydration-related blood sugar elevation."
    },
    {
      tip: "Quality sleep improves insulin sensitivity by up to 25%.",
      detail: "7-8 hours of restful sleep helps your body use insulin more effectively, supporting better glucose control."
    },
    {
      tip: "Mindful eating reduces glucose spikes by 15-20%.",
      detail: "Eating slowly and chewing thoroughly improves digestion and allows for more gradual glucose absorption."
    }
  ];

  useEffect(() => {
    // Check if card was dismissed this week
    const today = new Date();
    const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
    const dismissedWeek = localStorage.getItem('weekly_insight_dismissed');
    
    if (dismissedWeek === weekNumber.toString()) {
      setIsVisible(false);
    } else {
      // Rotate card based on week number
      setCurrentCardIndex(weekNumber % insightCards.length);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date();
    const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
    localStorage.setItem('weekly_insight_dismissed', weekNumber.toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentCard = insightCards[currentCardIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#F0F4F0] to-[#E8F1E8] rounded-xl p-6 shadow-sm border border-[#A9B89E]/20"
      data-testid="weekly-insight-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <h3 className="text-base font-bold text-[#5C6E5C] dark:text-[#A9B89E]">Weekly Wellness Insight</h3>
        </div>
      </div>
      
      <p className="text-base font-semibold text-gray-800 mb-3">
        {currentCard.tip}
      </p>
      
      <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
        {currentCard.detail}
      </p>
      
      <motion.button
        onClick={handleDismiss}
        className="px-4 py-2 bg-white border border-[#A9B89E] text-[#5C6E5C] rounded-lg text-sm font-bold hover:bg-[#A9B89E] hover:text-white transition-colors flex items-center gap-1"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="button-dismiss-insight"
      >
        Got it 💚
      </motion.button>
    </motion.div>
  );
}

// Mood Insights Dashboard Component
function MoodInsightsDashboard() {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  
  // Fetch mood/energy data from Journey API
  const { data: moodEnergyData, isLoading } = useQuery({
    queryKey: ['/api/journey/mood-energy'],
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  const weekData = (moodEnergyData as any)?.weekData || [];
  
  // Generate insights based on data
  const generateInsights = () => {
    if (weekData.length === 0) return ["Track your mood and energy to see personalized insights."];
    
    const insights = [];
    const moodScores: { [key: string]: number[] } = {};
    
    // Group mood scores by day of week
    weekData.forEach((day: any) => {
      const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!moodScores[dayName]) moodScores[dayName] = [];
      if (day.mood) moodScores[dayName].push(day.mood);
    });
    
    // Find best day
    let bestDay = '';
    let highestAvg = 0;
    Object.entries(moodScores).forEach(([day, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestDay = day;
      }
    });
    
    if (bestDay) {
      insights.push(`You feel most calm on ${bestDay}s.`);
    }
    
    // Energy trend
    const recentEnergy = weekData.slice(-3).map((d: any) => d.energy).filter(Boolean);
    if (recentEnergy.length >= 2) {
      const isRising = recentEnergy[recentEnergy.length - 1] > recentEnergy[0];
      if (isRising) {
        insights.push("Energy up 3 days straight — keep it going!");
      }
    }
    
    return insights.length > 0 ? insights : ["Track consistently to unlock personalized insights."];
  };

  const insights = generateInsights();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      data-testid="mood-insights-dashboard"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Mood & Energy Insights</h3>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600"
          data-testid="select-time-filter"
        >
          <option value="all">All Day</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
      </div>

      {/* Simple trend visualization */}
      <div className="mb-6 h-32 relative">
        <svg viewBox="0 0 280 100" className="w-full h-full">
          {/* Mood line (sage) */}
          {weekData.length > 1 && (
            <motion.polyline
              points={weekData.map((d: any, i: number) => 
                `${i * 40 + 10},${90 - (d.mood || 50)}`
              ).join(' ')}
              fill="none"
              stroke="#A9B89E"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}
          {/* Energy line (blue) */}
          {weekData.length > 1 && (
            <motion.polyline
              points={weekData.map((d: any, i: number) => 
                `${i * 40 + 10},${90 - (d.energy || 50)}`
              ).join(' ')}
              fill="none"
              stroke="#8B9DC3"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
            />
          )}
        </svg>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#A9B89E]"></div>
            <span className="text-gray-600">Mood</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#8B9DC3]"></div>
            <span className="text-gray-600">Energy</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
            className="flex items-start gap-2 text-base font-bold text-gray-800"
          >
            <span className="text-[#A9B89E] mt-0.5">✦</span>
            <p>{insight}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Daily insight state - always show a proverb
  const [todayInsight, setTodayInsight] = useState<{ theme: string; text: string } | null>(null);

  // Get today's proverb on mount - always load from insights.ts
  useEffect(() => {
    import('@/data/insights').then(({ insights }) => {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const dailyProverb = insights[dayOfYear % insights.length];
      setTodayInsight(dailyProverb);
      console.log('✅ Daily proverb loaded:', dailyProverb);
    }).catch((error) => {
      console.error('❌ Failed to load daily proverb:', error);
      // Fallback to localStorage if import fails
      const storedInsight = localStorage.getItem('todayInsight');
      if (storedInsight) {
        try {
          setTodayInsight(JSON.parse(storedInsight));
        } catch (e) {
          console.error('Failed to parse stored insight:', e);
        }
      }
    });
  }, []);
  
  // Time-of-day greeting states
  const [showMorningGreeting, setShowMorningGreeting] = useState(false);
  const [showMiddayGreeting, setShowMiddayGreeting] = useState(false);
  const [showEveningGreeting, setShowEveningGreeting] = useState(false);
  const [showNighttimeGreeting, setShowNighttimeGreeting] = useState(false);
  const [showSleepMode, setShowSleepMode] = useState(false);
  const [isMorning, setIsMorning] = useState(false);
  const [isMidday, setIsMidday] = useState(false);
  const [isEvening, setIsEvening] = useState(false);
  const [isNighttime, setIsNighttime] = useState(false);
  const [isSleepMode, setIsSleepMode] = useState(false);

  // Stage 6: Premium Onboarding Carousel
  const [showPremiumOnboarding, setShowPremiumOnboarding] = useState(false);

  // Get user profile to check onboarding status
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user
  });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && userProfile && !(userProfile as any).onboardingCompleted) {
      setLocation('/onboarding');
    }
  }, [user, userProfile, setLocation]);

  // Check if user has seen premium onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('premiumOnboardingSeen');
    if (!hasSeenOnboarding && user) {
      // Show after a brief delay
      const timer = setTimeout(() => {
        setShowPremiumOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Check if it's morning (5:30 AM - 10:00 AM)
  const checkMorning = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const morningStart = 5 * 60 + 30; // 5:30 AM
    const morningEnd = 10 * 60; // 10:00 AM
    return timeInMinutes >= morningStart && timeInMinutes < morningEnd;
  };

  // Check if it's midday (11:30 AM - 3:00 PM)
  const checkMidday = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const middayStart = 11 * 60 + 30; // 11:30 AM
    const middayEnd = 15 * 60; // 3:00 PM
    return timeInMinutes >= middayStart && timeInMinutes < middayEnd;
  };

  // Check if it's evening (6:00 PM - 8:00 PM)
  const checkEvening = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const eveningStart = 18 * 60; // 6:00 PM
    const eveningEnd = 20 * 60; // 8:00 PM
    return timeInMinutes >= eveningStart && timeInMinutes < eveningEnd;
  };

  // Check if it's nighttime (8:00 PM - 12:00 AM)
  const checkNighttime = () => {
    const hour = new Date().getHours();
    return hour >= 20 && hour < 24;
  };

  // Check if it's sleep mode (12:00 AM - 5:30 AM)
  const checkSleepMode = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const sleepModeStart = 0; // 12:00 AM
    const sleepModeEnd = 5 * 60 + 30; // 5:30 AM
    return timeInMinutes >= sleepModeStart && timeInMinutes < sleepModeEnd;
  };

  // Get user's first name
  const getUserName = () => {
    if (user && typeof user === 'object' && 'firstName' in user && user.firstName) return user.firstName as string;
    return "there";
  };

  // Get personalized greeting based on time of day
  const getPersonalizedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const name = getUserName();

    // Morning: 5:30 AM - 10:00 AM
    if (timeInMinutes >= 5 * 60 + 30 && timeInMinutes < 10 * 60) {
      return `Good morning, ${name}. How's your energy today?`;
    }
    // Midday: 11:00 AM - 3:00 PM
    else if (timeInMinutes >= 11 * 60 && timeInMinutes < 15 * 60) {
      return `Midday pause, ${name} — take a breath and reset.`;
    }
    // Evening: 6:00 PM - 8:00 PM
    else if (timeInMinutes >= 18 * 60 && timeInMinutes < 20 * 60) {
      return `Good evening, ${name}. Let's wind down with gratitude.`;
    }
    // Night: 8:00 PM - 12:00 AM
    else if (hour >= 20 && hour < 24) {
      return `Rest well, ${name}. You've done enough for today.`;
    }
    // Default for other times
    else {
      return `Welcome back, ${name}.`;
    }
  };

  // Track page view
  useEffect(() => {
    trackPageView('home');
  }, []);

  // Initialize time-of-day greetings
  useEffect(() => {
    const morning = checkMorning();
    const midday = checkMidday();
    const evening = checkEvening();
    const nighttime = checkNighttime();
    const sleepMode = checkSleepMode();
    
    setIsMorning(morning);
    setIsMidday(midday);
    setIsEvening(evening);
    setIsNighttime(nighttime);
    setIsSleepMode(sleepMode);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Show morning greeting if it's morning time
    if (morning) {
      const morningGreetingShown = localStorage.getItem(`morning_greeting_${today}`);
      
      if (!morningGreetingShown) {
        const timer = setTimeout(() => {
          setShowMorningGreeting(true);
          localStorage.setItem(`morning_greeting_${today}`, 'true');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Show midday greeting if it's midday time
    if (midday && !morning) {
      const middayGreetingShown = localStorage.getItem(`midday_greeting_${today}`);
      
      if (!middayGreetingShown) {
        const timer = setTimeout(() => {
          setShowMiddayGreeting(true);
          localStorage.setItem(`midday_greeting_${today}`, 'true');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Show evening greeting if it's evening time
    if (evening && !morning && !midday) {
      const eveningGreetingShown = localStorage.getItem(`evening_greeting_${today}`);
      
      if (!eveningGreetingShown) {
        const timer = setTimeout(() => {
          setShowEveningGreeting(true);
          localStorage.setItem(`evening_greeting_${today}`, 'true');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Show nighttime greeting if it's nighttime
    if (nighttime && !morning && !midday && !evening) {
      const nighttimeGreetingShown = localStorage.getItem(`nighttime_greeting_${today}`);
      
      if (!nighttimeGreetingShown) {
        const timer = setTimeout(() => {
          setShowNighttimeGreeting(true);
          localStorage.setItem(`nighttime_greeting_${today}`, 'true');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Show sleep mode if it's sleep time
    if (sleepMode) {
      const sleepModeShown = localStorage.getItem(`sleep_mode_${today}`);
      
      if (!sleepModeShown) {
        const timer = setTimeout(() => {
          setShowSleepMode(true);
          localStorage.setItem(`sleep_mode_${today}`, 'true');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleMorningGreetingComplete = () => {
    setShowMorningGreeting(false);
  };

  const handleMiddayGreetingComplete = () => {
    setShowMiddayGreeting(false);
  };

  const handleEveningGreetingComplete = () => {
    setShowEveningGreeting(false);
  };

  const handleNighttimeGreetingComplete = () => {
    setShowNighttimeGreeting(false);
  };

  const handleSleepModeComplete = () => {
    setShowSleepMode(false);
  };

  // Determine background gradient based on time of day
  const getBackgroundClass = () => {
    if (isSleepMode) {
      return 'bg-gradient-to-br from-[#2A2A2A] via-[#383838] to-[#404040]';
    }
    if (isMorning) {
      return 'bg-gradient-to-br from-[#F4E9D8] via-[#FFEBD1] to-[#FFF8E3]';
    }
    if (isMidday) {
      return 'bg-gradient-to-br from-[#FFFDF8] via-[#E8F1E3] to-[#DDEBF6]';
    }
    if (isEvening) {
      return 'bg-gradient-to-br from-[#FFFEF8] via-[#E8DDE8] to-[#D0D4D8]';
    }
    if (isNighttime) {
      return 'bg-gradient-to-br from-[#FAFAFA] via-[#E9EEF0] to-[#C8D1D8]';
    }
    return '';
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 ${getBackgroundClass()}`}>
      {/* Stage 6: Premium Onboarding Carousel */}
      {showPremiumOnboarding && (
        <PremiumOnboardingCarousel
          onComplete={() => setShowPremiumOnboarding(false)}
          onSkip={() => setShowPremiumOnboarding(false)}
        />
      )}

      {/* Time-of-Day Greeting Animations */}
      <AnimatePresence>
        {showMorningGreeting && (
          <MorningGreeting 
            userName={getUserName()} 
            onComplete={handleMorningGreetingComplete}
          />
        )}
        {showMiddayGreeting && (
          <MiddayResetGreeting 
            onComplete={handleMiddayGreetingComplete}
          />
        )}
        {showEveningGreeting && (
          <EveningGreeting 
            userName={getUserName()} 
            onComplete={handleEveningGreetingComplete}
          />
        )}
        {showNighttimeGreeting && (
          <NighttimeGreeting 
            userName={getUserName()} 
            onComplete={handleNighttimeGreetingComplete}
          />
        )}
        {showSleepMode && (
          <SleepMode 
            onComplete={handleSleepModeComplete}
          />
        )}
      </AnimatePresence>

      <Header />
      
      {/* Skip links for accessibility */}
      <a href="#main-content" className="skip-link focus-visible-enhanced" data-testid="skip-to-main">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link focus-visible-enhanced" data-testid="skip-to-nav">
        Skip to navigation
      </a>

      <nav id="navigation" className="sr-only">
        <p>Navigation content available via bottom navigation bar</p>
      </nav>

      <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-32 flex-1" id="main-content">
        <div className="text-center py-6 px-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-600 mb-3">GlycoGuide</h1>
          <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100">Your Health Management Dashboard</p>
          
          {/* Personalized Daily Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="mt-4 mx-auto max-w-md"
          >
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium" data-testid="text-personalized-greeting">
              {getPersonalizedGreeting()}
            </p>
          </motion.div>
        </div>
        
        {/* Daily Reflection - with holiday/religious observances */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Card title="Daily Reflection" icon="✨">
            <DailyReflectionPrompt />
          </Card>
        </div>

        {/* Quick Health Check - Fast access to vital tracking */}
        <div className="mb-4 sm:mb-6 md:mb-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-blue-600 dark:text-white text-center mb-4 sm:mb-5 md:mb-6">🩺 Quick Health Check</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setLocation('/blood-pressure/logs')}
              className="flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
              data-testid="button-quick-blood-pressure"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg">Blood Pressure</span>
            </button>
            <button
              onClick={() => setLocation('/blood-sugar/logs')}
              className="flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
              data-testid="button-quick-blood-sugar"
            >
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg">Blood Sugar</span>
            </button>
          </div>
        </div>
        
        {/* Adaptive Wellness Insights - Phase 5 */}
        <AdaptiveWellnessInsights />
        
        {/* Mood-to-Action Guidance - Phase 5 */}
        <MoodToActionGuidance />
        
        {/* Vertical stack with responsive spacing */}
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 pb-24 sm:pb-32">
        
        <JourneyTracker />
        
        <CommunityReflectionFeed />
        
        <GuidedCommunityCircles />
        
        <WeeklyInsightCard />
        
        <MoodInsightsDashboard />
        
        <WeeklyActivityChecklist />
        
        <Card title="Enhanced Weekly Health Tracker" icon="📈">
          <EnhancedWeeklyChecklist />
        </Card>
        
        <Card title="Mood & Energy Insights" icon="💭">
          <MoodEnergyQuickLog />
        </Card>

        <Card title="Digestive Wellness" icon="🎯" footer={<BmStats />}>
          <BmCheckIn />
        </Card>

        <Card title="Daily Mindfulness" icon="🧘" footer={<RowActions><Btn onClick={() => setLocation('/mindfulness')} data-testid="button-open-mindfulness">Start Gratitude Practice (7 min)</Btn></RowActions>}>
          <div className="text-base text-gray-900 dark:text-white">
            <p className="mb-2 font-bold">Wind down your day with a calming gratitude meditation.</p>
            <p className="italic font-semibold">Perfect for evening relaxation and better sleep.</p>
          </div>
        </Card>

        <Card title="Evening Meditation" icon="🌙" footer={<RowActions><Btn onClick={() => setLocation('/evening-wind-down')} data-testid="button-evening-meditation">Start Session (3 min)</Btn></RowActions>}>
          <MindfulnessReminder setLocation={setLocation} />
        </Card>

        <Card title="Daily Movement" icon="🚶" footer={<RowActions><Btn onClick={() => setLocation('/movement')} data-testid="button-open-movement">Log First Activity</Btn><Btn onClick={() => setLocation('/movement-education')} data-testid="button-movement-hub-link" className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950">Learn More</Btn></RowActions>}>
          <ExerciseReminder setLocation={setLocation} />
        </Card>

        <Card title="Sleep Wellness" icon="🌙" footer={<RowActions><Btn onClick={() => setLocation('/sleep')} data-testid="button-quick-sleep-log">Log Sleep</Btn></RowActions>}>
          <QuickSleepLog setLocation={setLocation} />
        </Card>

        <Card title="Daily Hydration" icon="💧">
          <HydrationComponent />
        </Card>

        <Card title="Blood Pressure Tracking" icon="❤️">
          <BloodPressureSection />
        </Card>

        <Card title="Blood Sugar Tracking" icon="💉">
          <BloodSugarSection />
        </Card>

        <Card title="Wearable Device Tracking" icon="📊">
          <WearablesDataInsights />
        </Card>

        <Card title="Today's Insight" icon="🌞">
          {todayInsight ? (
            <div className="space-y-2">
              <p className="text-base font-bold text-gray-900 dark:text-white">{todayInsight.theme}</p>
              <p className="text-base italic text-gray-700 dark:text-gray-300">"{todayInsight.text}"</p>
            </div>
          ) : (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          )}
        </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}