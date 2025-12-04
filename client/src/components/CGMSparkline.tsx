import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface CGMSparklineProps {
  className?: string;
  height?: number;
}

export default function CGMSparkline({ className = "", height = 40 }: CGMSparklineProps) {
  const { data: cgmData } = useQuery({
    queryKey: ['/api/cgm/samples'],
    queryFn: async () => {
      const res = await fetch('/api/cgm/samples', { credentials: 'include' });
      if (!res.ok) return { samples: [] };
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const samples = cgmData?.samples || [];
  
  // Get last 24 hours of data for sparkline
  const recentSamples = samples.slice(-48); // Roughly 24h if 30min intervals
  
  if (recentSamples.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ height }}
        data-testid="cgm-sparkline-empty"
      >
        No CGM data
      </div>
    );
  }

  // Format data for recharts
  const chartData = recentSamples.map((sample: any) => ({
    value: sample.value_mgdl,
    time: new Date(sample.takenAt).getTime()
  }));

  return (
    <div className={`${className}`} style={{ height }} data-testid="cgm-sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}