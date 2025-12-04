import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface ActionGuidance {
  trigger: string;
  title: string;
  description: string;
  actions: Array<{
    label: string;
    icon: string;
    link?: string;
    onClick?: () => void;
  }>;
  color: string;
  emoji: string;
}

interface MoodEnergyState {
  mood?: string;
  energy?: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

// Get time of day
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
};

// Generate action guidance based on mood and energy
const getActionGuidance = (state: MoodEnergyState): ActionGuidance | null => {
  const { mood, energy, timeOfDay } = state;

  // Low energy in the morning
  if (energy && energy <= 2 && timeOfDay === 'morning') {
    return {
      trigger: 'low_energy_morning',
      title: "Gentle Morning Energizers",
      description: "Start your day with gentle, grounding activities to build energy naturally.",
      emoji: "🌅",
      color: "#E8F1E3",
      actions: [
        { label: "5-min stretching", icon: "🧘", link: "/movement-education" },
        { label: "Hydrate (8oz water)", icon: "💧" },
        { label: "Step outside", icon: "🌤️" },
        { label: "Light breakfast", icon: "🍳", link: "/recipes" }
      ]
    };
  }

  // Low energy in afternoon
  if (energy && energy <= 2 && timeOfDay === 'afternoon') {
    return {
      trigger: 'low_energy_afternoon',
      title: "Midday Reset",
      description: "Beat the afternoon slump with these quick energy boosters.",
      emoji: "☕",
      color: "#FFF8E3",
      actions: [
        { label: "10-min walk", icon: "🚶", link: "/movement-education" },
        { label: "Healthy snack", icon: "🍎", link: "/recipes" },
        { label: "Power nap (20min)", icon: "😴" },
        { label: "Breathing exercise", icon: "🌬️", link: "/mindfulness" }
      ]
    };
  }

  // Stressed or anxious mood
  if (mood && (mood === 'low' || mood === 'very_low')) {
    return {
      trigger: 'stressed_mood',
      title: "Stress Relief Toolkit",
      description: "Take a moment to calm your mind and reset your nervous system.",
      emoji: "🍃",
      color: "#E8F1E3",
      actions: [
        { label: "5-min breathing", icon: "🧘", link: "/mindfulness" },
        { label: "Gratitude practice", icon: "💚", link: "/gratitude" },
        { label: "Calming tea", icon: "🍵" },
        { label: "Journal feelings", icon: "📝" }
      ]
    };
  }

  // High energy - encourage movement
  if (energy && energy >= 4) {
    return {
      trigger: 'high_energy',
      title: "Channel Your Energy",
      description: "You're feeling great! Use this momentum for wellness activities.",
      emoji: "⚡",
      color: "#DDEBF6",
      actions: [
        { label: "Quick workout", icon: "💪", link: "/movement-education" },
        { label: "Plan healthy meal", icon: "🥗", link: "/recipes" },
        { label: "Outdoor activity", icon: "🏃" },
        { label: "Set a wellness goal", icon: "🎯" }
      ]
    };
  }

  // Evening wind down - with context-aware reflection
  if (timeOfDay === 'evening') {
    // Determine reflection action based on mood
    let reflectionAction = { label: "Reflect on day", icon: "💭", link: "/gratitude" };
    
    if (mood === 'low' || mood === 'very_low') {
      // Awful day - process emotions and release
      reflectionAction = { label: "Release & let go", icon: "📝", link: "/gratitude" };
    } else if (mood === 'neutral' || !mood) {
      // Normal day - simple reflection
      reflectionAction = { label: "Note your day", icon: "💭", link: "/gratitude" };
    } else {
      // Great day - gratitude practice
      reflectionAction = { label: "Count blessings", icon: "💚", link: "/gratitude" };
    }
    
    return {
      trigger: 'evening_routine',
      title: "Evening Wind Down",
      description: "Prepare your body and mind for restful sleep.",
      emoji: "🌙",
      color: "#E8DDE8",
      actions: [
        { label: "Evening meditation", icon: "🧘", link: "/evening-wind-down" },
        { label: "Gentle stretching", icon: "🤸", link: "/movement-education" },
        reflectionAction,
        { label: "Sleep prep", icon: "😴", link: "/sleep" }
      ]
    };
  }

  return null;
};

export function MoodToActionGuidance() {
  // Fetch latest mood and energy data
  const { data: latestMood } = useQuery<any>({
    queryKey: ['/api/reflections/latest'],
  });

  const { data: latestEnergy } = useQuery<any>({
    queryKey: ['/api/energy-checkin/today'],
  });

  const timeOfDay = getTimeOfDay();
  
  const state: MoodEnergyState = {
    mood: latestMood?.mood,
    energy: latestEnergy?.physical || latestEnergy?.energy,
    timeOfDay
  };

  const guidance = getActionGuidance(state);

  if (!guidance) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="card-mood-action-guidance"
    >
      <Card 
        className="text-center" 
        style={{ backgroundColor: guidance.color }}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-[#A9B89E]" />
            <span>{guidance.emoji} {guidance.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-white text-center">
            {guidance.description}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {guidance.actions.map((action, index) => (
              action.link ? (
                <Link key={index} href={action.link}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 hover:bg-[#A9B89E] hover:text-white transition-colors"
                    data-testid={`button-action-${index}`}
                  >
                    <span>{action.icon}</span>
                    <span className="text-xs">{action.label}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 hover:bg-[#A9B89E] hover:text-white transition-colors"
                  onClick={action.onClick}
                  data-testid={`button-action-${index}`}
                >
                  <span>{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </Button>
              )
            ))}
          </div>

          {/* Subtle encouragement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 italic text-center mt-3"
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Small steps lead to lasting change 💚
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
