import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Sparkles, Sun, CloudRain, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import contentPack from "@/content/glycoguide_gratitude_pack.json";
import { motion } from "framer-motion";

const { gratitude } = contentPack.section_copy;

type DayType = 'great' | 'regular' | 'awful' | null;

interface DayTypeConfig {
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  icon: typeof Sun;
  prompts: {
    line1: { label: string; placeholder: string; helper: string; };
    line2: { label: string; placeholder: string; helper: string; };
    line3: { label: string; placeholder: string; helper: string; };
  };
  tips: string[];
}

const dayTypeConfigs: Record<Exclude<DayType, null>, DayTypeConfig> = {
  great: {
    title: "Celebrate Your Great Day",
    subtitle: "Let's capture and amplify the joy you're feeling",
    color: "from-amber-500 to-orange-500",
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
    icon: Sun,
    prompts: {
      line1: {
        label: "What made today special?",
        placeholder: "The best part of my day was...",
        helper: "Describe the moment that brought you the most joy"
      },
      line2: {
        label: "Why does this matter to you?",
        placeholder: "This is meaningful because...",
        helper: "Connect this experience to what you value most"
      },
      line3: {
        label: "Who or what are you grateful for today?",
        placeholder: "I'm filled with appreciation for...",
        helper: "Express your gratitude and thanksgiving for who or what gave you joy"
      }
    },
    tips: [
      "Great days are worth savoring — let yourself fully feel the joy",
      "Notice what conditions helped create this day",
      "Gratitude amplifies positive emotions and helps them last longer"
    ]
  },
  regular: {
    title: "Even on an Ordinary Day, I Choose Gratitude",
    subtitle: "In the quiet rhythm, there's still so much to be thankful for",
    color: "from-blue-500 to-cyan-500",
    gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    icon: Cloud,
    prompts: {
      line1: {
        label: "What simple gifts did today bring?",
        placeholder: "I woke up with breath in my lungs and...",
        helper: "Notice the everyday blessings: strength, food, peace, safety, support, rest"
      },
      line2: {
        label: "What grounds you in gratitude right now?",
        placeholder: "Even in the routine, I'm thankful for...",
        helper: "Find appreciation in the ordinary moments that make up your day"
      },
      line3: {
        label: "",
        placeholder: "",
        helper: ""
      }
    },
    tips: [
      "Gratitude isn't just for the extraordinary — it's for the everyday, too",
      "Today may have felt routine, but you were safe, supported, and able to move through it",
      "The quiet rhythm of ordinary days deserves your appreciation"
    ]
  },
  awful: {
    title: "Today Was Awful—And It's Okay to Admit That",
    subtitle: "Your heart feels heavy, and that's valid. You don't need to pretend you're okay.",
    color: "from-violet-500 to-purple-500",
    gradient: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
    icon: CloudRain,
    prompts: {
      line1: {
        label: "What's one lesson you can take from today?",
        placeholder: "Today showed me that...",
        helper: "Even painful experiences can teach us something valuable"
      },
      line2: {
        label: "What or who can you extend forgiveness to?",
        placeholder: "I'm ready to release...",
        helper: "This could be yourself, someone else, or just the day itself"
      },
      line3: {
        label: "What good things are still present in your life?",
        placeholder: "Despite today, I still have...",
        helper: "Look around and find what's good - this helps you start to feel better from here"
      }
    },
    tips: [
      "You're still breathing—and each breath is a quiet act of resilience",
      "You've survived hard days before—and you're still here",
      "You don't have to fix everything tonight. Just be gentle with yourself."
    ]
  }
};

export default function GratitudePage() {
  const { toast } = useToast();
  const [dayType, setDayType] = useState<DayType>(null);
  const [reflection, setReflection] = useState({
    line1: "",
    line2: "",
    line3: ""
  });
  const [isComplete, setIsComplete] = useState(false);

  const handleInputChange = (field: keyof typeof reflection, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const config = dayType ? dayTypeConfigs[dayType] : null;
    const requiresThreeLines = config?.prompts.line3.label !== "";
    
    if (!reflection.line1 || !reflection.line2) {
      toast({
        title: "Please complete all fields",
        description: "Complete your reflection to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (requiresThreeLines && !reflection.line3) {
      toast({
        title: "Please complete all fields",
        description: "All three lines help create a complete reflection.",
        variant: "destructive"
      });
      return;
    }

    setIsComplete(true);
    toast({
      title: "Reflection saved! ✨",
      description: "Your mindful practice has been recorded.",
    });
  };

  const reset = () => {
    setReflection({
      line1: "",
      line2: "",
      line3: ""
    });
    setIsComplete(false);
    setDayType(null);
  };

  // Day Type Selection Screen
  if (dayType === null) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto p-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" data-testid="title-gratitude">REFLECTIONS OF THE DAY</h1>
            <p className="text-muted-foreground">
              Choose the option that best describes today
            </p>
          </div>

          <div className="space-y-4">
            {/* Great Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-300"
                onClick={() => setDayType('great')}
                data-testid="button-day-great"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${dayTypeConfigs.great.color} flex items-center justify-center flex-shrink-0`}>
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Great Day! 🌟</h3>
                      <p className="text-sm text-muted-foreground">
                        Things went well and you're feeling grateful and joyful
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Regular Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                onClick={() => setDayType('regular')}
                data-testid="button-day-regular"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${dayTypeConfigs.regular.color} flex items-center justify-center flex-shrink-0`}>
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Regular Day ☁️</h3>
                      <p className="text-sm text-muted-foreground">
                        Same as usual — grateful for stability and things still standing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Awful Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-violet-300"
                onClick={() => setDayType('awful')}
                data-testid="button-day-awful"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${dayTypeConfigs.awful.color} flex items-center justify-center flex-shrink-0`}>
                      <CloudRain className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Difficult Day 🌧️</h3>
                      <p className="text-sm text-muted-foreground">
                        Today was hard — ready to find lessons and let go
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const config = dayTypeConfigs[dayType];
  const Icon = config.icon;

  // Completion Screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto p-4">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${config.color} rounded-full mb-4`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Reflection Complete</h1>
            <p className="text-muted-foreground">
              Your mindful practice strengthens your inner resilience
            </p>
          </div>

          <Card className={`border-2 bg-gradient-to-br ${config.gradient}`}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <div className={`w-6 h-6 bg-gradient-to-br ${config.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                      1
                    </div>
                    {config.prompts.line1.label}
                  </h3>
                  <p className="text-foreground/80 pl-8">{reflection.line1}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <div className={`w-6 h-6 bg-gradient-to-br ${config.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                      2
                    </div>
                    {config.prompts.line2.label}
                  </h3>
                  <p className="text-foreground/80 pl-8">{reflection.line2}</p>
                </div>
                
                {config.prompts.line3.label && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <div className={`w-6 h-6 bg-gradient-to-br ${config.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                        3
                      </div>
                      {config.prompts.line3.label}
                    </h3>
                    <p className="text-foreground/80 pl-8">{reflection.line3}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Revisit this reflection tomorrow to see your growth.
              </p>
            </div>
            
            <Button onClick={reset} data-testid="button-new-reflection">
              Create New Reflection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Reflection Form
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${config.color} rounded-full mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="title-gratitude">REFLECTIONS OF THE DAY</h1>
          <p className="text-muted-foreground">
            {config.subtitle}
          </p>
        </div>

        {/* Special Guidance for Great Days */}
        {dayType === 'great' && (
          <Card className={`mb-6 border-2 bg-gradient-to-br ${config.gradient}`}>
            <CardContent className="p-6 space-y-4">
              <p className="text-foreground/90">
                Things flowed your way. What you hoped for arrived. The energy felt light, and your heart felt full. You showed up, and the universe responded.
              </p>
              
              <div>
                <p className="font-medium mb-2">Let yourself soak in this joy. Let it fill your chest, soften your face, and remind you:</p>
                <ul className="space-y-1.5 text-sm text-foreground/80">
                  <li>• You are worthy of good things.</li>
                  <li>• Your efforts are bearing fruit.</li>
                  <li>• You are allowed to celebrate without guilt.</li>
                  <li>• You are surrounded by moments that affirm your path.</li>
                  <li>• You are living a day you once dreamed of.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="font-medium mb-2">Before you close this day, take a moment to breathe it in:</p>
                <p className="text-sm text-foreground/80 mb-3">
                  🌬️ Inhale deeply for 4 counts… hold for 4… exhale slowly for 6.
                </p>
                <p className="text-sm text-foreground/70 italic">
                  Let your breath anchor the joy. Let your body remember this feeling. Let gratitude ripple through you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Special Guidance for Difficult Days */}
        {dayType === 'awful' && (
          <Card className={`mb-6 border-2 bg-gradient-to-br ${config.gradient}`}>
            <CardContent className="p-6 space-y-4">
              <p className="text-foreground/90">
                Maybe you lost someone, or something deeply important. Maybe the day unraveled in ways you couldn't control. Your heart feels heavy, and that's valid. You don't need to pretend you're okay.
              </p>
              
              <div>
                <p className="font-medium mb-2">But even in this pain, there are still things worth holding onto:</p>
                <ul className="space-y-1.5 text-sm text-foreground/80">
                  <li>• You're still breathing—and each breath is a quiet act of resilience.</li>
                  <li>• You have people, memories, or places that remind you you're loved.</li>
                  <li>• Your body is doing its best to carry you through.</li>
                  <li>• You've survived hard days before—and you're still here.</li>
                  <li>• There's still beauty in the world, even if you can't feel it right now.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="font-medium mb-2">Before you close this day, take a moment to rebalance:</p>
                <p className="text-sm text-foreground/80 mb-3">
                  🌬️ Inhale gently for 4 counts… hold for 4… exhale slowly for 6.
                </p>
                <p className="text-sm text-foreground/70 italic">
                  Repeat this rhythm a few times. Let your shoulders drop. Let your jaw unclench. Let your breath soften the edges of your pain.
                </p>
              </div>

              <div className="pt-2 text-center border-t border-border/50">
                <p className="text-foreground/90 font-medium">
                  You don't have to fix everything tonight. Just be gentle with yourself.
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  Tomorrow is a new page—and you'll turn it when you're ready.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{config.prompts.line3.label ? 'Write 3 lines:' : 'Write 2 lines:'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Take a moment to reflect mindfully on your day
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="line1" className="text-base font-medium flex items-center gap-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${config.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                  1
                </div>
                {config.prompts.line1.label}
              </Label>
              <Textarea
                id="line1"
                value={reflection.line1}
                onChange={(e) => handleInputChange('line1', e.target.value)}
                placeholder={config.prompts.line1.placeholder}
                className="min-h-[80px]"
                data-testid="textarea-line1"
              />
              <p className="text-xs text-muted-foreground">
                {config.prompts.line1.helper}
              </p>
            </div>

            {/* Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="line2" className="text-base font-medium flex items-center gap-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${config.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                  2
                </div>
                {config.prompts.line2.label}
              </Label>
              <Textarea
                id="line2"
                value={reflection.line2}
                onChange={(e) => handleInputChange('line2', e.target.value)}
                placeholder={config.prompts.line2.placeholder}
                className="min-h-[80px]"
                data-testid="textarea-line2"
              />
              <p className="text-xs text-muted-foreground">
                {config.prompts.line2.helper}
              </p>
            </div>

            {/* Line 3 - Only for Great Day */}
            {config.prompts.line3.label && (
              <div className="space-y-2">
                <Label htmlFor="line3" className="text-base font-medium flex items-center gap-2">
                  <div className={`w-6 h-6 bg-gradient-to-br ${config.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                    3
                  </div>
                  {config.prompts.line3.label}
                </Label>
                <Textarea
                  id="line3"
                  value={reflection.line3}
                  onChange={(e) => handleInputChange('line3', e.target.value)}
                  placeholder={config.prompts.line3.placeholder}
                  className="min-h-[80px]"
                  data-testid="textarea-line3"
                />
                <p className="text-xs text-muted-foreground">
                  {config.prompts.line3.helper}
                </p>
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              className="w-full mt-6"
              data-testid="button-submit-reflection"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Complete Reflection
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className={`mt-6 border-2 bg-gradient-to-br ${config.gradient}`}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon className="w-5 h-5" />
              Guidance for Today
            </h3>
            <div className="space-y-1 text-sm">
              {config.tips.map((tip, index) => (
                <p key={index}>• {tip}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back button */}
        <div className="mt-4 text-center">
          <Button 
            variant="ghost" 
            onClick={() => setDayType(null)}
            data-testid="button-change-day-type"
          >
            ← Change day type
          </Button>
        </div>
      </div>
    </div>
  );
}
