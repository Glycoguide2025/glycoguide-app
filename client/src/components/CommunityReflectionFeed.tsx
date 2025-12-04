import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Heart, Send, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { playSound } from '@/utils/soundCues';
import { analyzeSentiment } from '@/utils/sentimentAnalysis';

interface CommunityReflection {
  id: string;
  content: string;
  mood?: string;
  encouragementCount: number;
  createdAt: Date;
  hasUserEncouraged: boolean;
}

export function CommunityReflectionFeed() {
  const { toast } = useToast();
  const [showShareForm, setShowShareForm] = useState(false);
  const [newReflection, setNewReflection] = useState('');

  // Analyze sentiment as user types
  const sentiment = useMemo(() => {
    const aiEnabled = localStorage.getItem('ai_reflection_enabled') !== 'false';
    if (!aiEnabled || newReflection.trim().length < 10) return null;
    return analyzeSentiment(newReflection);
  }, [newReflection]);

  // Fetch reflections
  const { data: reflections = [], isLoading } = useQuery<CommunityReflection[]>({
    queryKey: ['/api/community/reflections'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create reflection mutation
  const createReflectionMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('/api/community/reflections', 'POST', { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/reflections'] });
      playSound('save'); // Gentle chime for save action
      toast({
        title: "Reflection shared 💚",
        description: "Your moment has been added to the community feed",
      });
      setNewReflection('');
      setShowShareForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Could not share",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Encourage reflection mutation
  const encourageMutation = useMutation({
    mutationFn: async (reflectionId: string) => {
      return await apiRequest(`/api/community/reflections/${reflectionId}/encourage`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/reflections'] });
    },
  });

  const handleShare = () => {
    if (newReflection.trim().length === 0) {
      toast({
        title: "Empty reflection",
        description: "Please write something to share",
        variant: "destructive",
      });
      return;
    }

    if (newReflection.length > 200) {
      toast({
        title: "Too long",
        description: "Reflections must be 200 characters or less",
        variant: "destructive",
      });
      return;
    }

    createReflectionMutation.mutate(newReflection);
  };

  const handleEncourage = (reflectionId: string) => {
    encourageMutation.mutate(reflectionId);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            💭 Community Reflections
          </h3>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Anonymous moments shared with care
          </p>
        </div>
        {!showShareForm && (
          <motion.button
            onClick={() => {
              playSound('reflection'); // Whoosh sound for opening panel
              setShowShareForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A9B89E] hover:bg-[#98A78D] text-white text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-share-reflection"
          >
            <Send className="w-3.5 h-3.5" />
            Share
          </motion.button>
        )}
      </div>

      {/* Share Form */}
      <AnimatePresence>
        {showShareForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-[#F9FAFB] dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share a wellness moment anonymously 🕊️
                </p>
                <button
                  onClick={() => {
                    setShowShareForm(false);
                    setNewReflection('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  data-testid="button-close-share-form"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                placeholder="Today, I'm grateful for..."
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-[#A9B89E] focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                rows={3}
                data-testid="textarea-reflection-content"
              />

              {/* Emotional Feedback */}
              <AnimatePresence>
                {sentiment && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-[#A9B89E]/10 to-[#8B9DC3]/10 border border-[#A9B89E]/20"
                    data-testid="emotional-feedback"
                  >
                    <Sparkles className="w-4 h-4 text-[#A9B89E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#5C5044]/80 italic">
                      {sentiment.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newReflection.length}/200
                </span>
                <motion.button
                  onClick={handleShare}
                  disabled={createReflectionMutation.isPending}
                  className="px-4 py-2 bg-[#A9B89E] hover:bg-[#98A78D] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="button-submit-reflection"
                >
                  {createReflectionMutation.isPending ? 'Sharing...' : 'Share Anonymously'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflections List */}
      {reflections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-800 dark:text-gray-200 text-base font-semibold">
            No reflections yet. Be the first to share! 💚
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.map((reflection) => (
            <motion.div
              key={reflection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FAFAFA] dark:bg-gray-700/50 rounded-lg p-4"
              data-testid={`reflection-${reflection.id}`}
            >
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                "{reflection.content}"
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatDistanceToNow(new Date(reflection.createdAt), { addSuffix: true })}
                </span>
                
                <motion.button
                  onClick={() => handleEncourage(reflection.id)}
                  disabled={encourageMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    reflection.hasUserEncouraged
                      ? 'bg-[#A9B89E] text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#E8F1E8] dark:hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`button-encourage-${reflection.id}`}
                >
                  <Heart 
                    className={`w-4 h-4 ${reflection.hasUserEncouraged ? 'fill-current' : ''}`} 
                  />
                  <span>{reflection.encouragementCount > 0 ? reflection.encouragementCount : 'Send'} 💚</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 text-center italic">
        Reflections disappear after 48 hours 🌙
      </p>
    </div>
  );
}
