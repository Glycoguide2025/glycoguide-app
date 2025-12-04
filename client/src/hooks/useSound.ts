import { useEffect } from "react";

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

/**
 * 🌿 useSound Hook
 * Plays a soft, ambient tone for milestones or experiences.
 * Automatically cleans up when component unmounts or src changes.
 */
export function useSound(src: string | null, options: SoundOptions = {}) {
  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.volume = options.volume ?? 0.5;
    audio.loop = options.loop ?? false;
    audio.play().catch(() => {
      // Silently fail if audio file doesn't exist or can't play
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src, options.volume, options.loop]);
}
