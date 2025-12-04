import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface WellnessPattern {
  topMood?: string;
  avgEnergy?: string;
  insights: string[];
}

export function AdaptiveWellnessInsights() {
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [lastShownWeek, setLastShownWeek] = useState<string>('');

  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedInsights');
    const lastWeek = localStorage.getItem('insightsLastShown');
    
    if (dismissed) {
      setDismissedInsights(JSON.parse(dismissed));
    }
    if (lastWeek) {
      setLastShownWeek(lastWeek);
    }
  }, []);

  const { data: patterns } = useQuery<{ patterns: WellnessPattern }>({
    queryKey: ['/api/wellness/insights'],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return `${now.getFullYear()}-W${Math.ceil(days / 7)}`;
  };

  const currentWeek = getCurrentWeek();
  
  // Reset dismissed insights weekly
  useEffect(() => {
    if (currentWeek !== lastShownWeek) {
      setDismissedInsights([]);
      setLastShownWeek(currentWeek);
      localStorage.setItem('insightsLastShown', currentWeek);
      localStorage.removeItem('dismissedInsights');
    }
  }, [currentWeek, lastShownWeek]);

  const handleDismiss = (insight: string) => {
    const newDismissed = [...dismissedInsights, insight];
    setDismissedInsights(newDismissed);
    localStorage.setItem('dismissedInsights', JSON.stringify(newDismissed));
  };

  // Save insights to history when first shown (Phase 5)
  useEffect(() => {
    if (patterns?.patterns?.insights && patterns.patterns.insights.length > 0) {
      const savedInsights = JSON.parse(localStorage.getItem('savedInsights') || '[]');
      
      patterns.patterns.insights.forEach((insight: string) => {
        if (!savedInsights.includes(insight)) {
          // Save to database
          apiRequest('/api/insights/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              insightText: insight,
              category: 'pattern', // Can be enhanced to detect category
            }),
          }).catch(err => console.error('Failed to save insight to history:', err));
          
          // Track in localStorage
          savedInsights.push(insight);
        }
      });
      
      localStorage.setItem('savedInsights', JSON.stringify(savedInsights));
    }
  }, [patterns?.patterns?.insights]);

  if (!patterns?.patterns?.insights || patterns.patterns.insights.length === 0) {
    return null;
  }

  const visibleInsights = patterns.patterns.insights.filter(
    insight => !dismissedInsights.includes(insight)
  );

  if (visibleInsights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="adaptive-wellness-insights">
      <AnimatePresence>
        {visibleInsights.map((insight, index) => (
          <motion.div
            key={insight}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative bg-gradient-to-r from-[#F0F4F0] to-[#E8F1E8] dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-4 border border-[#A9B89E]/30 dark:border-gray-600"
            data-testid={`insight-card-${index}`}
          >
            <button
              onClick={() => handleDismiss(insight)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss insight"
              data-testid={`button-dismiss-insight-${index}`}
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 pr-8">
              <div className="flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-[#A9B89E]" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                  {insight}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
