import { motion } from "framer-motion";
import { Sun, Star } from "lucide-react";

interface RewardCard30Props {
  onClose: () => void;
  quote?: string | null;
}

const RewardCard30: React.FC<RewardCard30Props> = ({ onClose, quote }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="overlay-reward-card-30"
    >
      <motion.div
        className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-amber-900/30 dark:to-yellow-900/30 dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4 relative border border-amber-200 dark:border-amber-700"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        data-testid="card-reward-30"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <Sun className="w-12 h-12 text-amber-500 dark:text-amber-400" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          🌞 30-Day Milestone
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          You've shown <strong>30 days of dedication</strong> —
          transformation is taking root.  
          Your presence and commitment are becoming your power.
        </p>

        {quote && (
          <p className="text-gray-600 dark:text-gray-400 italic text-sm mb-6">
            "{quote}"
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          data-testid="button-continue-flow"
        >
          Continue in Flow
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-6 left-0 right-0 flex justify-center"
        >
          <Star className="text-yellow-400 dark:text-yellow-500 w-6 h-6" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RewardCard30;
