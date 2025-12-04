import { motion } from "framer-motion";
import { Wind, Moon } from "lucide-react";

interface RewardCard60Props {
  onClose: () => void;
  quote?: string | null;
}

const RewardCard60: React.FC<RewardCard60Props> = ({ onClose, quote }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="overlay-reward-card-60"
    >
      <motion.div
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900/30 dark:to-blue-900/30 dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4 relative border border-indigo-200 dark:border-indigo-700"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        data-testid="card-reward-60"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <Wind className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          🌬️ 60-Day Harmony
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Two months of awareness — your energy now moves effortlessly with life's flow.
          You have found strength in stillness.
        </p>

        {quote && (
          <p className="text-gray-600 dark:text-gray-400 italic text-sm mb-6">
            "{quote}"
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          data-testid="button-continue-flow-60"
        >
          Continue in Flow
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute -bottom-6 left-0 right-0 flex justify-center"
        >
          <Moon className="text-indigo-400 dark:text-indigo-500 w-6 h-6" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RewardCard60;
