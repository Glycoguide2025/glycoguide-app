import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";

interface CGMMealOverlayProps {
  mealTime?: string; // ISO timestamp when meal was consumed
  mealName?: string;
  className?: string;
}

export default function CGMMealOverlay({ mealTime, mealName, className = "" }: CGMMealOverlayProps) {
  // If no meal time provided, show placeholder
  if (!mealTime) {
    return (
      <Card className={`border-blue-200 dark:border-blue-800 ${className}`} data-testid="cgm-overlay-placeholder">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm">
            <Activity className="h-4 w-4 mr-2 text-blue-600" />
            CGM Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Log this meal to see your glucose response pattern (±2 hours)
          </p>
        </CardContent>
      </Card>
    );
  }

  const mealDate = new Date(mealTime);
  const startTime = new Date(mealDate.getTime() - 2 * 60 * 60 * 1000); // 2h before
  const endTime = new Date(mealDate.getTime() + 2 * 60 * 60 * 1000); // 2h after

  const { data: cgmData, isLoading } = useQuery({
    queryKey: ['/api/cgm/samples', 'meal-overlay', mealTime],
    queryFn: async () => {
      const res = await fetch(`/api/cgm/samples?start=${startTime.toISOString()}&end=${endTime.toISOString()}`, { 
        credentials: 'include' 
      });
      if (!res.ok) return { samples: [] };
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const samples = cgmData?.samples || [];

  if (isLoading) {
    return (
      <Card className={`border-blue-200 dark:border-blue-800 ${className}`} data-testid="cgm-overlay-loading">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm">
            <Activity className="h-4 w-4 mr-2 text-blue-600" />
            CGM Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading glucose data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (samples.length === 0) {
    return (
      <Card className={`border-blue-200 dark:border-blue-800 ${className}`} data-testid="cgm-overlay-no-data">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm">
            <Activity className="h-4 w-4 mr-2 text-blue-600" />
            CGM Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No CGM data available for ±2 hours around this meal time
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = samples.map((sample: any) => {
    const sampleTime = new Date(sample.takenAt);
    const minutesFromMeal = Math.round((sampleTime.getTime() - mealDate.getTime()) / (1000 * 60));
    return {
      value: sample.value_mgdl,
      time: sampleTime,
      minutesFromMeal,
      timeLabel: sampleTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  // Sort by time
  chartData.sort((a: any, b: any) => a.time.getTime() - b.time.getTime());

  // Calculate stats
  const preMealValues = chartData.filter((d: any) => d.minutesFromMeal <= 0);
  const postMealValues = chartData.filter((d: any) => d.minutesFromMeal > 0);
  
  const preMealAvg = preMealValues.length > 0 
    ? Math.round(preMealValues.reduce((sum: number, d: any) => sum + d.value, 0) / preMealValues.length)
    : null;
    
  const postMealPeak = postMealValues.length > 0
    ? Math.max(...postMealValues.map((d: any) => d.value))
    : null;

  const increase = preMealAvg && postMealPeak ? postMealPeak - preMealAvg : null;

  return (
    <Card className={`border-blue-200 dark:border-blue-800 ${className}`} data-testid="cgm-overlay-chart">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm">
          <Activity className="h-4 w-4 mr-2 text-blue-600" />
          CGM Impact Analysis
          {mealName && <span className="text-xs text-gray-500 ml-2">• {mealName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-40 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value} mg/dL`, 'Glucose']}
                labelFormatter={(label: string) => `Time: ${label}`}
              />
              <ReferenceLine 
                x={mealDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                stroke="#ef4444" 
                strokeDasharray="3 3"
                label={{ value: "Meal", position: "top" }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {preMealAvg ? `${preMealAvg} mg/dL` : '—'}
            </div>
            <div className="text-gray-500">Pre-meal avg</div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {postMealPeak ? `${postMealPeak} mg/dL` : '—'}
            </div>
            <div className="text-gray-500">Peak response</div>
          </div>
          <div>
            <div className={`font-medium ${increase && increase > 50 ? 'text-orange-600' : 'text-green-600'}`}>
              {increase ? `+${increase}` : '—'}
            </div>
            <div className="text-gray-500">Increase</div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          <Clock className="h-3 w-3 inline mr-1" />
          Showing ±2 hours around meal time
        </p>
      </CardContent>
    </Card>
  );
}