import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";

export default function WearablesImport() {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>("");
  const [device, setDevice] = useState<string>("");
  const { toast } = useToast();
  const billing = useBillingStatus();
  const { open: openUpgradeModal } = useUpgradeModal();
  
  const plan = billing.plan;
  const hasProPlusAccess = billing.hasFeature('wearablesImport');
  
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    if (!source || !device) {
      toast({
        title: "Missing Information",
        description: "Please select a source and device before uploading.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (2MB limit)
    if (f.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File must be under 2MB. Please reduce file size and try again.",
        variant: "destructive"
      });
      return;
    }
    
    const buf = await f.arrayBuffer();
    const uint8Array = new Uint8Array(buf);
    const b64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    setLoading(true);
    
    try {
      const res = await fetch("/api/wearables/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          filename: f.name, 
          contentBase64: b64,
          source,
          device
        }),
      });
      
      // Handle 402 UPGRADE_REQUIRED response  
      if (res.status === 402) {
        openUpgradeModal("pro");
        return;
      }
      
      const j = await res.json();
      
      if (!res.ok || !j?.success) {
        throw new Error(j?.message || j?.error || "Import failed");
      }
      
      toast({
        title: "Wearable Data Imported Successfully",
        description: `Imported ${j.imported} data points${j.skipped ? ` (${j.skipped} skipped)` : ''} for wellness visualization.`,
      });
      
      // Invalidate React Query caches to refresh UI data
      queryClient.invalidateQueries({ queryKey: ['/api/wearables/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wearables/series'] });
    } catch (e: any) {
      toast({
        title: "Import Failed",
        description: e.message ?? "Unable to import wearable data. Please check your file format.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      e.target.value = ""; // allow re-upload
    }
  }
  
  return (
    <div className="border rounded-2xl p-4" data-testid="wearables-import-container">
      <h3 className="font-semibold mb-2" data-testid="text-wearables-title">
        Import Wearable Data (CSV/JSON)
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3" data-testid="text-wearables-disclaimer">
        Import fitness data from your wearable devices for wellness tracking. Supports steps, heart rate, calories, sleep, and activity data.
      </p>

      {hasProPlusAccess ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="source-select">Data Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source-select" data-testid="select-wearables-source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fitbit">Fitbit</SelectItem>
                  <SelectItem value="apple_health">Apple Health</SelectItem>
                  <SelectItem value="google_fit">Google Fit</SelectItem>
                  <SelectItem value="garmin">Garmin</SelectItem>
                  <SelectItem value="manual">Manual Export</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-input">Device/App Name</Label>
              <Input 
                id="device-input"
                value={device} 
                onChange={(e) => setDevice(e.target.value)}
                placeholder="e.g. Fitbit Charge 5"
                data-testid="input-wearables-device"
                className="text-sm"
              />
            </div>
          </div>
          
          <div>
            <input 
              type="file" 
              accept=".csv,.json" 
              onChange={onFile} 
              disabled={loading || !source || !device}
              data-testid="input-wearables-file"
              className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {loading && (
              <p className="text-sm text-blue-600 dark:text-blue-400" data-testid="text-wearables-loading">
                Processing wearable data...
              </p>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p data-testid="text-wearables-supported-formats">
              <strong>Supported formats:</strong> CSV with timestamp,metric,value columns or JSON with data arrays
            </p>
            <p data-testid="text-wearables-metrics">
              <strong>Metrics:</strong> steps, heart_rate, calories, sleep_duration, distance, active_minutes
            </p>
            <p data-testid="text-wearables-limits">
              <strong>Limits:</strong> Max 2MB file size, 500 data points per import
            </p>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => openUpgradeModal("pro")}
          variant="outline"
          className="w-full"
          data-testid="button-upgrade-wearables"
        >
          Upgrade to Pro+ to import wearable data
        </Button>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2" data-testid="text-wearables-plan-info">
        Your plan: <strong>{plan}</strong> • Pro+ required for wearables import
      </div>
    </div>
  );
}