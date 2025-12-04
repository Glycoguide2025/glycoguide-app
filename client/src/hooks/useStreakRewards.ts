import { useEffect, useState } from "react";
import { rewardQuotes } from "@/data/rewardQuotes";
import { useSound } from "@/hooks/useSound";

// Ambient sounds for each milestone
const SOUND_MAP: Record<number, string> = {
  7: "/sounds/wind-chime.mp3",      // soft chime — gentle awareness
  30: "/sounds/flute-tone.mp3",     // light flute — harmony & flow
  60: "/sounds/ocean-breeze.mp3",   // ocean wave — deep balance
  90: "/sounds/deep-hum.mp3",       // resonant hum — embodied mastery
};

interface RewardState {
  day: number | null;
  show: boolean;
  quote: string | null;
  close: () => void;
}

/**
 * 🌿 useStreakRewards Hook
 * Handles streak milestones and returns state for reward modals.
 */
export function useStreakRewards(currentStreak: number): RewardState {
  const [rewardDay, setRewardDay] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [soundSrc, setSoundSrc] = useState<string | null>(null);
  
  // Load last shown milestone from localStorage to persist across refreshes
  const [lastShownMilestone, setLastShownMilestone] = useState<number>(() => {
    const saved = localStorage.getItem('lastShownMilestone');
    return saved ? parseInt(saved, 10) : 0;
  });

  // 🎵 Play ambient sound when milestone is triggered
  useSound(soundSrc, { volume: 0.6 });

  useEffect(() => {
    if (!currentStreak) return;

    const milestones = [7, 30, 60, 90];
    
    // Find the highest milestone the user has reached but hasn't seen yet
    const unlockedMilestone = milestones
      .filter(m => currentStreak >= m && m > lastShownMilestone)
      .sort((a, b) => a - b)[0]; // Get the lowest unlocked milestone first

    if (unlockedMilestone) {
      setRewardDay(unlockedMilestone);
      setShow(true);
      setLastShownMilestone(unlockedMilestone);
      
      // Save to localStorage
      localStorage.setItem('lastShownMilestone', unlockedMilestone.toString());

      // 🌿 Pick random quote from the bank
      const quotes = rewardQuotes[unlockedMilestone];
      if (quotes) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
      }

      // 🎵 Set sound for this milestone
      setSoundSrc(SOUND_MAP[unlockedMilestone] || null);
    }
  }, [currentStreak, lastShownMilestone]);

  const close = () => {
    setShow(false);
    setRewardDay(null);
    setQuote(null);
    setSoundSrc(null); // Stop sound when closing
  };

  return { day: rewardDay, show, quote, close };
}
