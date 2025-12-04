import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface AmbientAudioPlayerProps {
  affirmation: string;
  audioType?: 'sleep' | 'calm' | 'breathe';
  autoPlay?: boolean;
  compact?: boolean;
}

export function AmbientAudioPlayer({ 
  affirmation, 
  audioType = 'calm',
  autoPlay = false,
  compact = false
}: AmbientAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      playAudio();
    }
  }, [autoPlay]);

  const getAudioConfig = () => {
    switch (audioType) {
      case 'sleep':
        return { frequency: 220, type: 'sine' as OscillatorType, volume: 0.15 }; // Low A note
      case 'breathe':
        return { frequency: 440, type: 'sine' as OscillatorType, volume: 0.12 }; // A note
      case 'calm':
      default:
        return { frequency: 330, type: 'sine' as OscillatorType, volume: 0.1 }; // E note
    }
  };

  const playAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const config = getAudioConfig();
      
      // Create oscillator for ambient tone
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      oscillatorRef.current.type = config.type;
      oscillatorRef.current.frequency.setValueAtTime(
        config.frequency,
        audioContextRef.current.currentTime
      );

      // Gentle fade-in (1s)
      gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(
        isMuted ? 0 : config.volume,
        audioContextRef.current.currentTime + 1
      );

      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      oscillatorRef.current.start();
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const stopAudio = () => {
    if (oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
      // Gentle fade-out (1s)
      gainNodeRef.current.gain.linearRampToValueAtTime(
        0,
        audioContextRef.current.currentTime + 1
      );
      
      setTimeout(() => {
        oscillatorRef.current?.stop();
        oscillatorRef.current?.disconnect();
        gainNodeRef.current?.disconnect();
        oscillatorRef.current = null;
        gainNodeRef.current = null;
      }, 1000);
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const toggleMute = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      const config = getAudioConfig();
      const newVolume = isMuted ? config.volume : 0;
      gainNodeRef.current.gain.linearRampToValueAtTime(
        newVolume,
        audioContextRef.current.currentTime + 0.3
      );
      setIsMuted(!isMuted);
    }
  };

  if (compact) {
    return (
      <motion.button
        onClick={togglePlay}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F4F0] hover:bg-[#E8F1E8] text-[#5C6E5C] text-sm font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="button-listen-affirmation"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>🎧 Listen</span>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={togglePlay}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0F4F0] hover:bg-[#E8F1E8] text-[#5C6E5C] font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="button-play-affirmation"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>🎧 {isPlaying ? 'Pause' : 'Listen'}</span>
      </motion.button>

      <AnimatePresence>
        {isPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleMute}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="button-mute-audio"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#5C6E5C]" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="flex gap-1"
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[#A9B89E] rounded-full"
                  animate={{
                    height: [8, 16, 8],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
            <span className="text-xs text-gray-500 italic">Ambient calm</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
