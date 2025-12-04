import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { Moon, Sun, Battery, Heart } from "lucide-react";
import strings from "@/i18n/en.json";

interface WeekStripProps {
  onReflectToday?: () => void;
}

export default function WeekStrip({ onReflectToday }: WeekStripProps) {
  const weekStrip = strings.weekStrip;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  // Get this week's reflections
  const { data: reflections = [] } = useQuery({
    queryKey: ['/api/reflections/week'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // No auto-refresh for cost control
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const isToday = isSameDay(date, today);
    const dayKey = format(date, 'EEEE').toLowerCase() as keyof typeof weekStrip.days;
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find reflection for this day
    const reflection = reflections.find((r: any) => r.date === dateStr);
    
    return {
      date,
      dateStr,
      isToday,
      dayLabel: weekStrip.days[dayKey] || format(date, 'EEE'),
      reflection
    };
  });

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'neutral': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      case 'very_low': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStressColor = (stress: string) => {
    switch (stress) {
      case 'very_low': return 'bg-green-500';
      case 'low': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very_high': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getSleepColor = (sleep: string) => {
    switch (sleep) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'very_high': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      case 'very_low': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <Card className="w-full" data-testid="week-strip">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Moon className="w-5 h-5" />
          {weekStrip.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                day.isToday 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={day.isToday && !day.reflection ? onReflectToday : undefined}
              data-testid={`day-${day.dateStr}`}
            >
              {/* Day header */}
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {day.dayLabel}
                </div>
                <div className="text-sm font-semibold">
                  {format(day.date, 'd')}
                </div>
                {day.isToday && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {weekStrip.today}
                  </Badge>
                )}
              </div>

              {/* Reflection indicators */}
              {day.reflection ? (
                <div className="space-y-2">
                  {/* Mood */}
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-muted-foreground" />
                    <div className={`w-2 h-2 rounded-full ${getMoodColor(day.reflection.mood)}`} />
                  </div>
                  
                  {/* Stress */}
                  <div className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-muted-foreground" />
                    <div className={`w-2 h-2 rounded-full ${getStressColor(day.reflection.stress)}`} />
                  </div>
                  
                  {/* Sleep */}
                  <div className="flex items-center gap-1">
                    <Moon className="w-3 h-3 text-muted-foreground" />
                    <div className={`w-2 h-2 rounded-full ${getSleepColor(day.reflection.sleep)}`} />
                  </div>
                  
                  {/* Energy */}
                  <div className="flex items-center gap-1">
                    <Battery className="w-3 h-3 text-muted-foreground" />
                    <div className={`w-2 h-2 rounded-full ${getEnergyColor(day.reflection.energy)}`} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-xs text-muted-foreground">
                    {day.isToday ? weekStrip.tapToReflect : weekStrip.noData}
                  </div>
                  {day.isToday && (
                    <div className="mt-2">
                      <div className="w-6 h-6 border-2 border-dashed border-primary rounded-full flex items-center justify-center mx-auto">
                        <Moon className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-muted-foreground" />
              <span>Mood</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-3 h-3 text-muted-foreground" />
              <span>Stress</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-3 h-3 text-muted-foreground" />
              <span>Sleep</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-3 h-3 text-muted-foreground" />
              <span>Energy</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}