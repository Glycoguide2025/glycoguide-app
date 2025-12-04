import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEntitlements } from "@/hooks/useBillingStatus";
import { apiRequest } from "@/lib/queryClient";
import { Download, FileSpreadsheet, Lock } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";
import { addDays, format } from "date-fns";
import strings from "@/i18n/en.json";
import { trackCsvExported, trackUpgradeClick } from "@/utils/analytics";
import { useAuth } from "@/hooks/useAuth";

interface ExportOptions {
  dateRange: {
    from: Date;
    to: Date;
  };
  includeData: {
    meals: boolean;
    reflections: boolean;
    glucose: boolean;
    exercise: boolean;
    insights: boolean;
  };
  format: 'csv' | 'csv_detailed';
}

export default function CSVExport() {
  const { toast } = useToast();
  const { canExportData, plan, pdf, csv, isLoading } = useEntitlements();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const exportStrings = strings.exports;
  const { user } = useAuth();
  
  // Debug logging
  console.log('[CSV EXPORT DEBUG]', {
    canExportData,
    plan,
    pdf,
    csv,
    isLoading
  });
  
  const [options, setOptions] = useState<ExportOptions>({
    dateRange: {
      from: addDays(new Date(), -30), // Last 30 days default
      to: new Date()
    },
    includeData: {
      meals: true,
      reflections: true,
      glucose: false,
      exercise: false,
      insights: false
    },
    format: 'csv'
  });

  const exportMutation = useMutation({
    mutationFn: async (exportOptions: ExportOptions) => {
      // Use GET request with query params to bypass POST blocking
      const params = new URLSearchParams({
        startDate: format(exportOptions.dateRange.from, 'yyyy-MM-dd'),
        endDate: format(exportOptions.dateRange.to, 'yyyy-MM-dd'),
        includeData: JSON.stringify(exportOptions.includeData),
        format: exportOptions.format
      });
      
      const response = await fetch(`/api/export/csv?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Export failed');
      }
      
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.downloadUrl) {
        // Track CSV export event
        if (user) {
          const userId = (user as any)?.sub || 'anonymous';
          trackCsvExported(userId, plan || 'free', 'export_success');
        }

        // Download the file
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || 'glycoguide-export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: exportStrings.success,
          description: "Your data has been exported successfully.",
        });
      } else if (data.csvData) {
        // Direct CSV download
        const blob = new Blob([data.csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `glycoguide-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: exportStrings.success,
          description: "Your data has been exported successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleExport = () => {
    if (!canExportData) {
      setShowUpgradeModal(true);
      return;
    }

    // Validate date range
    if (!options.dateRange.from || !options.dateRange.to) {
      toast({
        title: "Invalid Date Range",
        description: "Please select a valid date range for your export.",
        variant: "destructive"
      });
      return;
    }

    // Check if at least one data type is selected
    const hasSelection = Object.values(options.includeData).some(Boolean);
    if (!hasSelection) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one type of data to export.",
        variant: "destructive"
      });
      return;
    }

    exportMutation.mutate(options);
  };

  const handleDataTypeChange = (dataType: keyof ExportOptions['includeData'], checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      includeData: {
        ...prev.includeData,
        [dataType]: checked
      }
    }));
  };

  const dataTypes = [
    { 
      key: 'meals' as const, 
      label: exportStrings.dataTypes.meals, 
      description: "Meal logs, nutrition data, and timing",
      available: true
    },
    { 
      key: 'reflections' as const, 
      label: exportStrings.dataTypes.reflections, 
      description: "Daily mood, stress, sleep, and energy tracking",
      available: true
    },
    { 
      key: 'glucose' as const, 
      label: exportStrings.dataTypes.glucose, 
      description: "Blood sugar readings and trends",
      available: false // Not implemented yet
    },
    { 
      key: 'exercise' as const, 
      label: exportStrings.dataTypes.exercise, 
      description: "Workout logs and activity tracking",
      available: false // Not implemented yet
    },
    { 
      key: 'insights' as const, 
      label: exportStrings.dataTypes.insights, 
      description: "Personalized insights and recommendations",
      available: true
    }
  ];

  return (
    <>
      <Card className="w-full" data-testid="csv-export">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {exportStrings.title}
            {!canExportData && <Lock className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {canExportData 
              ? exportStrings.subtitle 
              : "Upgrade to Premium or Pro to export your wellness data"
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {exportStrings.dateRange}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={format(options.dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: date }
                    }));
                  }}
                  disabled={!canExportData}
                  data-testid="date-from"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={format(options.dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: date }
                    }));
                  }}
                  disabled={!canExportData}
                  data-testid="date-to"
                />
              </div>
            </div>
          </div>

          {/* Data Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {exportStrings.includeData}
            </Label>
            <div className="space-y-3">
              {dataTypes.map((dataType) => (
                <div key={dataType.key} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  !dataType.available ? 'bg-muted/50 opacity-60' : ''
                }`}>
                  <Checkbox
                    id={dataType.key}
                    checked={options.includeData[dataType.key]}
                    onCheckedChange={(checked) => handleDataTypeChange(dataType.key, checked as boolean)}
                    disabled={!canExportData || !dataType.available}
                    data-testid={`checkbox-${dataType.key}`}
                  />
                  <div className="flex-1">
                    <Label htmlFor={dataType.key} className="cursor-pointer font-medium">
                      {dataType.label}
                      {!dataType.available && (
                        <span className="text-xs text-muted-foreground ml-2">(Coming Soon)</span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dataType.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {exportStrings.format}
            </Label>
            <Select 
              value={options.format} 
              onValueChange={(value: 'csv' | 'csv_detailed') => 
                setOptions(prev => ({ ...prev, format: value }))
              }
              disabled={!canExportData}
            >
              <SelectTrigger data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Standard CSV</SelectItem>
                <SelectItem value="csv_detailed">Detailed CSV (with metadata)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={!canExportData || exportMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-export"
          >
            {!canExportData ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {exportStrings.upgrade}
              </>
            ) : exportMutation.isPending ? (
              "Exporting..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {exportStrings.download}
              </>
            )}
          </Button>

          {/* Current Plan Info */}
          {!canExportData && (
            <div className="text-center text-sm text-muted-foreground">
              Currently on {plan} plan • Exports available with Premium or Pro
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan="premium"
        feature="CSV Export"
      />
    </>
  );
}