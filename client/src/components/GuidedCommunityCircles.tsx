import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import CommunityCirclesComingSoon from '@/components/CommunityCirclesComingSoon';

interface Circle {
  id: string;
  title: string;
  prompt: string;
  theme: string;
  weekStart: string;
  weekEnd: string;
  participantCount: number;
}

interface Participation {
  id: string;
  circleId: string;
  userId: string;
  response: string;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
  userName?: string;
}

export function GuidedCommunityCircles() {
  const [response, setResponse] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();

  const { data: currentCircle, isLoading } = useQuery<Circle>({
    queryKey: ['/api/community/circles/current'],
  });

  const { data: participations = [] } = useQuery<Participation[]>({
    queryKey: ['/api/community/circles/participations', currentCircle?.id],
    enabled: !!currentCircle,
  });

  const participateMutation = useMutation({
    mutationFn: async (data: { circleId: string; response: string; isAnonymous: boolean }) => {
      return await apiRequest('POST', '/api/community/circles/participate', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/circles/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/circles/participations'] });
      setResponse('');
      toast({
        title: 'Response shared!',
        description: 'Your reflection has been added to this week\'s circle.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to share',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!response.trim() || !currentCircle) return;
    
    participateMutation.mutate({
      circleId: currentCircle.id,
      response: response.trim(),
      isAnonymous,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!currentCircle) {
    return <CommunityCirclesComingSoon />;
  }

  const themeColors = {
    mindfulness: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    nutrition: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    challenges: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    gratitude: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
    wellness: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
  };

  const gradientClass = themeColors[currentCircle.theme as keyof typeof themeColors] || themeColors.wellness;

  return (
    <div className="space-y-4" data-testid="guided-community-circles">
      {/* Circle Prompt Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${gradientClass} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
        data-testid="circle-prompt-card"
      >
        <div className="flex items-start gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-[#A9B89E] flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1" data-testid="circle-title">
              {currentCircle.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3" data-testid="circle-prompt">
              {currentCircle.prompt}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {currentCircle.participantCount} participants
              </span>
              <span>
                Ends {format(new Date(currentCircle.weekEnd), 'MMM d')}
              </span>
            </div>
          </div>
        </div>

        {/* Response Input */}
        <div className="space-y-3">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share your thoughts..."
            className="bg-white dark:bg-gray-800 min-h-[80px]"
            maxLength={300}
            data-testid="textarea-circle-response"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                data-testid="switch-anonymous"
              />
              <Label htmlFor="anonymous" className="text-sm text-gray-600 dark:text-gray-400">
                Share anonymously
              </Label>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!response.trim() || participateMutation.isPending}
              className="bg-[#A9B89E] hover:bg-[#98A78D] text-white"
              data-testid="button-share-circle-response"
            >
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Participations */}
      {participations.length > 0 && (
        <div className="space-y-3" data-testid="circle-participations">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
            Community Reflections ({participations.length})
          </h4>
          
          <AnimatePresence>
            {participations.map((participation, index) => (
              <motion.div
                key={participation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                data-testid={`participation-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {participation.response}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {participation.isAnonymous ? 'Anonymous' : participation.userName || 'Community member'}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(participation.createdAt), 'MMM d')}</span>
                      {participation.likeCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                            {participation.likeCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
