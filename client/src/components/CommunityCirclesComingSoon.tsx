import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CommunityCirclesComingSoon() {
  const { toast } = useToast();

  // Check if user has already opted in
  const { data: preference } = useQuery<{ notifyCircles: boolean }>({
    queryKey: ['/api/user/preferences'],
  });

  const notifyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/user/preferences/notify-circles', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      toast({
        title: "You're on the list! 🩵",
        description: "We'll notify you when Community Circles launch.",
      });
    },
    onError: () => {
      toast({
        title: "Couldn't save preference",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const isNotified = preference?.notifyCircles || false;

  return (
    <Card className="p-6 text-center bg-white dark:bg-gray-800 shadow-md rounded-2xl">
      <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-3">
        🩵 Community Circles – Coming Soon!
      </h2>

      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
        Why Form Community Circles?
      </h3>

      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        Our Community Circles are small, supportive wellness groups where members can
        share insights, stay motivated, and explore themes like mindful eating,
        sleep balance, and emotional well-being — together.
      </p>

      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
        What to Expect
      </h3>

      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
        We'll soon begin forming new Circles so you can connect with others on similar
        wellness journeys. Each week, you'll be invited to join a themed circle — such as{" "}
        <em>Mindful Mornings</em>, <em>Energy Boost Reset</em>, or <em>Stress & Balance</em> —
        and receive prompts, reflections, and gentle group discussions.
      </p>

      {!isNotified ? (
        <Button
          onClick={() => notifyMutation.mutate()}
          disabled={notifyMutation.isPending}
          className="bg-[#A9B89E] hover:bg-[#98A78D] text-white px-6 py-2 rounded-lg transition-all"
          data-testid="button-notify-circles"
        >
          <Bell className="w-4 h-4 mr-2" />
          {notifyMutation.isPending ? 'Saving...' : 'Notify Me When Available'}
        </Button>
      ) : (
        <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
          <Check className="w-5 h-5" />
          <span>You'll be notified when Circles launch!</span>
        </div>
      )}

      <p className="text-green-700 dark:text-green-400 font-medium italic mt-4">
        ✨ Our Circles are forming soon — stay tuned!
      </p>
    </Card>
  );
}
