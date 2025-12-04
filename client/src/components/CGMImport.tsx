import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { Button } from "@/components/ui/button";

export default function CGMImport() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const billing = useBillingStatus();
  const { open: openUpgradeModal } = useUpgradeModal();
  
  const plan = billing.plan;
  const hasCGMAccess = billing.hasFeature('cgmImport');
  
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    const buf = await f.arrayBuffer();
    const uint8Array = new Uint8Array(buf);
    const b64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    setLoading(true);
    
    try {
      const res = await fetch("/api/cgm/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ filename: f.name, contentBase64: b64 }),
      });
      
      // Handle 402 UPGRADE_REQUIRED response  
      if (res.status === 402) {
        openUpgradeModal("premium");
        return;
      }
      
      const j = await res.json();
      
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || "Import failed");
      }
      
      toast({
        title: "CGM Data Imported Successfully",
        description: `Imported ${j.imported} glucose readings for wellness visualization.`,
      });
    } catch (e: any) {
      toast({
        title: "Import Failed",
        description: e.message ?? "Unable to import CGM data. Please check your file format.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      e.target.value = ""; // allow re-upload
    }
  }
  
  return (
    <div className="border rounded-2xl p-4" data-testid="cgm-import-container">
      <h3 className="font-semibold mb-2" data-testid="text-cgm-title">
        Import CGM (CSV/JSON)
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3" data-testid="text-disclaimer">
        GlycoGuide can visualize CGM files you upload for wellness purposes only. It doesn't diagnose or treat any condition. You control what you share and can remove it anytime.
      </p>

      {hasCGMAccess ? (
        <>
          <input 
            type="file" 
            accept=".csv,.json" 
            onChange={onFile} 
            disabled={loading}
            data-testid="input-cgm-file"
            className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {loading && (
            <p className="text-sm text-blue-600 dark:text-blue-400" data-testid="text-loading">
              Processing CGM data...
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2" data-testid="text-supported-formats">
            Supports Dexcom/Libre exports or generic CSV with columns: time,value[,unit]
          </p>
        </>
      ) : (
        <Button 
          onClick={() => openUpgradeModal("premium")}
          variant="outline"
          className="w-full"
          data-testid="button-upgrade-cgm"
        >
          Upgrade to Premium to import CGM data
        </Button>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2" data-testid="text-plan-info">
        Your plan: <strong>{plan}</strong> • Range max: <strong>{billing.entitlements?.rangeMax ?? "7d"}</strong>
      </div>
    </div>
  );
}