import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Activity, Heart, ChevronLeft, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function EnergyChecker() {
  const { toast } = useToast();
  const [physicalEnergy, setPhysicalEnergy] = useState<string>("");
  const [mentalEnergy, setMentalEnergy] = useState<string>("");
  const [emotionalEnergy, setEmotionalEnergy] = useState<string>("");
  const [biggestDrain, setBiggestDrain] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const energyOptions = Array.from({ length: 11 }, (_, i) => i.toString());

  const drainOptions = [
    { label: "Poor sleep", value: "sleep" },
    { label: "Stress", value: "stress" }, 
    { label: "Feeling overwhelmed", value: "overwhelm" },
    { label: "Hunger", value: "hunger" },
    { label: "Screen fatigue", value: "screen" },
    { label: "Other", value: "other" }
  ];

  const handleSubmit = async () => {
    if (!physicalEnergy || !mentalEnergy || !emotionalEnergy || !biggestDrain) {
      toast({
        title: "Please complete all fields",
        description: "Rate all three energy types and identify your biggest drain.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    
    const idempotencyKey = crypto.randomUUID();

    try {
      const response = await apiRequest("POST", "/api/energy-checkin", {
        physical: parseInt(physicalEnergy),
        mental: parseInt(mentalEnergy),
        emotional: parseInt(emotionalEnergy),
        drain: biggestDrain,
        notes: notes || undefined,
        idempotencyKey
      });

      if (response.ok) {
        setSuccess(true);
        setShowResults(true);
        toast({
          title: "Energy check complete! ⚡",
          description: "Your check-in has been saved successfully.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          setError("Your session expired. Please sign in and try again.");
        } else if (response.status === 400) {
          setError("Let's use whole numbers 0–10 for each energy level.");
        } else {
          setError(errorData?.message || "We couldn't save that just now. Check your connection and try again.");
        }
      }
    } catch (err) {
      setError("Network issue — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const getActionPlan = () => {
    const physical = parseInt(physicalEnergy);
    const mental = parseInt(mentalEnergy);
    const emotional = parseInt(emotionalEnergy);

    const actions = [];

    if (physical < 4) {
      actions.push({
        type: "Physical",
        action: "2-min walk or 10 box breaths",
        icon: <Activity className="w-4 h-4" />
      });
    }

    if (mental < 4) {
      actions.push({
        type: "Mental", 
        action: "90s eyes-closed reset (inhale 4, hold 2, exhale 6)",
        icon: <Zap className="w-4 h-4" />
      });
    }

    if (emotional < 4) {
      actions.push({
        type: "Emotional",
        action: 'Say: "I feel ___ because ___; I need ___."',
        icon: <Heart className="w-4 h-4" />
      });
    }

    return actions;
  };

  const reset = () => {
    setPhysicalEnergy("");
    setMentalEnergy("");
    setEmotionalEnergy("");
    setBiggestDrain("");
    setNotes("");
    setShowResults(false);
    setError(null);
    setSuccess(false);
  };

  // Scroll to top when results are shown
  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showResults]);

  if (showResults) {
    const actionPlan = getActionPlan();
    
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto p-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={reset}
              className="mb-4"
              data-testid="button-back"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Energy Check
            </Button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Your Energy Report</h1>
              <p className="text-muted-foreground">Here's your personalized action plan</p>
            </div>
          </div>

          {/* Energy Levels Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Energy Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Physical
                  </span>
                  <Badge variant={parseInt(physicalEnergy) >= 7 ? "default" : parseInt(physicalEnergy) >= 4 ? "secondary" : "destructive"}>
                    {physicalEnergy}/10
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Mental
                  </span>
                  <Badge variant={parseInt(mentalEnergy) >= 7 ? "default" : parseInt(mentalEnergy) >= 4 ? "secondary" : "destructive"}>
                    {mentalEnergy}/10
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Emotional
                  </span>
                  <Badge variant={parseInt(emotionalEnergy) >= 7 ? "default" : parseInt(emotionalEnergy) >= 4 ? "secondary" : "destructive"}>
                    {emotionalEnergy}/10
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Biggest energy drain: {drainOptions.find(d => d.value === biggestDrain)?.label || biggestDrain}</p>
                {notes && (
                  <p className="text-sm text-muted-foreground mt-2">Notes: {notes}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Plan */}
          {actionPlan.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actionPlan.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium">{item.type} Boost</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message & Tip */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardContent className="p-4">
              {success && (
                <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                  <span className="font-medium">✅ Saved!</span> Thanks for checking in.
                </p>
              )}
              <p className="text-sm text-green-800 dark:text-green-200">
                <span className="font-medium">💡 Tip:</span> Recheck after action—small wins count.
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button onClick={reset} data-testid="button-check-again">
              Check Energy Again
            </Button>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Energy Checker</h1>
          <p className="text-muted-foreground">
            Check your current energy levels in under 2 minutes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rate yourself (0–10):</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message - Positioned at top for visibility */}
            {error && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-400 dark:border-amber-600 rounded-lg shadow-md">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  ⚠️ {error}
                </p>
                <button 
                  className="text-sm underline mt-2 hover:no-underline text-amber-700 dark:text-amber-300 font-medium" 
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Physical Energy */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Physical Energy
              </Label>
              <RadioGroup 
                value={physicalEnergy} 
                onValueChange={setPhysicalEnergy}
                className="flex flex-wrap gap-2"
                data-testid="radiogroup-physical-energy"
              >
                {energyOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-1">
                    <RadioGroupItem value={option} id={`physical-${option}`} />
                    <Label htmlFor={`physical-${option}`} className="text-sm">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Mental Energy */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Mental Energy
              </Label>
              <RadioGroup 
                value={mentalEnergy} 
                onValueChange={setMentalEnergy}
                className="flex flex-wrap gap-2"
                data-testid="radiogroup-mental-energy"
              >
                {energyOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-1">
                    <RadioGroupItem value={option} id={`mental-${option}`} />
                    <Label htmlFor={`mental-${option}`} className="text-sm">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Emotional Energy */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Emotional Energy
              </Label>
              <RadioGroup 
                value={emotionalEnergy} 
                onValueChange={setEmotionalEnergy}
                className="flex flex-wrap gap-2"
                data-testid="radiogroup-emotional-energy"
              >
                {energyOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-1">
                    <RadioGroupItem value={option} id={`emotional-${option}`} />
                    <Label htmlFor={`emotional-${option}`} className="text-sm">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Biggest Drain */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Spot the biggest drain:</Label>
              <RadioGroup 
                value={biggestDrain} 
                onValueChange={setBiggestDrain}
                className="space-y-2"
                data-testid="radiogroup-biggest-drain"
              >
                {drainOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`drain-${option.value}`} />
                    <Label htmlFor={`drain-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Optional Notes */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Additional notes (optional):</Label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling? Any specific concerns?"
                className="resize-none"
                maxLength={500}
                rows={3}
                data-testid="textarea-notes"
              />
              {notes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {notes.length}/500 characters
                </p>
              )}
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="w-full mt-6"
              data-testid="button-submit-energy-check"
            >
              {saving ? "Saving…" : "Get My Energy Report"}
            </Button>

            {/* Learn More Button */}
            <div className="flex justify-center mt-6">
              <Link href="/articles/energy/energy-check-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                  data-testid="button-learn-energy"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learn More About Energy Check-Ins
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}