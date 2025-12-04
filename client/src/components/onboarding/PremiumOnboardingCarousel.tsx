import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';
import { useLocation } from 'wouter';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  emoji: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Welcome",
    subtitle: "Your wellness journey begins here",
    description: "GlycoGuide was created with you in mind — to make balanced living simple, supportive, and sustainable.",
    gradient: "from-[#F4E9D8] via-[#FFEBD1] to-[#FFF8E3]",
    emoji: "🌅"
  },
  {
    id: 2,
    title: "Breathe",
    subtitle: "Take a moment to center yourself",
    description: "Wellness isn't about perfection. It's about presence. One gentle step at a time.",
    gradient: "from-[#F0F4F0] via-[#E8F1E8] to-[#E0F2E0]",
    emoji: "🍃"
  },
  {
    id: 3,
    title: "Let's Begin",
    subtitle: "Your personalized dashboard awaits",
    description: "Track your wellness, discover low-glycemic meals, and build habits that feel good.",
    gradient: "from-[#E8F1E3] via-[#DDEBF6] to-[#D8E9F5]",
    emoji: "💚"
  }
];

interface PremiumOnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function PremiumOnboardingCarousel({ onComplete, onSkip }: PremiumOnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Mark onboarding as seen and complete
      localStorage.setItem('premiumOnboardingSeen', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('premiumOnboardingSeen', 'true');
    onSkip();
  };

  const slide = slides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      data-testid="premium-onboarding-carousel"
    >
      <div className="relative w-full max-w-2xl mx-4">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm"
          data-testid="button-skip-premium-onboarding"
        >
          <span>Skip</span>
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className={`bg-gradient-to-br ${slide.gradient} rounded-3xl p-12 shadow-2xl`}
            data-testid={`slide-${slide.id}`}
          >
            {/* Emoji icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <span className="text-7xl" role="img" aria-label={slide.title}>
                {slide.emoji}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold text-center text-gray-800 dark:text-gray-900 mb-3"
              data-testid={`text-title-${slide.id}`}
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-center text-gray-600 dark:text-gray-700 mb-6"
              data-testid={`text-subtitle-${slide.id}`}
            >
              {slide.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg text-center text-gray-700 dark:text-gray-800 mb-12 max-w-xl mx-auto leading-relaxed"
              data-testid={`text-description-${slide.id}`}
            >
              {slide.description}
            </motion.p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentSlide 
                      ? 'w-8 bg-[#A9B89E]' 
                      : 'w-2 bg-gray-400/50'
                  }`}
                  data-testid={`progress-dot-${index}`}
                />
              ))}
            </div>

            {/* Next/Complete button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-[#A9B89E] hover:bg-[#98A78D] text-white px-8 py-6 text-lg rounded-full shadow-lg transition-all hover:scale-105"
                data-testid="button-next-slide"
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Continue
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  "Begin Your Journey 💚"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
