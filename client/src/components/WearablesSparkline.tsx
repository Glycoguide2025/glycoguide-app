import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface WearablesSparklineProps {
  metric: 'steps' | 'heart_rate' | 'calories' | 'sleep_duration' | 'distance' | 'active_minutes';
  className?: string;
  height?: number;
  color?: string;
  requireProPlus?: boolean;
}

export default function WearablesSparkline({ 
  metric, 
  className = "", 
  height = 40, 
  color = "#10b981",
  requireProPlus = true 
}: WearablesSparklineProps) {
  const { data: wearablesData, error } = useQuery({
    queryKey: ['/api/wearables/series', metric],
    queryFn: async () => {
      const res = await fetch(`/api/wearables/series/${metric}?limit=48`, { credentials: 'include' });
      if (res.status === 402) {
        // Pro+ required - return empty state
        return { samples: [], needsUpgrade: true };
      }
      if (!res.ok) return { samples: [] };
      const data = await res.json();
      return { samples: data.samples || [], needsUpgrade: false };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });

  const samples = wearablesData?.samples || [];
  const needsUpgrade = wearablesData?.needsUpgrade || false;
  
  if (needsUpgrade && requireProPlus) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ height }}
        data-testid={`wearables-sparkline-${metric}-upgrade`}
      >
        Pro+ required
      </div>
    );
  }
  
  if (samples.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ height }}
        data-testid={`wearables-sparkline-${metric}-empty`}
      >
        No {metric.replace('_', ' ')} data
      </div>
    );
  }

  // Format data for recharts
  const chartData = samples.map((sample: any) => ({
    value: parseFloat(sample.value) || 0,
    time: new Date(sample.timestamp).getTime()
  })).sort((a, b) => a.time - b.time); // Sort by timestamp

  return (
    <div className={`${className}`} style={{ height }} data-testid={`wearables-sparkline-${metric}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}