import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Wind, Eye, Hand, CheckCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import contentPack from "@/content/glycoguide_gratitude_pack.json";

const { body_scan_article, quick_stress_relief } = contentPack.section_copy;

type TechniqueType = "body_scan" | "physiological" | "grounding" | "tension" | null;

export default function QuickStressReliefPage() {
  const { toast } = useToast();
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueType>(null);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);

  // Get techniques from JSON, including the 3-minute body scan and bonus practices
  const techniques = {
    body_scan: {
      name: body_scan_article.three_minute_body_scan.name,
      description: body_scan_article.three_minute_body_scan.description,
      icon: <Eye className="w-6 h-6" />,
      duration: body_scan_article.three_minute_body_scan.duration,
      steps: body_scan_article.three_minute_body_scan.steps
    },
    physiological: {
      name: body_scan_article.bonus_practices[0].name,
      description: body_scan_article.bonus_practices[0].description,
      icon: <Wind className="w-6 h-6" />,
      duration: body_scan_article.bonus_practices[0].duration,
      steps: body_scan_article.bonus_practices[0].steps
    },
    grounding: {
      name: body_scan_article.bonus_practices[1].name,
      description: body_scan_article.bonus_practices[1].description,
      icon: <Eye className="w-6 h-6" />,
      duration: body_scan_article.bonus_practices[1].duration,
      steps: body_scan_article.bonus_practices[1].steps
    },
    tension: {
      name: body_scan_article.bonus_practices[2].name,
      description: body_scan_article.bonus_practices[2].description,
      icon: <Hand className="w-6 h-6" />,
      duration: body_scan_article.bonus_practices[2].duration,
      steps: body_scan_article.bonus_practices[2].steps
    }
  };

  const startTechnique = (technique: TechniqueType) => {
    if (!technique) return;
    
    setSelectedTechnique(technique);
    setIsActive(true);
    setIsComplete(false);
    setTimer(0);

    toast({
      title: `Starting ${techniques[technique].name}`,
      description: "Follow the steps at your own pace",
    });
  };

  const completeTechnique = () => {
    setIsActive(false);
    setIsComplete(true);
    
    toast({
      title: `${body_scan_article.completion.title} 🌟`,
      description: "Take a moment to notice how you feel now.",
    });
  };

  const reset = () => {
    setSelectedTechnique(null);
    setIsActive(false);
    setIsComplete(false);
    setTimer(0);
  };

  const getTechniqueColor = (technique: TechniqueType) => {
    switch (technique) {
      case "body_scan": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "physiological": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "grounding": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "tension": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isActive && selectedTechnique) {
    const technique = techniques[selectedTechnique];
    
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto p-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
              {technique.icon}
            </div>
            <h1 className="text-3xl font-bold mb-2">{technique.name}</h1>
            <p className="text-muted-foreground">{technique.description}</p>
            <Badge className={getTechniqueColor(selectedTechnique)} variant="secondary">
              {technique.duration}
            </Badge>
          </div>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-center mb-4">Follow these steps:</h3>
                <ol className="space-y-3">
                  {technique.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Take your time with each step. There's no rush - go at your own pace.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={reset}
                data-testid="button-exit-technique"
              >
                Exit Technique
              </Button>
              <Button
                onClick={completeTechnique}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-complete-technique"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I'm Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete && selectedTechnique) {
    const technique = techniques[selectedTechnique];
    
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto p-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{body_scan_article.completion.title}</h1>
            <p className="text-muted-foreground">
              You've completed the {technique.name} technique.
            </p>
          </div>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                {body_scan_article.completion.check_in.title}
              </h3>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                {body_scan_article.completion.check_in.questions.map((question, index) => (
                  <p key={index}>• {question}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Remember:</strong> {body_scan_article.completion.reminder}
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reset} data-testid="button-try-different">
                Try Different Technique
              </Button>
              <Button onClick={reset} data-testid="button-practice-again">
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="title-quick-stress-relief">{body_scan_article.title}</h1>
          <p className="text-muted-foreground">
            {body_scan_article.subtitle}
          </p>
        </div>

        {/* Intro */}
        <Card className="mb-6 border-2 border-orange-500 bg-gradient-to-br from-orange-200 to-red-100 dark:from-orange-900 dark:to-red-950 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">⚠️</span>
              <p className="text-lg font-bold text-orange-950 dark:text-orange-50 leading-relaxed">
                {body_scan_article.intro}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Pick one:</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(techniques).map(([key, technique]) => (
            <Card 
              key={key} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => startTechnique(key as TechniqueType)}
              data-testid={`card-technique-${key}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
                      {technique.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {technique.name}
                      </CardTitle>
                      <Badge className={getTechniqueColor(key as TechniqueType)} variant="secondary">
                        {technique.duration}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {technique.description}
                </p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startTechnique(key as TechniqueType);
                  }}
                  className="w-full"
                  data-testid={`button-start-${key}`}
                >
                  Start {technique.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">💡 Stress Relief Tips</h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              {body_scan_article.tips.map((tip, index) => (
                <p key={index}>• {tip}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fallback Checklist */}
        <Card className="mt-6 border-gray-200 bg-gray-50 dark:bg-gray-950">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
              🆘 Quick Backup Options
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {quick_stress_relief.note}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
              {quick_stress_relief.fallback_checklist.map((item, index) => (
                <p key={index} className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  {item}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}