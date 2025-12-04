import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Bell } from "lucide-react";
import strings from "@/i18n/en.json";

interface OnboardingRemindersProps {
  data: {
    breakfast: string;
    lunch: string;
    dinner: string;
    reflection: string;
    enabled: boolean;
  };
  onNext: (data: { reminders: any }) => void;
  onBack: () => void;
  onComplete: () => void;
  isLoading: boolean;
}

export function OnboardingReminders({ data, onNext, onBack, onComplete, isLoading }: OnboardingRemindersProps) {
  const [enabled, setEnabled] = useState(data.enabled);
  const [breakfast, setBreakfast] = useState(data.breakfast);
  const [lunch, setLunch] = useState(data.lunch);
  const [dinner, setDinner] = useState(data.dinner);
  const [reflection, setReflection] = useState(data.reflection);
  const reminders = strings.onboarding.reminders;

  const handleComplete = () => {
    const reminderData = {
      reminders: {
        breakfast,
        lunch,
        dinner,
        reflection,
        enabled
      }
    };
    
    onNext(reminderData);
    onComplete();
  };

  return (
    <Card className="w-full" data-testid="onboarding-reminders">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">{reminders.title}</CardTitle>
        <p className="text-muted-foreground">{reminders.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable/disable toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {enabled ? reminders.enable : reminders.disable}
              </div>
              <div className="text-sm text-muted-foreground">
                {enabled ? "Get gentle reminders throughout the day" : "No reminders will be sent"}
              </div>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            data-testid="switch-reminders-enabled"
          />
        </div>

        {/* Reminder times */}
        {enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breakfast-time" className="text-sm">
                  {reminders.breakfast}
                </Label>
                <Input
                  id="breakfast-time"
                  type="time"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  data-testid="input-breakfast-time"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lunch-time" className="text-sm">
                  {reminders.lunch}
                </Label>
                <Input
                  id="lunch-time"
                  type="time"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  data-testid="input-lunch-time"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dinner-time" className="text-sm">
                  {reminders.dinner}
                </Label>
                <Input
                  id="dinner-time"
                  type="time"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  data-testid="input-dinner-time"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reflection-time" className="text-sm">
                  {reminders.reflection}
                </Label>
                <Input
                  id="reflection-time"
                  type="time"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  data-testid="input-reflection-time"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            data-testid="button-back-reminders"
          >
            {reminders.back}
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isLoading}
            className="flex-1"
            data-testid="button-complete-onboarding"
          >
            {isLoading ? "Completing..." : reminders.complete}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}