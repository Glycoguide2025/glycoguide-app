import { useState, startTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

type BloodPressureLog = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  loggedAt: string;
};

export default function BloodPressureSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Get today's blood pressure logs
  const { data: todayLogs } = useQuery<BloodPressureLog[]>({
    queryKey: ["/api/blood-pressure/today"],
    retry: false,
  });

  // Log blood pressure mutation
  const logMutation = useMutation({
    mutationFn: (data: { systolic: number; diastolic: number; pulse?: number; notes?: string }) => 
      apiRequest("POST", "/api/blood-pressure", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure/history"] });
      toast({
        title: "Blood Pressure Logged! 💚",
        description: "Your reading has been recorded.",
      });
      // Reset form
      setSystolic("");
      setDiastolic("");
      setPulse("");
      setNotes("");
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log blood pressure",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);
    const pulseNum = pulse ? parseInt(pulse) : undefined;

    if (!systolicNum || !diastolicNum) {
      toast({
        title: "Missing Values",
        description: "Please enter both systolic and diastolic values",
        variant: "destructive",
      });
      return;
    }

    if (systolicNum < 50 || systolicNum > 300 || diastolicNum < 30 || diastolicNum > 200) {
      toast({
        title: "Invalid Values",
        description: "Blood pressure values seem out of range. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    logMutation.mutate({
      systolic: systolicNum,
      diastolic: diastolicNum,
      pulse: pulseNum,
      notes: notes || undefined,
    });
  };

  const getStatusColor = (systolic: number, diastolic: number) => {
    // Normal: <120 and <80
    if (systolic < 120 && diastolic < 80) return "text-green-600 dark:text-green-400";
    // Elevated: 120-129 and <80
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return "text-yellow-600 dark:text-yellow-400";
    // High: ≥130 or ≥80
    if (systolic >= 130 || diastolic >= 80) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getStatusLabel = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return "Elevated";
    if (systolic >= 130 || diastolic >= 80) return "High";
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Educational Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-green-800 dark:text-green-400 flex items-center">
            <Heart className="w-6 h-6 mr-2" />
            GlycoGuide Reminder: Your Heart Deserves Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            GlycoGuide, your holistic wellness companion, is here to gently remind you: checking your blood pressure is a vital part of whole-body health.
          </p>
          <p>
            Whether your readings tend to run high, low, or just right—logging your blood pressure helps you stay informed, empowered, and proactive.
          </p>
          <p>
            Even if you don't have a diagnosed issue, occasional checks can reveal early changes. Many people dismiss headaches, fatigue, or dizziness—only to discover later that elevated pressure was quietly building. Awareness can prevent serious complications like stroke or heart attack.
          </p>
          <p className="font-semibold text-green-700 dark:text-green-400">
            Take a moment to log your blood pressure today. Your heart will thank you.
          </p>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => startTransition(() => navigate("/blood-pressure"))}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
              data-testid="button-track-blood-pressure"
            >
              <Heart className="w-4 h-4 mr-2" />
              Track Your Blood Pressure
            </Button>
            <button
              onClick={() => navigate("/blood-pressure#bp-education")}
              className="block text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-center mt-3 w-full underline transition-colors cursor-pointer bg-transparent border-0 p-0"
              data-testid="link-bp-education"
            >
              Explore Blood Pressure Education →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Logs Display */}
      {todayLogs && todayLogs.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-800 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Today's Readings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-bold ${getStatusColor(log.systolic, log.diastolic)}`}>
                      {log.systolic}/{log.diastolic}
                      {log.pulse && <span className="text-sm ml-2">({log.pulse} bpm)</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(log.systolic, log.diastolic)}`}>
                    {getStatusLabel(log.systolic, log.diastolic)}
                  </div>
                </div>
                {log.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{log.notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            data-testid="button-log-blood-pressure"
          >
            <Heart className="w-4 h-4 mr-2" />
            Log Blood Pressure
          </Button>
        )}
        <Button
          onClick={() => startTransition(() => navigate("/blood-pressure"))}
          variant="outline"
          className="w-full border-green-700 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
          data-testid="button-view-history"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Full History
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gray-50 dark:bg-gray-800 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Log Your Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Systolic (mmHg) *
                  </label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    required
                    min="50"
                    max="300"
                    data-testid="input-systolic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diastolic (mmHg) *
                  </label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    required
                    min="30"
                    max="200"
                    data-testid="input-diastolic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pulse (bpm)
                  </label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    min="30"
                    max="220"
                    data-testid="input-pulse"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="Any notes about this reading..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  data-testid="input-notes"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                  disabled={logMutation.isPending}
                  data-testid="button-submit-bp"
                >
                  {logMutation.isPending ? "Saving..." : "Save Reading"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSystolic("");
                    setDiastolic("");
                    setPulse("");
                    setNotes("");
                  }}
                  data-testid="button-cancel-bp"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
