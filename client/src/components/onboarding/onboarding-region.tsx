import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";
import { useState } from "react";

interface OnboardingRegionProps {
  onNext: (data: { region: string; bloodSugarUnit: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OnboardingRegion({ onNext, onBack, isLoading }: OnboardingRegionProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const handleNext = () => {
    if (selectedRegion) {
      const bloodSugarUnit = selectedRegion === 'United States' ? 'mg/dL' : 'mmol/L';
      onNext({
        region: selectedRegion,
        bloodSugarUnit
      });
    }
  };

  const regions = [
    { value: 'Canada', label: '🇨🇦 Canada', unit: 'mmol/L' },
    { value: 'United States', label: '🇺🇸 United States', unit: 'mg/dL' },
    { value: 'Other', label: '🌍 Other', unit: 'mmol/L default' }
  ];

  return (
    <Card className="w-full" data-testid="onboarding-region">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Select Your Region</h1>
        <p className="text-muted-foreground">
          GlycoGuide uses regional standards to display and store your blood sugar readings correctly.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {regions.map((region) => (
            <button
              key={region.value}
              onClick={() => setSelectedRegion(region.value)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                ${selectedRegion === region.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              data-testid={`button-region-${region.value.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${selectedRegion === region.value ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium text-foreground">{region.label}</div>
                    <div className="text-sm text-muted-foreground">({region.unit})</div>
                  </div>
                </div>
                {selectedRegion === region.value && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          You can change your region anytime in Settings.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1"
            disabled={!selectedRegion || isLoading}
            data-testid="button-continue"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
