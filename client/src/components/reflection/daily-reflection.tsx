import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Moon, Sparkles } from "lucide-react";
import strings from "@/i18n/en.json";
import { trackReflectionSubmit, trackFeatureUse } from "@/utils/analytics";
import { playSound } from "@/utils/soundCues";

interface DailyReflectionProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DailyReflection({ onClose, onSuccess }: DailyReflectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reflection = strings.reflection;
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLButtonElement>(null);
  
  const [formData, setFormData] = useState({
    mood: '',
    stress: '',
    sleep: '',
    energy: '',
    gratitude: '',
    notes: ''
  });

  // Focus management
  useEffect(() => {
    // Play whoosh sound when reflection panel opens
    playSound('reflection');
    
    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const submitReflectionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      return await apiRequest('POST', '/api/reflections', {
        ...data,
        date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reflections/week'] });
      playSound('save'); // Gentle chime for save action
      toast({
        title: reflection.submitted,
        description: "Your reflection has been saved for today.",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    // Validate at least mood is selected
    if (!formData.mood) {
      toast({
        title: "Please select your mood",
        description: "At minimum, we'd love to know how your mood was today.",
        variant: "destructive"
      });
      return;
    }

    // Track reflection submission
    trackReflectionSubmit(formData.mood);
    
    submitReflectionMutation.mutate(formData);
  };

  const handleSkip = () => {
    onClose();
  };

  const renderRadioGroup = (
    field: keyof typeof formData,
    label: string,
    options: Record<string, string>
  ) => (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      <RadioGroup 
        value={formData[field]} 
        onValueChange={(value) => setFormData(prev => ({ ...prev, [field]: value }))}
        className="space-y-2"
        aria-label={label}
        required={field === 'mood'}
      >
        {Object.entries(options).map(([key, label]) => (
          <div key={key} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={key} 
              id={`${field}-${key}`}
              data-testid={`radio-${field}-${key}`}
              aria-describedby={field === 'mood' ? 'mood-help' : undefined}
            />
            <Label htmlFor={`${field}-${key}`} className="flex-1 cursor-pointer text-sm">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {field === 'mood' && (
        <div id="mood-help" className="text-xs text-muted-foreground">
          Required field - please select your mood for today
        </div>
      )}
    </fieldset>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto" 
      data-testid="daily-reflection-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflection-title"
      aria-describedby="reflection-subtitle"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <Card 
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white my-8 rounded-lg shadow-xl"
          ref={modalRef}
          tabIndex={-1}
        >
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Moon className="w-6 h-6 text-purple-600" aria-hidden="true" />
          </div>
          <CardTitle id="reflection-title" className="text-xl">{reflection.title}</CardTitle>
          <p id="reflection-subtitle" className="text-muted-foreground">{reflection.subtitle}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mood */}
          {renderRadioGroup('mood', reflection.fields.mood.label, reflection.fields.mood.options)}

          {/* Stress */}
          {renderRadioGroup('stress', reflection.fields.stress.label, reflection.fields.stress.options)}

          {/* Sleep */}
          {renderRadioGroup('sleep', reflection.fields.sleep.label, reflection.fields.sleep.options)}

          {/* Energy */}
          {renderRadioGroup('energy', reflection.fields.energy.label, reflection.fields.energy.options)}

          {/* Gratitude */}
          <div className="space-y-2">
            <Label htmlFor="gratitude-input" className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              {reflection.fields.gratitude.label} 
              <span className="text-xs text-muted-foreground">{reflection.fields.gratitude.optional}</span>
            </Label>
            <Textarea
              id="gratitude-input"
              value={formData.gratitude}
              onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
              placeholder={reflection.fields.gratitude.placeholder}
              rows={2}
              data-testid="textarea-gratitude"
              aria-label={`${reflection.fields.gratitude.label} (optional)`}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes-input" className="text-sm font-medium">
              {reflection.fields.notes.label}
              <span className="text-xs text-muted-foreground ml-2">{reflection.fields.notes.optional}</span>
            </Label>
            <Textarea
              id="notes-input"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={reflection.fields.notes.placeholder}
              rows={3}
              data-testid="textarea-notes"
              aria-label={`${reflection.fields.notes.label} (optional)`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="flex-1"
              data-testid="button-skip-reflection"
            >
              {reflection.skip}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitReflectionMutation.isPending}
              className="flex-1"
              data-testid="button-submit-reflection"
            >
              {submitReflectionMutation.isPending ? reflection.submitting : reflection.submit}
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}