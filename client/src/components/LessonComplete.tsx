import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle, ArrowRight, BookOpen, Home, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LessonCompleteProps {
  type: 'module' | 'path' | 'article';
  pathTitle?: string;
  articleTitle?: string;
  quizScore?: number;
  quizTotal?: number;
  onContinue: () => void;
  onReturnToModules: () => void;
}

// Generate celebration chime sound using Web Audio API
const playChimeSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create a pleasant three-note chime (C-E-G major chord)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      // Stagger notes slightly for pleasant effect
      const startTime = now + index * 0.15;
      
      // Fade in and out for smooth sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.8);
    });
  } catch (error) {
    // Silent fail if Web Audio API not supported
    console.log('Audio playback not available');
  }
};

export default function LessonComplete({ 
  type, 
  pathTitle,
  articleTitle, 
  quizScore,
  quizTotal,
  onContinue, 
  onReturnToModules 
}: LessonCompleteProps) {
  const [, setLocation] = useLocation();
  const [soundOn, setSoundOn] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Play celebration sound on mount
    if (soundOn) {
      playChimeSound();
    }
    
    // Auto-hide confetti after 3s
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [soundOn]);

  const isPathComplete = type === 'path';
  const isArticleComplete = type === 'article';
  const hasQuiz = quizScore !== undefined && quizTotal !== undefined;
  const quizPercentage = hasQuiz ? Math.round((quizScore / quizTotal) * 100) : 0;

  return (
    <>
      {/* Confetti Overlay - Non-blocking */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-8xl"
              style={{ pointerEvents: 'none' }}
            >
              🎉
            </motion.div>
            {/* Floating sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, x: 0, opacity: 1 }}
                animate={{
                  y: -200 + Math.random() * 100,
                  x: (Math.random() - 0.5) * 300,
                  opacity: 0,
                }}
                transition={{ duration: 2, delay: i * 0.2 }}
                className="absolute text-3xl"
                style={{
                  left: '50%',
                  top: '50%',
                  pointerEvents: 'none'
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card
          className="p-8 max-w-xl mx-auto text-center bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-950 shadow-lg rounded-3xl"
          data-testid="lesson-complete-card"
        >
          <CardContent className="space-y-6">
            {/* Sound Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="text-gray-500 hover:text-green-700 dark:hover:text-green-400 text-sm transition-colors"
                data-testid="button-toggle-sound"
                aria-label={soundOn ? "Mute sound" : "Unmute sound"}
              >
                {soundOn ? "🔊" : "🔇"}
              </button>
            </div>

            {/* Icon with Pulse & Glow */}
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(34, 197, 94, 0))",
                    "drop-shadow(0 0 20px rgba(34, 197, 94, 0.6))",
                    "drop-shadow(0 0 0px rgba(34, 197, 94, 0))",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {isPathComplete ? (
                  <Trophy className="w-20 h-20 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-20 h-20 text-green-500" />
                )}
              </motion.div>
            </div>

            {/* Header */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-semibold text-green-800 dark:text-green-200"
            >
              {isPathComplete ? "🎉 Learning Path Complete!" : isArticleComplete ? "📄 Article Complete!" : "🌟 Module Complete!"}
            </motion.h2>

            {/* Reflection Line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="italic text-green-700 dark:text-green-300 text-lg"
            >
              "Growth happens one mindful moment at a time 🌱"
            </motion.p>

            {/* Progress Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Progress value={100} className="h-3" />
              
              {/* Quiz Score Display */}
              {hasQuiz && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-700"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Quiz Score</h3>
                  </div>
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="text-3xl font-bold text-green-600 dark:text-green-400"
                  >
                    {quizScore} / {quizTotal}
                  </motion.p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quizPercentage}% correct
                  </p>
                </motion.div>
              )}
              
              {isPathComplete && pathTitle ? (
                <p className="text-gray-700 dark:text-gray-300">
                  Congratulations! You've completed <strong>{pathTitle}</strong>
                </p>
              ) : isArticleComplete && articleTitle ? (
                <p className="text-gray-700 dark:text-gray-300">
                  Well done! You've finished <strong>{articleTitle}</strong>
                </p>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  Great job! Ready for the next module in your learning journey?
                </p>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col gap-3 mt-6"
              style={{ pointerEvents: 'auto' }}
            >
              {isPathComplete ? (
                <>
                  <Button
                    onClick={onContinue}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    data-testid="button-return-paths"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Return to Learning Paths
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/education")}
                    className="text-green-700 dark:text-green-400 border-green-500 w-full"
                    data-testid="button-library"
                  >
                    Browse Library
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      console.log('🏠 Return Home button clicked - navigating to /');
                      // Use direct navigation to ensure it works
                      window.location.href = "/";
                    }}
                    className="text-gray-600 dark:text-gray-400 w-full"
                    data-testid="button-home"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Return Home
                  </Button>
                </>
              ) : isArticleComplete ? (
                <>
                  <Button
                    onClick={() => setLocation("/education")}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    data-testid="button-return-library"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Return to Library
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={onContinue}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    data-testid="button-next-module"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue to Next Module
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onReturnToModules}
                    className="text-green-700 dark:text-green-400 border-green-500 w-full"
                    data-testid="button-review-modules"
                  >
                    Review All Modules
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      console.log('🏠 Return Home button clicked - navigating to /');
                      // Use direct navigation to ensure it works
                      window.location.href = "/";
                    }}
                    className="text-gray-600 dark:text-gray-400 w-full"
                    data-testid="button-home"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Return Home
                  </Button>
                </>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
