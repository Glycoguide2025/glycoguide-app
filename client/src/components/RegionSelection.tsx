import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RegionOption {
  id: string;
  label: string;
  flag: string;
  unit: string;
}

const REGIONS: RegionOption[] = [
  { id: 'Canada', label: 'Canada', flag: '🇨🇦', unit: 'mmol/L' },
  { id: 'United States', label: 'United States', flag: '🇺🇸', unit: 'mg/dL' },
  { id: 'Other', label: 'Other', flag: '🌍', unit: 'mmol/L' }
];

interface RegionSelectionProps {
  onComplete?: () => void;
  showSkip?: boolean;
}

export default function RegionSelection({ onComplete, showSkip = false }: RegionSelectionProps) {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // Fetch current user to get existing preference
  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
  });

  const saveRegionMutation = useMutation({
    mutationFn: async (regionId: string) => {
      const region = REGIONS.find(r => r.id === regionId);
      if (!region) throw new Error('Invalid region');

      return await apiRequest('PATCH', '/api/user/region', {
        region: region.id,
        bloodSugarUnit: region.unit
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Region Saved",
        description: "Your blood sugar readings will use the correct unit for your region.",
      });
      if (onComplete) {
        onComplete();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save region preference. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handleSave = () => {
    if (!selectedRegion) {
      toast({
        title: "Please select a region",
        description: "Choose your region to continue.",
        variant: "destructive"
      });
      return;
    }
    saveRegionMutation.mutate(selectedRegion);
  };

  const handleSkip = () => {
    // Set default to Other/mmol/L
    saveRegionMutation.mutate('Other');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4 mx-auto">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl mb-2">Select Your Region</CardTitle>
          <p className="text-sm text-muted-foreground">
            GlycoGuide uses regional standards to display and store your blood sugar readings correctly.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Region Options */}
          <div className="space-y-3">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionSelect(region.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRegion === region.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                data-testid={`button-region-${region.id.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{region.flag}</span>
                    <div>
                      <div className="font-semibold">{region.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Blood sugar unit: {region.unit}
                      </div>
                    </div>
                  </div>
                  {selectedRegion === region.id && (
                    <Check className="w-5 h-5 text-primary" data-testid="icon-selected" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {showSkip && (
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={saveRegionMutation.isPending}
                className="flex-1"
                data-testid="button-skip-region"
              >
                Continue
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!selectedRegion || saveRegionMutation.isPending}
              className={showSkip ? 'flex-1' : 'w-full'}
              data-testid="button-save-region"
            >
              {saveRegionMutation.isPending ? 'Saving...' : 'Save Region Preference'}
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            You can change your region anytime in Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
