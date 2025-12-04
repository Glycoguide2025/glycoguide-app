import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Track user sessions and survey states in localStorage
const STORAGE_KEYS = {
  SESSION_COUNT: 'glycoguide_session_count',
  FIRST_SESSION_DATE: 'glycoguide_first_session',
  TONE_SURVEY_SHOWN: 'glycoguide_tone_survey_shown',
  NPS_SURVEY_SHOWN: 'glycoguide_nps_survey_shown',
  LAST_SESSION_DATE: 'glycoguide_last_session'
};

interface SurveyData {
  type: 'tone' | 'nps';
  response: string | number;
  timestamp: Date;
  sessionCount: number;
  daysSinceFirstSession: number;
}

export function MiniSurveys() {
  const [showToneSurvey, setShowToneSurvey] = useState(false);
  const [showNpsSurvey, setShowNpsSurvey] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Track session and check if surveys should be shown
    trackSession();
  }, []);

  const trackSession = () => {
    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem(STORAGE_KEYS.LAST_SESSION_DATE);
    
    // Only count as new session if it's a different day
    if (lastSessionDate !== today) {
      const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || '0') + 1;
      const firstSessionDate = localStorage.getItem(STORAGE_KEYS.FIRST_SESSION_DATE) || today;
      
      localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, currentCount.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_SESSION_DATE, today);
      localStorage.setItem(STORAGE_KEYS.FIRST_SESSION_DATE, firstSessionDate);
      
      setSessionCount(currentCount);
      
      // Check if we should show tone survey (3rd session)
      if (currentCount === 3 && !localStorage.getItem(STORAGE_KEYS.TONE_SURVEY_SHOWN)) {
        setTimeout(() => setShowToneSurvey(true), 2000); // Show after 2 seconds
      }
      
      // Check if we should show NPS survey (7+ days after first session)
      const daysSinceFirst = Math.floor(
        (new Date().getTime() - new Date(firstSessionDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceFirst >= 7 && !localStorage.getItem(STORAGE_KEYS.NPS_SURVEY_SHOWN)) {
        setTimeout(() => setShowNpsSurvey(true), 5000); // Show after 5 seconds
      }
    } else {
      // Same day session, just get current count
      setSessionCount(parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || '0'));
    }
  };

  const submitToneSurvey = async (emotion: string) => {
    const surveyData: SurveyData = {
      type: 'tone',
      response: emotion,
      timestamp: new Date(),
      sessionCount,
      daysSinceFirstSession: Math.floor(
        (new Date().getTime() - new Date(localStorage.getItem(STORAGE_KEYS.FIRST_SESSION_DATE) || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      )
    };
    
    console.log('📊 [TONE_SURVEY]', surveyData);
    localStorage.setItem(STORAGE_KEYS.TONE_SURVEY_SHOWN, 'true');
    setShowToneSurvey(false);
    
    // Track analytics event to database
    try {
      await fetch('/api/analytics/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          event: 'survey_answered',
          properties: {
            type: 'tone',
            value: emotion,
            sessionCount,
            daysSinceFirstSession: surveyData.daysSinceFirstSession,
            context: 'mini_survey_tone'
          }
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed (non-critical):', error);
    }
    
    toast({
      title: "Thank you!",
      description: "Your feedback helps us improve GlycoGuide.",
    });
  };

  const submitNpsSurvey = async (score: number) => {
    const surveyData: SurveyData = {
      type: 'nps',
      response: score,
      timestamp: new Date(),
      sessionCount,
      daysSinceFirstSession: Math.floor(
        (new Date().getTime() - new Date(localStorage.getItem(STORAGE_KEYS.FIRST_SESSION_DATE) || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      )
    };
    
    console.log('📊 [NPS_SURVEY]', surveyData);
    localStorage.setItem(STORAGE_KEYS.NPS_SURVEY_SHOWN, 'true');
    setShowNpsSurvey(false);
    
    // Track analytics event to database
    try {
      await fetch('/api/analytics/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          event: 'survey_answered',
          properties: {
            type: 'nps',
            score: score,
            sessionCount,
            daysSinceFirstSession: surveyData.daysSinceFirstSession,
            context: 'mini_survey_nps'
          }
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed (non-critical):', error);
    }
    
    toast({
      title: "Thank you!",
      description: "Your feedback helps us improve GlycoGuide for everyone.",
    });
  };

  const skipSurvey = (type: 'tone' | 'nps') => {
    if (type === 'tone') {
      localStorage.setItem(STORAGE_KEYS.TONE_SURVEY_SHOWN, 'true');
      setShowToneSurvey(false);
    } else {
      localStorage.setItem(STORAGE_KEYS.NPS_SURVEY_SHOWN, 'true');
      setShowNpsSurvey(false);
    }
  };

  return (
    <>
      {/* Tone Survey - After 3rd session */}
      <Dialog open={showToneSurvey} onOpenChange={() => skipSurvey('tone')}>
        <DialogContent className="sm:max-w-[400px]" data-testid="dialog-tone-survey">
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>
              Quick check-in: How has your experience with GlycoGuide been so far?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-6 py-6">
            <Button
              variant="ghost"
              className="text-4xl p-4 h-auto hover:bg-green-50"
              onClick={() => submitToneSurvey('happy')}
              data-testid="button-tone-happy"
            >
              😊
            </Button>
            <Button
              variant="ghost"
              className="text-4xl p-4 h-auto hover:bg-yellow-50"
              onClick={() => submitToneSurvey('neutral')}
              data-testid="button-tone-neutral"
            >
              😐
            </Button>
            <Button
              variant="ghost"
              className="text-4xl p-4 h-auto hover:bg-red-50"
              onClick={() => submitToneSurvey('unhappy')}
              data-testid="button-tone-unhappy"
            >
              😕
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipSurvey('tone')}
              data-testid="button-skip-tone"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* NPS Survey - After 7 days */}
      <Dialog open={showNpsSurvey} onOpenChange={() => skipSurvey('nps')}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-nps-survey">
          <DialogHeader>
            <DialogTitle>Quick feedback</DialogTitle>
            <DialogDescription>
              How likely are you to recommend GlycoGuide to someone with diabetes?
            </DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">Rate us 0-10</CardTitle>
              <CardDescription className="text-center">
                0 = Not at all likely, 10 = Extremely likely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-11 gap-1 mb-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-12 text-sm"
                    onClick={() => submitNpsSurvey(i)}
                    data-testid={`button-nps-${i}`}
                  >
                    {i}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipSurvey('nps')}
                  data-testid="button-skip-nps"
                >
                  Maybe later
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook to get current session info for debugging
export function useSessionInfo() {
  const [sessionInfo, setSessionInfo] = useState({
    sessionCount: 0,
    daysSinceFirst: 0,
    toneSurveyShown: false,
    npsSurveyShown: false
  });

  useEffect(() => {
    const sessionCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || '0');
    const firstSessionDate = localStorage.getItem(STORAGE_KEYS.FIRST_SESSION_DATE);
    const daysSinceFirst = firstSessionDate ? 
      Math.floor((new Date().getTime() - new Date(firstSessionDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    setSessionInfo({
      sessionCount,
      daysSinceFirst,
      toneSurveyShown: !!localStorage.getItem(STORAGE_KEYS.TONE_SURVEY_SHOWN),
      npsSurveyShown: !!localStorage.getItem(STORAGE_KEYS.NPS_SURVEY_SHOWN)
    });
  }, []);

  return sessionInfo;
}