import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  AlertCircle,
  Zap,
  Clock,
  Wifi,
  WifiOff
} from "lucide-react";

interface CGMReading {
  id: string;
  value: string;
  unit: string;
  source: 'manual' | 'cgm' | 'imported';
  trend?: 'stable' | 'rising_slowly' | 'rising' | 'rising_rapidly' | 'falling_slowly' | 'falling' | 'falling_rapidly';
  alertType?: 'none' | 'low' | 'high' | 'urgent_low' | 'urgent_high';
  recordedAt: string;
  notes?: string;
  cgmDeviceId?: string;
}

interface CGMStatus {
  isConnected: boolean;
  latestReading: CGMReading | null;
  timeSinceLastReading: number | null;
  totalCGMReadings: number;
  deviceId: string | null;
}

// Trend icon mapping
const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'rising_rapidly': return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'rising': return <TrendingUp className="h-4 w-4 text-orange-500" />;
    case 'rising_slowly': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    case 'falling_rapidly': return <TrendingDown className="h-4 w-4 text-red-500" />;
    case 'falling': return <TrendingDown className="h-4 w-4 text-orange-500" />;
    case 'falling_slowly': return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    case 'stable':
    default:
      return <Minus className="h-4 w-4 text-green-500" />;
  }
};

// Alert badge mapping
const getAlertBadge = (alertType?: string) => {
  switch (alertType) {
    case 'urgent_low':
      return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Urgent Low</Badge>;
    case 'low':
      return <Badge variant="destructive" className="text-xs bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Low</Badge>;
    case 'urgent_high':
      return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Urgent High</Badge>;
    case 'high':
      return <Badge variant="destructive" className="text-xs bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />High</Badge>;
    case 'none':
    default:
      return null;
  }
};

// Glucose value color coding
const getGlucoseColor = (value: number) => {
  if (value < 55) return 'text-red-600 font-bold'; // Urgent low
  if (value < 70) return 'text-orange-600'; // Low
  if (value > 300) return 'text-red-600 font-bold'; // Urgent high
  if (value > 180) return 'text-red-500'; // High
  if (value >= 70 && value <= 180) return 'text-green-600'; // Normal
  return 'text-gray-600'; // Default
};

// Format time for display
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
};

export default function CGMPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch CGM status
  const { data: cgmStatus, isLoading: statusLoading } = useQuery<CGMStatus>({
    queryKey: ['/api/cgm/status'],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Fetch CGM readings
  const { data: readings = [], isLoading: readingsLoading } = useQuery<CGMReading[]>({
    queryKey: ['/api/cgm/readings', timeRange],
    queryFn: async () => {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 72;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
      
      const res = await apiRequest('GET', `/api/cgm/readings?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&source=cgm`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate simulation mutation
  const generateSimulation = useMutation({
    mutationFn: async (hours: number) => {
      const res = await apiRequest('POST', '/api/cgm/simulate', { hours });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "CGM Simulation Generated",
        description: `Generated ${data.totalGenerated} readings for demonstration`,
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/cgm/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cgm/readings'] });
    },
    onError: (error) => {
      toast({
        title: "Simulation Failed",
        description: "Failed to generate CGM simulation data",
        variant: "destructive",
      });
    },
  });

  // Group readings by date for timeline display
  const groupedReadings = readings.reduce((groups: Record<string, CGMReading[]>, reading) => {
    const date = new Date(reading.recordedAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(reading);
    return groups;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Wellness Disclaimer */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Wellness Information Only</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              This CGM visualization is for wellness tracking and educational purposes only. 
              It is not intended for medical diagnosis or treatment decisions. Always consult your healthcare provider.
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Continuous Glucose Monitor</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your glucose patterns and trends</p>
        </div>
        
        {/* Demo Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={() => generateSimulation.mutate(24)}
            disabled={generateSimulation.isPending}
            variant="outline"
            size="sm"
            data-testid="button-generate-demo"
          >
            <Zap className="h-4 w-4 mr-2" />
            {generateSimulation.isPending ? 'Generating...' : 'Generate Demo Data'}
          </Button>
        </div>
      </div>

      {/* CGM Status Card */}
      <Card className="mb-6" data-testid="card-cgm-status">
        <CardHeader>
          <CardTitle className="flex items-center">
            {cgmStatus?.isConnected ? (
              <Wifi className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 mr-2 text-gray-400" />
            )}
            CGM Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="text-center py-4 text-gray-500">Loading status...</div>
          ) : cgmStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connection</div>
                <div className={`font-medium ${cgmStatus.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {cgmStatus.isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Latest Reading</div>
                <div className="font-medium">
                  {cgmStatus.latestReading ? (
                    <div className="flex items-center space-x-2">
                      <span className={getGlucoseColor(Number(cgmStatus.latestReading.value))}>
                        {cgmStatus.latestReading.value} {cgmStatus.latestReading.unit}
                      </span>
                      {getTrendIcon(cgmStatus.latestReading.trend)}
                    </div>
                  ) : (
                    <span className="text-gray-500">No readings</span>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Readings</div>
                <div className="font-medium">{cgmStatus.totalCGMReadings}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No status available</div>
          )}
        </CardContent>
      </Card>

      {/* Time Range Selection */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Glucose Timeline</h2>
        <div className="flex space-x-2">
          {['24h', '3d', '7d'].map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              data-testid={`button-range-${range}`}
            >
              {range === '24h' ? '24 Hours' : range === '3d' ? '3 Days' : '7 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline Display */}
      <div className="space-y-6">
        {readingsLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">Loading CGM data...</div>
            </CardContent>
          </Card>
        ) : readings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No CGM Data Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate demo data to see how the CGM timeline works
              </p>
              <Button
                onClick={() => generateSimulation.mutate(24)}
                disabled={generateSimulation.isPending}
                data-testid="button-generate-first-demo"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Demo Data
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedReadings)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayReadings]) => (
              <Card key={date} data-testid={`card-readings-${date}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{formatDate(dayReadings[0].recordedAt)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {dayReadings
                      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                      .map((reading) => (
                        <div 
                          key={reading.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800"
                          data-testid={`reading-${reading.id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{formatTime(reading.recordedAt)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${getGlucoseColor(Number(reading.value))}`}>
                                {reading.value}
                              </span>
                              <span className="text-sm text-gray-500">{reading.unit}</span>
                              {getTrendIcon(reading.trend)}
                            </div>
                            
                            {reading.notes && (
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {reading.notes}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getAlertBadge(reading.alertType)}
                            <Badge variant="outline" className="text-xs">CGM</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}