import { motion } from "framer-motion";
import { Crown, HeartHandshake } from "lucide-react";

interface RewardCard90Props {
  onClose: () => void;
  quote?: string | null;
}

const RewardCard90: React.FC<RewardCard90Props> = ({ onClose, quote }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-testid="overlay-reward-card-90"
    >
      <motion.div
        className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-yellow-900/30 dark:to-amber-900/30 dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4 border border-yellow-300 dark:border-yellow-700 relative"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        data-testid="card-reward-90"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <Crown className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          🌞 90-Day Mastery
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Ninety days of devotion — you've become your own teacher.
          The journey is no longer about change, but about presence.
        </p>

        {quote && (
          <p className="text-gray-600 dark:text-gray-400 italic text-sm mb-6">
            "{quote}"
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          data-testid="button-return-journey"
        >
          Return to Journey
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-6 left-0 right-0 flex justify-center"
        >
          <HeartHandshake className="text-yellow-400 dark:text-yellow-500 w-6 h-6" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RewardCard90;
