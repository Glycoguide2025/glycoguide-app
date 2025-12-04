import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import type { GlucoseReading } from "@shared/schema";

export default function GlucoseChart() {
  const { isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState("7");

  const { data: glucoseReadings } = useQuery<GlucoseReading[]>({
    queryKey: ["/api/glucose-readings", timeRange],
    queryFn: async () => {
      const startDate = new Date(Date.now() - Number(timeRange) * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const url = `/api/glucose-readings?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch glucose readings');
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const getAverageGlucose = () => {
    if (!glucoseReadings || glucoseReadings.length === 0) return 0;
    const sum = glucoseReadings.reduce((acc, reading) => acc + Number(reading.value), 0);
    return Math.round(sum / glucoseReadings.length);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7": return "Last 7 days";
      case "30": return "Last 30 days";
      case "90": return "Last 90 days";
      default: return "Last 7 days";
    }
  };

  return (
    <Card data-testid="glucose-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Blood Sugar Trends</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]" data-testid="time-range-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64 chart-container rounded-lg flex items-center justify-center border border-border" data-testid="chart-placeholder">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary/50" />
            <p className="font-medium mb-1">Glucose Trends</p>
            <p className="text-sm">
              {glucoseReadings && glucoseReadings.length > 0 ? (
                <>
                  Average: <span className="font-semibold text-foreground">{getAverageGlucose()} mg/dL</span>
                  <br />
                  <span className="text-xs">{glucoseReadings.length} readings over {getTimeRangeLabel().toLowerCase()}</span>
                </>
              ) : (
                <>
                  No glucose data available
                  <br />
                  <span className="text-xs">Start logging readings to see trends</span>
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
