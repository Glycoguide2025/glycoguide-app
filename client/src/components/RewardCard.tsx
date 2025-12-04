import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";

interface RewardCardProps {
  onClose: () => void;
  quote?: string | null;
}

const RewardCard: React.FC<RewardCardProps> = ({ onClose, quote }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-testid="overlay-reward-card"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center max-w-sm mx-4 relative"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        data-testid="card-reward"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <Sparkles className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          7-Day Streak 🌿
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          You've shown <strong>7 days</strong> of consistency —
          your energy, focus, and mindfulness are growing stronger.
          Keep showing up for yourself.
        </p>

        {quote && (
          <p className="text-gray-500 dark:text-gray-400 italic text-sm mb-6">
            "{quote}"
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          data-testid="button-continue-journey"
        >
          Continue Your Journey
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-6 left-0 right-0 flex justify-center"
        >
          <Heart className="text-pink-400 dark:text-pink-500 w-5 h-5" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RewardCard;
