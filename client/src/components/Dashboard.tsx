import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Heart, Sun, Moon, CloudSun, Leaf, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { EducationProgress } from "@shared/schema";
import { useStreakRewards } from "@/hooks/useStreakRewards";
import RewardCard from "@/components/RewardCard";
import RewardCard30 from "@/components/RewardCard30";
import RewardCard60 from "@/components/RewardCard60";
import RewardCard90 from "@/components/RewardCard90";

interface Activity {
  id: string;
  title: string;
  type: "lesson" | "quiz";
  completedAt: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
}

interface JourneyTrackerData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [greeting, setGreeting] = useState("");
  const [icon, setIcon] = useState(<Sun className="w-7 h-7 text-blue-500" />);
  const [showCelebration, setShowCelebration] = useState(false);

  // 🌞 Greeting logic based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setIcon(<Sun className="w-7 h-7 text-blue-500" />);
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setIcon(<CloudSun className="w-7 h-7 text-yellow-500" />);
    } else {
      setGreeting("Good evening");
      setIcon(<Moon className="w-7 h-7 text-indigo-400" />);
    }
  }, []);

  // 🌿 Fetch user's learning progress from GlycoGuide backend
  const { data: learningProgress = [] } = useQuery<EducationProgress[]>({
    queryKey: ["/api/education/progress"],
    enabled: isAuthenticated,
  });

  // 👤 Fetch user profile data
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: isAuthenticated,
  });

  // 🔥 Fetch journey tracker for streak data
  const { data: journeyData } = useQuery<JourneyTrackerData>({
    queryKey: ["/api/journey-tracker"],
    enabled: isAuthenticated,
  });

  // Calculate overall progress percentage
  const calculateProgress = (): number => {
    if (!learningProgress || learningProgress.length === 0) return 0;
    
    const completed = learningProgress.filter(p => p.status === 'completed').length;
    const total = learningProgress.length;
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Get recent activities (top 3 completed items)
  const getRecentActivities = (): Activity[] => {
    if (!learningProgress) return [];
    
    return learningProgress
      .filter(p => p.status === 'completed' && p.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3)
      .map(p => ({
        id: p.id.toString(),
        title: p.contentId.toString(), // Will be enhanced when we join with content
        type: "lesson" as const,
        completedAt: p.completedAt ? (typeof p.completedAt === 'string' ? p.completedAt : p.completedAt.toISOString()) : new Date().toISOString(),
      }));
  };

  // Get next lesson to continue
  const getNextLesson = () => {
    if (!learningProgress) return null;
    
    // Find first in-progress or not-started item
    const nextItem = learningProgress.find(
      p => p.status === 'in_progress' || p.status === 'not_started'
    );
    
    return nextItem;
  };

  const progress = calculateProgress();
  const activities = getRecentActivities();
  const nextLesson = getNextLesson();
  const streak = journeyData?.currentStreak || 0;
  
  // Get user's display name
  const userName = profile?.displayName || 
                   profile?.firstName || 
                   user?.email?.split('@')[0] || 
                   "there";

  // 🌿 Streak rewards hook (handles 7-day and 30-day milestones)
  const { day: rewardDay, show: showRewardModal, quote, close: closeRewardModal } = useStreakRewards(streak);

  // 🎉 100-day celebration (generic milestone)
  useEffect(() => {
    if (streak === 100) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  // Handle Continue Learning click
  const handleContinueLearning = () => {
    setLocation('/education');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10"
    >
      {/* 🌞 Greeting Header with Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2" data-testid="text-greeting">
            {icon}
            {greeting}, {userName} 🌿
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You're doing great — keep nourishing your mind and body.
          </p>
        </div>
        
        {/* Profile Avatar */}
        <div 
          className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden flex items-center justify-center border-2 border-blue-200 dark:border-blue-800"
          data-testid="avatar-profile"
        >
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt="Profile avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <Leaf className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          )}
        </div>
      </motion.div>

      {/* 📈 Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Your Progress
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You've completed <strong data-testid="text-progress-percentage">{progress}%</strong> of your learning path.
            </p>
          </div>
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                stroke="#3B82F6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                strokeDasharray="339.292"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🚀 Next Step Card - Continue Learning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between"
      >
        <div>
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-1">
            Continue Your Journey
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {nextLesson 
              ? "Resume where you left off and deepen your mindful learning."
              : "Explore new learning paths to expand your wellness journey."}
          </p>
        </div>
        <Button 
          onClick={handleContinueLearning}
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2 px-6 rounded-full"
          data-testid="button-continue-learning"
        >
          Continue Learning <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* 🕊️ Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-green-500 w-5 h-5" /> Recent Activity
        </h3>

        {activities.length > 0 ? (
          <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm" data-testid="list-recent-activities">
            {activities.map((a) => (
              <li key={a.id} data-testid={`activity-${a.id}`}>
                {a.type === "lesson" ? "📘" : "🧩"} Completed content{" "}
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  ({new Date(a.completedAt).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-sm" data-testid="text-no-activities">
            Start your first lesson to see your progress here.
          </p>
        )}
      </motion.div>

      {/* 🏅 Achievements & Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Heart className="text-pink-500 w-5 h-5" /> Achievements
        </h3>
        <div className="flex flex-wrap gap-3" data-testid="container-achievements">
          {/* Progress-based badges */}
          {progress >= 25 && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-mindful-starter">
              🌿 Mindful Starter
            </span>
          )}
          {progress >= 50 && (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-halfway-hero">
              💪 Halfway Hero
            </span>
          )}
          {progress >= 100 && (
            <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-fully-awakened">
              🏆 Fully Awakened
            </span>
          )}
          
          {/* 🔥 Animated Streak Badge */}
          {streak > 0 && (
            <motion.span
              key={streak} // triggers animation on change
              initial={{ scale: 1, boxShadow: "0 0 0px rgba(255,165,0,0)" }}
              animate={{
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 0px rgba(255,165,0,0)",
                  "0 0 12px rgba(255,165,0,0.5)",
                  "0 0 0px rgba(255,165,0,0)",
                ],
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              data-testid="badge-streak"
            >
              🔥 {streak}-Day Streak
            </motion.span>
          )}
          
          {/* Starting message */}
          {progress === 0 && streak === 0 && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-journey-start">
              Every journey begins with one step 🌿
            </span>
          )}
        </div>
      </motion.div>

      {/* 🌙 Closing Message */}
      <div className="text-center mt-10 text-gray-500 dark:text-gray-400 italic text-sm">
        Every small step matters. Trust your journey. 🌙
      </div>

      {/* 🌿 Streak Reward Cards (7, 30, 60, & 90 days) */}
      {showRewardModal && rewardDay === 7 && <RewardCard onClose={closeRewardModal} quote={quote} />}
      {showRewardModal && rewardDay === 30 && <RewardCard30 onClose={closeRewardModal} quote={quote} />}
      {showRewardModal && rewardDay === 60 && <RewardCard60 onClose={closeRewardModal} quote={quote} />}
      {showRewardModal && rewardDay === 90 && <RewardCard90 onClose={closeRewardModal} quote={quote} />}

      {/* 🎉 Milestone Celebration Overlay (100 days) */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-md mx-4"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1.2, 1.2, 1],
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
            >
              <div className="text-8xl mb-4">🎉</div>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Amazing Milestone!
            </h2>
            <p className="text-xl text-orange-600 dark:text-orange-400 font-semibold mb-4">
              🔥 {streak}-Day Streak! 🔥
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              You're building incredible momentum. Keep going! 🌿
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
