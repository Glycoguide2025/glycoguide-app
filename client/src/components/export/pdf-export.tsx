import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEntitlements } from "@/hooks/useBillingStatus";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, Lock, Clock } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";
import { addDays, format } from "date-fns";
import strings from "@/i18n/en.json";
import { trackPdfExported } from "@/utils/analytics";
import { useAuth } from "@/hooks/useAuth";

interface PDFExportOptions {
  dateRange: {
    from: Date;
    to: Date;
  };
  includeData: {
    summary: boolean;
    meals: boolean;
    reflections: boolean;
    insights: boolean;
    goals: boolean;
  };
  template: 'standard' | 'detailed' | 'medical';
  includeCharts: boolean;
}

export default function PDFExport() {
  const { toast } = useToast();
  const { canExportData, plan, pdf, csv, isLoading } = useEntitlements();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const exportStrings = strings.exports;
  const { user } = useAuth();
  
  // Debug logging
  console.log('[PDF EXPORT DEBUG]', {
    canExportData,
    plan,
    pdf,
    csv,
    isLoading
  });
  
  const [options, setOptions] = useState<PDFExportOptions>({
    dateRange: {
      from: addDays(new Date(), -30), // Last 30 days default
      to: new Date()
    },
    includeData: {
      summary: true,
      meals: true,
      reflections: true,
      insights: true,
      goals: false
    },
    template: 'standard',
    includeCharts: true
  });

  // Check for cached exports (24h caching as per requirements)
  const { data: cachedExports = [] } = useQuery({
    queryKey: ['/api/export/pdf/cache'],
    enabled: !!canExportData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false
  });

  const exportMutation = useMutation({
    mutationFn: async (exportOptions: PDFExportOptions) => {
      // Use GET request with query params to bypass POST blocking
      const params = new URLSearchParams({
        startDate: format(exportOptions.dateRange.from, 'yyyy-MM-dd'),
        endDate: format(exportOptions.dateRange.to, 'yyyy-MM-dd'),
        includeData: JSON.stringify(exportOptions.includeData),
        template: exportOptions.template,
        includeCharts: String(exportOptions.includeCharts)
      });
      
      const response = await fetch(`/api/export/pdf?${params.toString()}`, {
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
        // Track PDF export event
        if (user) {
          const userId = (user as any)?.sub || 'anonymous';
          trackPdfExported(userId, plan || 'free', 'export_success');
        }

        // Download the PDF
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || 'glycoguide-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "PDF Generated",
          description: "Your wellness report has been generated successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to generate PDF report. Please try again.",
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
        description: "Please select a valid date range for your report.",
        variant: "destructive"
      });
      return;
    }

    // Check if at least one data type is selected
    const hasSelection = Object.values(options.includeData).some(Boolean);
    if (!hasSelection) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one type of data to include in your report.",
        variant: "destructive"
      });
      return;
    }

    exportMutation.mutate(options);
  };

  const handleDataTypeChange = (dataType: keyof PDFExportOptions['includeData'], checked: boolean) => {
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
      key: 'summary' as const, 
      label: "Executive Summary", 
      description: "Key insights and trends overview",
      icon: "📊"
    },
    { 
      key: 'meals' as const, 
      label: exportStrings.dataTypes.meals, 
      description: "Meal logs with nutrition breakdown",
      icon: "🍽️"
    },
    { 
      key: 'reflections' as const, 
      label: exportStrings.dataTypes.reflections, 
      description: "Daily wellness tracking and mood patterns",
      icon: "💭"
    },
    { 
      key: 'insights' as const, 
      label: exportStrings.dataTypes.insights, 
      description: "Personalized recommendations and trends",
      icon: "🔍"
    },
    { 
      key: 'goals' as const, 
      label: "Goals & Progress", 
      description: "Goal tracking and achievement status",
      icon: "🎯"
    }
  ];

  const templates = [
    {
      value: 'standard',
      label: 'Standard Report',
      description: '1-page summary with key metrics'
    },
    {
      value: 'detailed',
      label: 'Detailed Report',
      description: 'Multi-page report with charts and analysis'
    },
    {
      value: 'medical',
      label: 'Medical Summary',
      description: 'Structured for healthcare provider review'
    }
  ];

  const isCacheAvailable = Array.isArray(cachedExports) && cachedExports.length > 0;

  return (
    <>
      <Card className="w-full" data-testid="pdf-export">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Wellness Report
            {!canExportData && <Lock className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {canExportData 
              ? "Generate a comprehensive wellness report with charts and analysis"
              : "Upgrade to Premium or Pro to generate PDF wellness reports"
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Cached Reports */}
          {isCacheAvailable && canExportData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Recent Reports Available</span>
              </div>
              <div className="space-y-2">
                {(cachedExports as any[])?.slice(0, 3).map((cached: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">
                      {cached.template} - {cached.dateRange} 
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {String(cached.createdAt)}
                      </Badge>
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(cached.downloadUrl, '_blank')}
                      data-testid={`button-download-cached-${index}`}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Report Period
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">From</Label>
                <input
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
                  className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md"
                  data-testid="pdf-date-from"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">To</Label>
                <input
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
                  className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md"
                  data-testid="pdf-date-to"
                />
              </div>
            </div>
          </div>

          {/* Report Template */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Report Template
            </Label>
            <Select 
              value={options.template} 
              onValueChange={(value: 'standard' | 'detailed' | 'medical') => 
                setOptions(prev => ({ ...prev, template: value }))
              }
              disabled={!canExportData}
            >
              <SelectTrigger data-testid="select-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Data */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Include in Report
            </Label>
            <div className="space-y-3">
              {dataTypes.map((dataType) => (
                <div key={dataType.key} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id={dataType.key}
                    checked={options.includeData[dataType.key]}
                    onCheckedChange={(checked) => handleDataTypeChange(dataType.key, checked as boolean)}
                    disabled={!canExportData}
                    data-testid={`checkbox-${dataType.key}`}
                  />
                  <div className="flex-1">
                    <Label htmlFor={dataType.key} className="cursor-pointer font-medium flex items-center gap-2">
                      <span>{dataType.icon}</span>
                      {dataType.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dataType.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Include Charts */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-charts"
              checked={options.includeCharts}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeCharts: checked as boolean }))}
              disabled={!canExportData}
              data-testid="checkbox-charts"
            />
            <Label htmlFor="include-charts" className="cursor-pointer">
              Include charts and visualizations
            </Label>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={!canExportData || exportMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-generate-pdf"
          >
            {!canExportData ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Upgrade to Generate Reports
              </>
            ) : exportMutation.isPending ? (
              "Generating PDF..."
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </Button>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <strong>Medical Disclaimer:</strong> This report is for informational purposes only and should not be used as a substitute for professional medical advice. Always consult with your healthcare provider before making changes to your treatment plan.
          </div>

          {/* Current Plan Info */}
          {!canExportData && (
            <div className="text-center text-sm text-muted-foreground">
              Currently on {plan} plan • PDF reports available with Premium or Pro
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan="premium"
        feature="PDF Report"
      />
    </>
  );
}