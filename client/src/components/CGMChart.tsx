import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface CGMReading {
  id: string;
  value: number;
  recordedAt: string;
  trend?: 'rising_slowly' | 'rising' | 'rising_rapidly' | 'falling_slowly' | 'falling' | 'falling_rapidly' | 'stable';
  isLive?: boolean;
  source: 'manual' | 'cgm' | 'imported';
}

interface CGMChartProps {
  readings: CGMReading[];
  title?: string;
  height?: number;
  className?: string;
}

export default function CGMChart({ 
  readings, 
  title = "Blood Glucose", 
  height = 200,
  className = ""
}: CGMChartProps) {
  // Transform readings for chart
  const chartData = readings.map(reading => ({
    time: format(new Date(reading.recordedAt), 'HH:mm'),
    value: Number(reading.value),
    timestamp: reading.recordedAt,
    trend: reading.trend,
    isLive: reading.isLive,
    source: reading.source
  }));

  // Get latest reading for current value display
  const latestReading = readings[readings.length - 1];
  
  // Determine line color based on glucose ranges
  const getLineColor = (value: number) => {
    if (value < 70) return '#ef4444'; // red for low
    if (value < 140) return '#22c55e'; // green for normal
    if (value < 200) return '#f59e0b'; // amber for elevated
    return '#ef4444'; // red for high
  };

  // Get trend icon
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'rising_rapidly':
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'rising_slowly':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'falling_rapidly':
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'falling_slowly':
        return <TrendingDown className="w-4 h-4 text-gray-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  if (readings.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No glucose readings available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="cgm-chart">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {latestReading && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${latestReading.isLive ? 'border-green-500 text-green-700' : 'border-gray-300'}`}
              >
                {latestReading.isLive ? 'Live' : latestReading.source}
              </Badge>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold">
                  {latestReading.value}
                </span>
                <span className="text-sm text-muted-foreground">mg/dL</span>
                {getTrendIcon(latestReading.trend)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              domain={['dataMin - 20', 'dataMax + 20']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={40}
            />
            
            {/* Target range reference lines */}
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} />
            
            <Line
              type="monotone"
              dataKey="value"
              stroke={latestReading ? getLineColor(Number(latestReading.value)) : '#6366f1'}
              strokeWidth={2}
              dot={{
                fill: latestReading ? getLineColor(Number(latestReading.value)) : '#6366f1',
                strokeWidth: 2,
                r: 3
              }}
              activeDot={{
                r: 5,
                stroke: latestReading ? getLineColor(Number(latestReading.value)) : '#6366f1',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Range indicators */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Low: &lt;70</span>
          <span>Target: 70-140</span>
          <span>High: &gt;200</span>
        </div>
      </CardContent>
    </Card>
  );
}