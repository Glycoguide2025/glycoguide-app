// Sound Cues System - Gentle emotional UX feedback using Web Audio API

type SoundType = 'save' | 'reflection' | 'badge' | 'success' | 'action';

interface SoundSettings {
  enabled: boolean;
}

// Get sound settings from localStorage
const getSoundSettings = (): SoundSettings => {
  const settings = localStorage.getItem('soundSettings');
  if (settings) {
    return JSON.parse(settings);
  }
  return { enabled: true }; // Default: enabled
};

// Save sound settings to localStorage
export const setSoundEnabled = (enabled: boolean) => {
  const settings: SoundSettings = { enabled };
  localStorage.setItem('soundSettings', JSON.stringify(settings));
};

// Check if sounds are enabled
export const isSoundEnabled = (): boolean => {
  return getSoundSettings().enabled;
};

// Play gentle chime for save actions (C major chord - peaceful)
export const playChime = () => {
  if (!isSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  // Create a gentle chime using three notes from C major chord
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine'; // Soft, pure tone
    
    // Gentle fade in and out
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02); // Very quiet
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    oscillator.start(now + index * 0.1); // Stagger notes slightly
    oscillator.stop(now + 0.5);
  });
};

// Play whoosh sound for reflection panel (descending tone)
export const playWhoosh = () => {
  if (!isSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Descending frequency for whoosh effect
  oscillator.frequency.setValueAtTime(800, now);
  oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
  
  oscillator.type = 'sine';
  
  // Quick fade in, sustained, then fade out
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.06, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.06, now + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  
  oscillator.start(now);
  oscillator.stop(now + 0.4);
};

// Play subtle tone for badge unlock (ascending celebration)
export const playBadgeUnlock = () => {
  if (!isSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  // Ascending melody: E5 → G5 → C6 (triumphant but gentle)
  const melody = [
    { freq: 659.25, start: 0, duration: 0.15 },     // E5
    { freq: 783.99, start: 0.12, duration: 0.15 },  // G5
    { freq: 1046.50, start: 0.24, duration: 0.3 }   // C6 (hold)
  ];
  
  melody.forEach(note => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = note.freq;
    oscillator.type = 'sine';
    
    const startTime = now + note.start;
    const endTime = startTime + note.duration;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
    
    oscillator.start(startTime);
    oscillator.stop(endTime);
  });
};

// Play simple success tone (single note)
export const playSuccess = () => {
  if (!isSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 783.99; // G5 - positive, uplifting
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  
  oscillator.start(now);
  oscillator.stop(now + 0.3);
};

// Play gentle tap/click sound for actions
export const playTap = () => {
  if (!isSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 523.25; // C5 - neutral, pleasant
  oscillator.type = 'sine';
  
  // Very brief tap
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  
  oscillator.start(now);
  oscillator.stop(now + 0.1);
};

// Play sound based on type
export const playSound = (type: SoundType) => {
  switch (type) {
    case 'save':
      playChime();
      break;
    case 'reflection':
      playWhoosh();
      break;
    case 'badge':
      playBadgeUnlock();
      break;
    case 'success':
      playSuccess();
      break;
    case 'action':
      playTap();
      break;
    default:
      console.warn(`Unknown sound type: ${type}`);
  }
};
