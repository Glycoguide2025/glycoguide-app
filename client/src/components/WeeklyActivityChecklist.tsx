import React, { useEffect, useMemo, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Download, BookOpen } from "lucide-react";
import { Link } from "wouter";

/** Enhanced health categories for comprehensive weekly tracking */
const WEEKLY_CATEGORIES = [
  { key: 'sleep', label: 'Sleep' },
  { key: 'hydration', label: 'Hydration' },
  { key: 'exercise', label: 'Exercise' },
  { key: 'bm', label: 'Bowel Movement' },
] as const;

/** Legacy categories for existing weekly activity checklist */
const CATEGORIES = [
  { key: "energy",       label: "Energy",       color: "bg-orange-500" },
  { key: "mindfulness",  label: "Mindfulness",  color: "bg-purple-500" },
  { key: "movement",     label: "Movement",     color: "bg-green-500" },
  { key: "sleep",        label: "Sleep",        color: "bg-indigo-500" },
  { key: "hydration",    label: "Hydration",    color: "bg-cyan-500" },
] as const;

export type WeeklyCategoryKey = typeof WEEKLY_CATEGORIES[number]['key'];
export type DotStatus = 'green' | 'yellow' | 'gray';
type CategoryKey = typeof CATEGORIES[number]["key"];
type BmStatus = "green" | "yellow" | "gray";
type DayKey = "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun";

const DAYS: DayKey[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/** Keyed by ISO week to reset automatically each week */
function storageKeyForThisWeek() {
  const d = new Date();
  // ISO week number
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (tmp.getUTCDay() || 7);
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((tmp.getTime()-yearStart.getTime())/86400000)+1)/7);
  return `weeklyChecklist:${tmp.getUTCFullYear()}-W${weekNo}`;
}

// Component for rendering BM dots with traffic-light colors
function BmDot({ status, isToday = false }: { status: BmStatus; isToday?: boolean }) {
  const colorClass = {
    green: "bg-green-500",
    yellow: "bg-yellow-500", 
    gray: "bg-gray-300"
  }[status];
  
  const sizeClass = isToday ? "w-3 h-3" : "w-2.5 h-2.5";
  
  return (
    <div 
      className={`${sizeClass} ${colorClass} rounded-full cursor-pointer transition-all duration-200 hover:scale-110`}
      title={isToday ? `Today's BM: ${status}` : `BM: ${status}`}
    />
  );
}

type ChecklistState = Record<DayKey, Record<CategoryKey, boolean>>;

function defaultState(): ChecklistState {
  const base: ChecklistState = { Mon:{} as any, Tue:{} as any, Wed:{} as any, Thu:{} as any, Fri:{} as any, Sat:{} as any, Sun:{} as any };
  DAYS.forEach(d => {
    CATEGORIES.forEach(c => { (base[d] as any)[c.key] = false; });
  });
  return base;
}

export default function WeeklyActivityChecklist() {
  const queryClient = useQueryClient();
  const skey = useMemo(storageKeyForThisWeek, []);
  const [state, setState] = useState<ChecklistState>(() => {
    try {
      const raw = localStorage.getItem(skey);
      return raw ? JSON.parse(raw) as ChecklistState : defaultState();
    } catch { return defaultState(); }
  });

  // Weekly BM checklist data query for traffic-light status across all days
  const { data: weeklyBmData } = useQuery({
    queryKey: ['/api/checklist/week'],
    queryFn: async () => {
      const response = await fetch('/api/checklist/week', { credentials: 'include', cache: 'no-cache' });
      if (!response.ok) throw new Error('Failed to fetch weekly BM checklist');
      return response.json();
    },
  });

  // Fetch weekly activity data from server
  const { data: serverData, isLoading, error } = useQuery({
    queryKey: ['/api/activity/weekly'],
    queryFn: async () => {
      const response = await fetch('/api/activity/weekly', { credentials: 'include', cache: 'no-cache' });
      if (!response.ok) throw new Error('Failed to fetch weekly data');
      return response.json();
    },
  });

  // Sync server data to local state when available
  const prevServerDataRef = useRef<string>('');
  useEffect(() => {
    if (serverData?.weeks?.length > 0) {
      // Find current week's data from server
      const currentWeekData = serverData.weeks.find((week: any) => 
        week.isoYear === serverData.current.isoYear && 
        week.isoWeek === serverData.current.isoWeek
      );
      
      if (currentWeekData?.payload) {
        // Only update state if server data actually changed (prevent infinite loop)
        const newData = JSON.stringify(currentWeekData.payload);
        if (newData !== prevServerDataRef.current) {
          prevServerDataRef.current = newData;
          setState(currentWeekData.payload);
          // Also sync to localStorage as backup
          localStorage.setItem(skey, JSON.stringify(currentWeekData.payload));
        }
      }
    }
  }, [serverData, skey]);

  // Save to server (debounced)
  const saveToServerMutation = useMutation({
    mutationFn: async (payload: ChecklistState) => {
      const response = await fetch('/api/activity/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payload }),
      });
      if (!response.ok) throw new Error('Failed to save weekly data');
      return response.json();
    },
    onError: (error) => {
      console.warn('Failed to save to server, using localStorage fallback:', error);
      // Fallback to localStorage if server fails
      localStorage.setItem(skey, JSON.stringify(state));
    },
  });

  /** Persist to localStorage when state changes */
  useEffect(() => {
    // Always save to localStorage immediately for fast UI updates
    localStorage.setItem(skey, JSON.stringify(state));
  }, [state, skey]);
  
  /** Save to server only when user makes changes (not on initial load/sync) */
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  useEffect(() => {
    if (!hasUserInteraction) return; // Skip saving if no user interaction yet
    
    // Debounced save to server
    const timeoutId = setTimeout(() => {
      saveToServerMutation.mutate(state);
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [state, hasUserInteraction]);

  /** Toggle a dot (done <-> missed) */
  function toggle(day: DayKey, cat: CategoryKey) {
    setHasUserInteraction(true);
    setState(prev => ({
      ...prev,
      [day]: { ...prev[day], [cat]: !prev[day][cat] }
    }));
  }

  /** Optional: mark all for a day done/reset */
  function markAll(day: DayKey, value: boolean) {
    setHasUserInteraction(true);
    setState(prev => ({
      ...prev,
      [day]: CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: value }), {} as Record<CategoryKey, boolean>)
    }));
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h2 className="text-lg font-semibold">7-Day Activity Checklist</h2>
            <p className="text-sm text-gray-600">Tap a dot when you complete an item. Colored = done · Gray = not done.</p>
          </div>
        </div>
        <Legend />
      </header>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS.map((day) => (
          <div key={day} className="rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{day}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => markAll(day, true)}
                  className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100"
                  aria-label={`Mark all ${day} done`}
                  data-testid={`button-all-${day.toLowerCase()}`}
                >All</button>
                <button
                  onClick={() => markAll(day, false)}
                  className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  aria-label={`Reset all ${day}`}
                  data-testid={`button-reset-${day.toLowerCase()}`}
                >Reset</button>
              </div>
            </div>

            <ul className="space-y-2">
              {CATEGORIES.map((c) => {
                const done = state[day][c.key];
                return (
                  <li key={c.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{c.label}</span>
                    <button
                      aria-label={`${c.label} ${day} ${done ? "completed" : "not completed"}`}
                      onClick={() => toggle(day, c.key)}
                      className={[
                        "h-4 w-4 rounded-full border transition-transform",
                        done ? `${c.color} border-transparent` : "bg-gray-200 border-gray-300",
                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                      ].join(" ")}
                      title={done ? "Done" : "Tap to mark done"}
                      data-testid={`dot-${c.key}-${day.toLowerCase()}`}
                    />
                  </li>
                );
              })}
              
              {/* BM with traffic-light system */}
              <li className="flex items-center justify-between">
                <span className="text-sm text-gray-700">BM</span>
                {(() => {
                  // Get current day for today's special status
                  const today = new Date();
                  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const currentDay = dayNames[today.getDay()];
                  const isToday = currentDay === day;
                  
                  // Use weekly BM data for the specific day
                  let bmStatus: BmStatus = "gray";
                  if (weeklyBmData?.week?.[day]) {
                    bmStatus = weeklyBmData.week[day] as BmStatus;
                  }
                  
                  return <BmDot status={bmStatus} isToday={isToday} />;
                })()}
              </li>
            </ul>
          </div>
        ))}
      </div>

      {/* Weekly reset hint */}
      <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
        This checklist resets automatically each week. Your progress syncs across devices.
      </p>

      {/* Movement Education Hub Button */}
      <div className="flex justify-center mt-6">
        <Link href="/movement-education">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            data-testid="button-movement-hub"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Explore Movement Education
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-full bg-gray-200 border border-gray-300" /> Missed
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-full bg-orange-500" /> Energy
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-full bg-purple-500" /> Mindfulness
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> Movement
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" /> Sleep
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-full bg-cyan-500" /> Hydration
      </span>
      <span className="font-medium text-gray-700">BM:</span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" /> Comfortable
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" /> Logged
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" /> None
      </span>
    </div>
  );
}

// Enhanced weekly checklist with health categories and pagination
type WeeklyHealthData = {
  days: Array<{
    date: string;
    sleep: { status: DotStatus; label: string };
    hydration: { status: DotStatus; label: string };
    exercise: { status: DotStatus; label: string };
    bm: { status: DotStatus; label: string };
  }>;
};

function HealthDot({ status }: { status: DotStatus }) {
  const colorClass = {
    green: "bg-green-500",
    yellow: "bg-yellow-500", 
    gray: "bg-gray-300"
  }[status];
  
  return (
    <div 
      className={`w-3 h-3 ${colorClass} rounded-full cursor-pointer transition-all duration-200 hover:scale-110`}
      title={`Status: ${status}`}
    />
  );
}

export function EnhancedWeeklyChecklist() {
  const [startISO, setStartISO] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // Rolling 7-day window
    return d.toISOString().slice(0, 10);
  });

  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery<WeeklyHealthData>({
    queryKey: ['/api/checklist/week', { start: startISO, days: 7 }],
  });

  function shift(days: number) {
    const d = new Date(startISO);
    d.setDate(d.getDate() + days);
    setStartISO(d.toISOString().slice(0, 10));
  }

  // Auto-refresh after health data check-ins
  const refreshHealthData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['weekly-health-checklist'] });
    await queryClient.invalidateQueries({ queryKey: ['bm','week'] });
    await queryClient.invalidateQueries({ queryKey: ['checklist','today'] });
  };

  useEffect(() => {
    // Set up listener for health data updates
    const handleHealthUpdate = () => refreshHealthData();
    window.addEventListener('health-data-updated', handleHealthUpdate);
    return () => window.removeEventListener('health-data-updated', handleHealthUpdate);
  }, []);

  const days = data?.days || [];
  const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  if (error) {
    return (
      <div className="border border-red-200 rounded-xl p-4 bg-red-50 dark:bg-red-950/20">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Unable to load health tracker. Please refresh the page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex gap-2">
                  {[1,2,3,4,5,6,7].map(j => (
                    <div key={j} className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !days || days.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No health data available for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-900">
      {/* Header with pagination */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => shift(-7)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
          data-testid="button-prev-week"
        >
          ← Previous
        </button>
        
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {days.length > 0 && (
            <>
              {dateFormat.format(new Date(days[0].date))} — {dateFormat.format(new Date(days[days.length - 1].date))}
            </>
          )}
        </div>
        
        <button 
          onClick={() => shift(7)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
          data-testid="button-next-week"
        >
          Next →
        </button>
      </div>

      {/* Grid of health categories and days */}
      <div className="space-y-3">
        {WEEKLY_CATEGORIES.map(category => (
          <div key={category.key} className="flex items-center gap-3">
            <div className="w-28 text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
              {category.label}
            </div>
            <div className="flex gap-2">
              {days.map(day => {
                const categoryData = (day as any)[category.key];
                const status = (categoryData?.status || 'gray') as DotStatus;
                return (
                  <div 
                    key={`${category.key}-${day.date}`} 
                    className="flex flex-col items-center gap-1"
                    title={`${category.label} — ${day.date}: ${status}`}
                    data-testid={`dot-${category.key}-${day.date}`}
                  >
                    <HealthDot status={status} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm font-bold text-gray-900 dark:text-white">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            Good
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            Needs improvement
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
            No data
          </span>
        </div>
      </div>

      {/* Email sharing section */}
      <EmailSharingSection startISO={startISO} days={7} />
    </div>
  );
}

// Email sharing component for weekly reports
function EmailSharingSection({ startISO, days }: { startISO: string; days: number }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [isOpen, setIsOpen] = useState(false);

  const emailMutation = useMutation({
    mutationFn: async ({ to, format, start, days }: { to: string; format: string; start: string; days: number }) => {
      return apiRequest('/api/reports/email', 'POST', { to, format, start, days });
    },
    onSuccess: () => {
      toast({
        title: "Report sent!",
        description: `Weekly health report sent to ${email}`,
      });
      setEmail("");
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send report",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    emailMutation.mutate({ to: email, format, start: startISO, days });
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Share your weekly health summary
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              data-testid="button-share-email"
            >
              <Mail className="w-4 h-4" />
              Share via Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Weekly Health Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Report Format</Label>
                <Select value={format} onValueChange={(value: "pdf" | "csv") => setFormat(value)}>
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  disabled={emailMutation.isPending}
                  data-testid="button-send-email"
                >
                  {emailMutation.isPending ? "Sending..." : "Send Report"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}