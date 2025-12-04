import { useCallback, useRef } from "react";

// Stage 7: Sound Identity - 3-note chime and emotional sound cues
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play 3-note welcome chime (C-E-G major triad)
  const playWelcomeChime = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      // Note frequencies (C5, E5, G5)
      const notes = [523.25, 659.25, 783.99];
      const noteDuration = 0.3;
      const noteGap = 0.15;

      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sine wave for gentle, calming tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);

        // Envelope: fade in and out
        const startTime = now + (index * noteGap);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);
      });
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  // Play badge unlock sparkle sound (ascending arpeggio)
  const playBadgeUnlock = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      // Ascending frequencies for celebration
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const noteDuration = 0.2;
      const noteGap = 0.08;

      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, now);

        const startTime = now + (index * noteGap);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
        gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);
      });
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  // Gentle notification sound (single soft tone)
  const playNotification = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now); // A5

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4);

      oscillator.start(now);
      oscillator.stop(now + 0.4);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  return {
    playWelcomeChime,
    playBadgeUnlock,
    playNotification,
  };
}
