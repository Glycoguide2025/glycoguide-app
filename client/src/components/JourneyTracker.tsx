import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Award, Sprout, Compass, Sparkles } from "lucide-react";

interface JourneyData {
  currentStreak: number;
  moodEnergyData: Array<{
    date: string;
    mood: number;
    energy: number;
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }>;
  insights: {
    energyTrend: string;
    moodTrend: string;
  };
  // Stage 6: Gentle gamification level
  level: {
    current: 'rooted' | 'centered' | 'radiant';
    progress: number;
    nextThreshold: number;
    affirmation: string;
    activityCount: number;
  };
}

// Helper function to get level icon and color
const getLevelInfo = (level: 'rooted' | 'centered' | 'radiant') => {
  switch (level) {
    case 'rooted':
      return {
        icon: Sprout,
        color: '#A9B89E',
        gradient: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
        name: 'Rooted'
      };
    case 'centered':
      return {
        icon: Compass,
        color: '#8B9DC3',
        gradient: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20',
        name: 'Centered'
      };
    case 'radiant':
      return {
        icon: Sparkles,
        color: '#E6C068',
        gradient: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20',
        name: 'Radiant'
      };
    default:
      return {
        icon: Sprout,
        color: '#A9B89E',
        gradient: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
        name: 'Rooted'
      };
  }
};

export default function JourneyTracker() {
  const { data: journeyData, isLoading } = useQuery<JourneyData>({
    queryKey: ['/api/journey-tracker'],
  });

  if (isLoading) {
    return (
      <Card className="bg-[#FAFAFA] dark:bg-gray-800 rounded-xl p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  if (!journeyData) {
    return null;
  }

  // Map mood/energy enum values to numbers for charting
  const moodMap: Record<string, number> = {
    very_low: 1,
    low: 2,
    neutral: 3,
    good: 4,
    excellent: 5
  };

  const energyMap: Record<string, number> = {
    very_low: 1,
    low: 2,
    moderate: 3,
    high: 4,
    very_high: 5
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-[#FAFAFA] dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" data-testid="card-journey-tracker">
        <div className="space-y-6">
          {/* Header with Streak Counter */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#A9B89E]" />
              Journey Tracker
            </h3>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 px-4 py-2 rounded-lg"
              data-testid="container-streak-counter"
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-streak-count">
                  {journeyData.currentStreak}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">day streak</p>
              </div>
            </motion.div>
          </div>

          {/* Stage 6: Gentle Gamification Level Display */}
          {journeyData.level && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`bg-gradient-to-r ${getLevelInfo(journeyData.level.current).gradient} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}
              data-testid="container-level-display"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const LevelIcon = getLevelInfo(journeyData.level.current).icon;
                    return <LevelIcon className="w-7 h-7" style={{ color: getLevelInfo(journeyData.level.current).color }} />;
                  })()}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200" data-testid="text-level-name">
                      {getLevelInfo(journeyData.level.current).name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {journeyData.level.activityCount} wellness activities
                    </p>
                  </div>
                </div>
              </div>

              {/* Affirmation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-700 dark:text-gray-300 mb-4 italic"
                data-testid="text-level-affirmation"
              >
                {journeyData.level.affirmation}
              </motion.p>

              {/* Progress Bar (only for non-Radiant levels) */}
              {journeyData.level.current !== 'radiant' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progress to {journeyData.level.current === 'rooted' ? 'Centered' : 'Radiant'}</span>
                    <span>{journeyData.level.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${journeyData.level.progress}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                      className="h-3 rounded-full transition-all"
                      style={{ backgroundColor: getLevelInfo(journeyData.level.current).color }}
                      data-testid="progress-bar-level"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 7-Day Mood & Energy Chart */}
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">7-Day Progress</h4>
            {journeyData.moodEnergyData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={journeyData.moodEnergyData}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '16px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      name="Mood"
                      stroke="#A9B89E"
                      strokeWidth={3}
                      dot={{ fill: '#A9B89E', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energy"
                      stroke="#8B9DC3"
                      strokeWidth={3}
                      dot={{ fill: '#8B9DC3', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No data available yet. Start logging your mood and energy!</p>
              </div>
            )}
          </div>

          {/* Insights */}
          {journeyData.insights && (journeyData.insights.energyTrend || journeyData.insights.moodTrend) && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg" data-testid="container-insights">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {journeyData.insights.energyTrend && (
                  <span data-testid="text-energy-insight">{journeyData.insights.energyTrend}</span>
                )}
                {journeyData.insights.energyTrend && journeyData.insights.moodTrend && " "}
                {journeyData.insights.moodTrend && (
                  <span data-testid="text-mood-insight">{journeyData.insights.moodTrend}</span>
                )}
              </p>
            </div>
          )}

          {/* Badge Gallery */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#A9B89E]" />
              Badges Earned
            </h4>
            {journeyData.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3" data-testid="container-badges">
                {journeyData.badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    data-testid={`badge-${badge.id}`}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-[#A9B89E] text-gray-700 dark:text-gray-200 font-medium hover:bg-[#A9B89E]/10 transition-colors cursor-default"
                    >
                      <span className="text-lg mr-2">🏆</span>
                      {badge.name}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200" data-testid="text-no-badges">
                Complete wellness activities to earn your first badge!
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
