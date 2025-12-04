import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const { playWelcomeChime } = useSoundEffects();

  useEffect(() => {
    // Play welcome chime on mount
    playWelcomeChime();

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 600); // Wait for exit animation
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete, playWelcomeChime]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#FAFAFA] via-[#F0F4F0] to-[#E8F1E3]"
          style={{ pointerEvents: 'none' }}
          data-testid="startup-animation"
        >
          {/* Circular pulse with vine unfurl */}
          <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute w-32 h-32 rounded-full bg-[#A9B89E]/20"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.4, 1.2], opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeInOut" }}
              className="absolute w-40 h-40 rounded-full bg-[#A9B89E]/15"
            />

            {/* Center vine/leaf icon */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
              className="relative z-10"
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Stylized leaf/vine */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                  d="M32 8C32 8 16 24 16 40C16 48.8366 23.1634 56 32 56C40.8366 56 48 48.8366 48 40C48 24 32 8 32 8Z"
                  stroke="#A9B89E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
                  d="M32 20C32 20 24 28 24 36"
                  stroke="#8B9DC3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </motion.div>

            {/* Brand name fade-in */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeInOut" }}
              className="absolute -bottom-16 text-center"
            >
              <h1 className="text-2xl font-semibold text-[#5C5044] tracking-wide">
                GlycoGuide
              </h1>
              <p className="text-sm text-[#5C5044]/60 mt-1">
                Your wellness companion
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
