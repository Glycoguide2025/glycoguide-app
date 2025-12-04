import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Moon, Check, Clock, BookOpen, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import contentPack from "@/content/glycoguide_gratitude_pack.json";
import { Link, useLocation } from "wouter";

const { evening_wind_down_article } = contentPack.section_copy;

export default function EveningWindDownPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [checklist, setChecklist] = useState({
    screenDim: false,
    dayRelease: false,
    bodyDownshift: false,
    gratitudeCheck: false,
    tomorrowAnchor: false
  });

  const [dayReflection, setDayReflection] = useState({
    wentWell: "",
    wasHard: "",
    lettingGo: ""
  });

  const [gratitude, setGratitude] = useState({
    thing: "",
    why: ""
  });

  const [tomorrowPlan, setTomorrowPlan] = useState({
    mustDo: "",
    startTime: ""
  });

  const [breathingComplete, setBreathingComplete] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);

  const handleChecklistChange = (item: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const startBreathingExercise = () => {
    setBreathingCount(0);
    setBreathingComplete(false);
    
    // Start breathing timer
    const interval = setInterval(() => {
      setBreathingCount(prev => {
        if (prev >= 9) {
          clearInterval(interval);
          setBreathingComplete(true);
          setChecklist(prev => ({ ...prev, bodyDownshift: true }));
          toast({
            title: "Breathing exercise complete! 🌙",
            description: "Your body is ready to wind down.",
          });
          return 10;
        }
        return prev + 1;
      });
    }, 3000); // 3 seconds per breath cycle
  };

  const checkAllComplete = () => {
    return Object.values(checklist).every(checked => checked);
  };

  const handleComplete = () => {
    if (!checkAllComplete()) {
      toast({
        title: "Almost there!",
        description: "Complete all wind-down steps for the best sleep preparation.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `${evening_wind_down_article.closing.title} 🌙`,
      description: evening_wind_down_article.closing.message,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-close-evening-wind-down"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
            <Moon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="title-evening-wind-down">{evening_wind_down_article.title}</h1>
          <p className="text-muted-foreground">
            {evening_wind_down_article.subtitle}
          </p>
        </div>

        {/* Why It Matters Section */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              {evening_wind_down_article.why_it_matters.title}
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {evening_wind_down_article.why_it_matters.content}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Step 1: Screen Dim */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Checkbox 
                  checked={checklist.screenDim}
                  onCheckedChange={() => handleChecklistChange('screenDim')}
                  data-testid="checkbox-screen-dim"
                />
                {evening_wind_down_article.practices.screen_dim.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {evening_wind_down_article.practices.screen_dim.description}
              </p>
            </CardContent>
          </Card>

          {/* Step 2: Release the Day */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Checkbox 
                  checked={checklist.dayRelease}
                  onCheckedChange={() => handleChecklistChange('dayRelease')}
                  data-testid="checkbox-day-release"
                />
                {evening_wind_down_article.practices.day_release.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {evening_wind_down_article.practices.day_release.description}
              </p>
              <div>
                <Label htmlFor="went-well" className="text-sm font-medium">
                  {evening_wind_down_article.practices.day_release.prompts.went_well}
                </Label>
                <Textarea
                  id="went-well"
                  value={dayReflection.wentWell}
                  onChange={(e) => setDayReflection(prev => ({ ...prev, wentWell: e.target.value }))}
                  placeholder={evening_wind_down_article.practices.day_release.prompts.went_well}
                  className="mt-1"
                  data-testid="textarea-went-well"
                />
              </div>
              <div>
                <Label htmlFor="was-hard" className="text-sm font-medium">
                  {evening_wind_down_article.practices.day_release.prompts.was_hard}
                </Label>
                <Textarea
                  id="was-hard"
                  value={dayReflection.wasHard}
                  onChange={(e) => setDayReflection(prev => ({ ...prev, wasHard: e.target.value }))}
                  placeholder={evening_wind_down_article.practices.day_release.prompts.was_hard}
                  className="mt-1"
                  data-testid="textarea-was-hard"
                />
              </div>
              <div>
                <Label htmlFor="letting-go" className="text-sm font-medium">
                  {evening_wind_down_article.practices.day_release.prompts.letting_go}
                </Label>
                <Textarea
                  id="letting-go"
                  value={dayReflection.lettingGo}
                  onChange={(e) => setDayReflection(prev => ({ ...prev, lettingGo: e.target.value }))}
                  placeholder={evening_wind_down_article.practices.day_release.prompts.letting_go}
                  className="mt-1"
                  data-testid="textarea-letting-go"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Body Downshift */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Checkbox 
                  checked={checklist.bodyDownshift}
                  onCheckedChange={() => handleChecklistChange('bodyDownshift')}
                  data-testid="checkbox-body-downshift"
                />
                {evening_wind_down_article.practices.body_downshift.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {evening_wind_down_article.practices.body_downshift.description}
              </p>
              {!breathingComplete ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {evening_wind_down_article.practices.body_downshift.instructions}
                  </p>
                  {breathingCount > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{breathingCount}/10</div>
                      <p className="text-sm text-muted-foreground">Breathe: inhale 4, exhale 8</p>
                    </div>
                  )}
                  <Button 
                    onClick={startBreathingExercise}
                    disabled={breathingCount > 0 && !breathingComplete}
                    data-testid="button-start-breathing"
                  >
                    {breathingCount > 0 ? "Breathing..." : "Start Breathing Exercise"}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-green-600">
                  <Check className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Breathing exercise complete!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 4: Gratitude Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Checkbox 
                  checked={checklist.gratitudeCheck}
                  onCheckedChange={() => handleChecklistChange('gratitudeCheck')}
                  data-testid="checkbox-gratitude-check"
                />
                {evening_wind_down_article.practices.gratitude_check.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {evening_wind_down_article.practices.gratitude_check.description}
              </p>
              <div>
                <Label htmlFor="gratitude-thing" className="text-sm font-medium">
                  {evening_wind_down_article.practices.gratitude_check.prompts.thing}
                </Label>
                <Input
                  id="gratitude-thing"
                  value={gratitude.thing}
                  onChange={(e) => setGratitude(prev => ({ ...prev, thing: e.target.value }))}
                  placeholder="What are you grateful for today?"
                  className="mt-1"
                  data-testid="input-gratitude-thing"
                />
              </div>
              <div>
                <Label htmlFor="gratitude-why" className="text-sm font-medium">
                  {evening_wind_down_article.practices.gratitude_check.prompts.why}
                </Label>
                <Textarea
                  id="gratitude-why"
                  value={gratitude.why}
                  onChange={(e) => setGratitude(prev => ({ ...prev, why: e.target.value }))}
                  placeholder="Why does this matter to you?"
                  className="mt-1"
                  data-testid="textarea-gratitude-why"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Tomorrow's Anchor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Checkbox 
                  checked={checklist.tomorrowAnchor}
                  onCheckedChange={() => handleChecklistChange('tomorrowAnchor')}
                  data-testid="checkbox-tomorrow-anchor"
                />
                {evening_wind_down_article.practices.tomorrow_anchor.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {evening_wind_down_article.practices.tomorrow_anchor.description}
              </p>
              <div>
                <Label htmlFor="must-do" className="text-sm font-medium">
                  {evening_wind_down_article.practices.tomorrow_anchor.prompts.must_do}
                </Label>
                <Input
                  id="must-do"
                  value={tomorrowPlan.mustDo}
                  onChange={(e) => setTomorrowPlan(prev => ({ ...prev, mustDo: e.target.value }))}
                  placeholder="What's your priority for tomorrow?"
                  className="mt-1"
                  data-testid="input-must-do"
                />
              </div>
              <div>
                <Label htmlFor="start-time" className="text-sm font-medium">
                  {evening_wind_down_article.practices.tomorrow_anchor.prompts.start_time}
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={tomorrowPlan.startTime}
                  onChange={(e) => setTomorrowPlan(prev => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1"
                  data-testid="input-start-time"
                />
              </div>
            </CardContent>
          </Card>

          {/* Completion */}
          <Card className={`border-2 transition-colors ${checkAllComplete() ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-muted'}`}>
            <CardContent className="p-6 text-center">
              {checkAllComplete() ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mx-auto">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      {evening_wind_down_article.closing.title}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      {evening_wind_down_article.closing.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold">Complete your wind-down routine</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Object.values(checklist).filter(Boolean).length}/5 {evening_wind_down_article.closing.progress_text}
                    </p>
                  </div>
                  <Button onClick={handleComplete} data-testid="button-complete-wind-down">
                    Complete Wind-Down
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affirmations */}
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 text-purple-900 dark:text-purple-100">
                💫 Evening Affirmations
              </h3>
              <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                {evening_wind_down_article.affirmations.map((affirmation, index) => (
                  <p key={index}>• {affirmation}</p>
                ))}
              </div>
              
              {/* Read More Button */}
              <div className="flex justify-center mt-4">
                <Link href="/articles/mindfulness/mind-body-connection">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900"
                    data-testid="button-read-more-affirmations"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read More About Mind-Body Connection
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}