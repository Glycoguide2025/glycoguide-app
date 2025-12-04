import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Utensils, Calendar, Croissant } from "lucide-react";
import type { DailyStats } from "@/types";
import type { GlucoseReading } from "@shared/schema";

interface HealthCardsProps {
  stats?: DailyStats;
}

export default function HealthCards({ stats }: HealthCardsProps) {
  const { isAuthenticated } = useAuth();

  const { data: latestGlucose } = useQuery<GlucoseReading>({
    queryKey: ["/api/glucose-readings/latest"],
    enabled: isAuthenticated,
    retry: false,
  });

  const getGlucoseStatus = (value?: number) => {
    if (!value) return { status: "No data", className: "text-muted-foreground" };
    
    if (value < 70) return { status: "Low", className: "glucose-critical" };
    if (value <= 180) return { status: "Normal range", className: "glucose-normal" };
    if (value <= 250) return { status: "High", className: "glucose-high" };
    return { status: "Critical", className: "glucose-critical" };
  };

  const glucoseValue = latestGlucose ? Number(latestGlucose.value) : undefined;
  const glucoseStatus = getGlucoseStatus(glucoseValue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="health-cards">
      {/* Current Glucose Level */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Current Glucose</h3>
            <Droplet className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${glucoseStatus.className}`} data-testid="glucose-value">
              {glucoseValue || '--'}
            </span>
            <span className="text-sm text-muted-foreground">mg/dL</span>
          </div>
          <p className={`text-sm mt-1 ${glucoseStatus.className}`} data-testid="glucose-status">
            {glucoseStatus.status}
          </p>
        </CardContent>
      </Card>

      {/* Daily Carbs */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Carbs Today</h3>
            <Croissant className="w-4 h-4 text-warning" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold" data-testid="carbs-consumed">
              {stats?.totalCarbs || 0}
            </span>
            <span className="text-sm text-muted-foreground">/ 180g</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div 
              className="bg-warning h-2 rounded-full transition-all" 
              style={{ width: `${Math.min((stats?.totalCarbs || 0) / 180 * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Meals Logged */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Meals Today</h3>
            <Utensils className="w-4 h-4 text-accent" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold" data-testid="meals-logged">
              {stats?.totalMeals || 0}
            </span>
            <span className="text-sm text-muted-foreground">of 4</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {4 - (stats?.totalMeals || 0) > 0 
              ? `${4 - (stats?.totalMeals || 0)} ${4 - (stats?.totalMeals || 0) === 1 ? 'meal' : 'meals'} remaining`
              : 'Daily goal reached'
            }
          </p>
        </CardContent>
      </Card>

      {/* Next Appointment */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Next Checkup</h3>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="text-lg font-semibold" data-testid="next-appointment">
            Dec 15
          </div>
          <p className="text-sm text-muted-foreground">Dr. Martinez</p>
        </CardContent>
      </Card>
    </div>
  );
}
