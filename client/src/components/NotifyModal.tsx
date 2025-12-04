import { useState } from "react";
import { motion } from "framer-motion";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotifyModalProps {
  open: boolean;
  onClose: () => void;
  type: string;
}

export default function NotifyModal({ open, onClose, type }: NotifyModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail("");
    }, 1800);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="notify-modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative"
        data-testid="notify-modal"
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          data-testid="button-close-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Stay Updated on {type} Content
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter your email to be notified when new {type.toLowerCase()} materials go live.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-notify">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                data-testid="input-email"
              />
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                data-testid="button-subscribe"
              >
                Subscribe
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8" data-testid="success-message">
            <Mail className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">You'll be notified soon!</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
