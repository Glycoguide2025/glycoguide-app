import { useState, startTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Droplet, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

type BloodSugarLog = {
  id: string;
  glucose: number;
  readingType: string | null;
  notes: string | null;
  loggedAt: string;
};

export default function BloodSugarSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const [glucose, setGlucose] = useState("");
  const [readingType, setReadingType] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Get today's blood sugar logs
  const { data: todayLogs } = useQuery<BloodSugarLog[]>({
    queryKey: ["/api/blood-sugar/today"],
    retry: false,
  });

  // Log blood sugar mutation
  const logMutation = useMutation({
    mutationFn: (data: { glucose: number; readingType?: string; notes?: string }) => 
      apiRequest("POST", "/api/blood-sugar", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-sugar/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-sugar/history"] });
      toast({
        title: "Blood Sugar Logged! 💚",
        description: "Your reading has been recorded.",
      });
      // Reset form
      setGlucose("");
      setReadingType("");
      setNotes("");
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log blood sugar",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const glucoseNum = parseInt(glucose);

    if (!glucoseNum) {
      toast({
        title: "Missing Value",
        description: "Please enter a glucose value",
        variant: "destructive",
      });
      return;
    }

    if (glucoseNum < 20 || glucoseNum > 600) {
      toast({
        title: "Invalid Value",
        description: "Glucose value seems out of range. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    logMutation.mutate({
      glucose: glucoseNum,
      readingType: readingType || undefined,
      notes: notes || undefined,
    });
  };

  const getStatusColor = (glucose: number) => {
    // Normal: 70-99 fasting
    if (glucose >= 70 && glucose <= 99) return "text-green-600 dark:text-green-400";
    // Slightly elevated: 100-140
    if (glucose >= 100 && glucose <= 140) return "text-yellow-600 dark:text-yellow-400";
    // High or Low
    if (glucose > 140 || glucose < 70) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getStatusLabel = (glucose: number) => {
    if (glucose >= 70 && glucose <= 99) return "Normal";
    if (glucose >= 100 && glucose <= 140) return "Slightly elevated";
    if (glucose > 140) return "High";
    if (glucose < 70) return "Low";
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Educational Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-green-800 dark:text-green-400 flex items-center">
            <Droplet className="w-6 h-6 mr-2" />
            GlycoGuide Reminder: Check Your Blood Sugar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            GlycoGuide, your holistic wellness companion, is here to remind you: tracking your blood sugar is a vital part of understanding your body's energy balance.
          </p>
          <p>
            Whether you're monitoring fasting levels, post-meal responses, or just checking in—logging your glucose helps you stay informed, empowered, and proactive.
          </p>
          <p>
            Even if you don't have diabetes, tracking can reveal how different foods, sleep, and stress affect your energy levels. Many people feel tired or foggy after meals without realizing their glucose may be spiking. Awareness can help prevent issues down the line.
          </p>
          <p className="font-semibold text-green-700 dark:text-green-400">
            Take a moment to log your blood sugar today. Your body will thank you.
          </p>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => startTransition(() => navigate("/blood-sugar"))}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              data-testid="button-track-blood-sugar"
            >
              <Droplet className="w-4 h-4 mr-2" />
              Track Your Blood Sugar
            </Button>
            <button
              onClick={() => navigate("/blood-sugar#bs-education")}
              className="block text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-center mt-3 w-full underline transition-colors cursor-pointer bg-transparent border-0 p-0"
              data-testid="link-bs-education"
            >
              Explore Diabetes Education →
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
                    <div className={`text-2xl font-bold ${getStatusColor(log.glucose)}`}>
                      {log.glucose} mg/dL
                      {log.readingType && (
                        <span className="text-sm ml-2 capitalize">({log.readingType.replace('-', ' ')})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(log.glucose)}`}>
                    {getStatusLabel(log.glucose)}
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
            data-testid="button-log-blood-sugar"
          >
            <Droplet className="w-4 h-4 mr-2" />
            Log Blood Sugar
          </Button>
        )}
        <Button
          onClick={() => startTransition(() => navigate("/blood-sugar"))}
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
              Log Your Blood Sugar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Glucose (mg/dL) *
                  </label>
                  <Input
                    type="number"
                    placeholder="98"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    required
                    min="20"
                    max="600"
                    data-testid="input-glucose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reading Type
                  </label>
                  <Select value={readingType} onValueChange={setReadingType}>
                    <SelectTrigger data-testid="select-reading-type">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="pre-meal">Pre-Meal</SelectItem>
                      <SelectItem value="post-meal">Post-Meal</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
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
                  data-testid="button-submit-bs"
                >
                  {logMutation.isPending ? "Saving..." : "Save Reading"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setGlucose("");
                    setReadingType("");
                    setNotes("");
                  }}
                  data-testid="button-cancel-bs"
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
