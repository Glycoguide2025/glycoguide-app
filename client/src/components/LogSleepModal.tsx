import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { InsertSleepLog } from "@shared/schema";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export default function LogSleepModal({ open, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [bedtime, setBedtime] = useState("");
  const [waketime, setWaketime] = useState("");
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");

  // Create sleep log mutation
  const createSleepLogMutation = useMutation({
    mutationFn: async (sleepLogData: InsertSleepLog) => {
      return await apiRequest('/api/sleep-logs', 'POST', sleepLogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-logs'] });
      toast({
        title: "Sleep Log Recorded",
        description: "Your sleep data has been saved successfully!",
      });
      onSave?.();
      onClose();
      // Reset form
      setBedtime("");
      setWaketime("");
      setQuality(3);
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your sleep log. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!open) return null;

  function submit() {
    if (!bedtime || !waketime) {
      toast({
        title: "Missing Information",
        description: "Please add bedtime and wake time.",
        variant: "destructive",
      });
      return;
    }

    // Convert quality (1-5) to quality enum
    const qualityMap = {
      1: 'poor',
      2: 'poor', 
      3: 'fair',
      4: 'good',
      5: 'excellent'
    } as const;

    // Calculate sleep duration
    const bedDate = new Date();
    const [bedHours, bedMinutes] = bedtime.split(':');
    bedDate.setHours(parseInt(bedHours), parseInt(bedMinutes), 0, 0);

    const wakeDate = new Date();
    const [wakeHours, wakeMinutes] = waketime.split(':');
    wakeDate.setHours(parseInt(wakeHours), parseInt(wakeMinutes), 0, 0);

    // If wake time is earlier than bedtime, assume next day
    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const durationHours = (wakeDate.getTime() - bedDate.getTime()) / (1000 * 60 * 60);

    const sleepData: InsertSleepLog = {
      userId: "current-user", // This will be handled by the backend auth middleware
      sleepDuration: durationHours.toFixed(1),
      sleepQuality: qualityMap[quality as keyof typeof qualityMap],
      bedtime: bedDate,
      wakeTime: wakeDate,
      notes: notes.trim() || null,
    };

    createSleepLogMutation.mutate(sleepData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="sleep-title">
      {/* Backdrop */}
      <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      {/* Modal */}
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-xl">
        <button onClick={onClose} className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">×</button>
        <h2 id="sleep-title" className="text-lg font-semibold mb-3 dark:text-white">💤 Log Sleep</h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Bedtime</span>
            <input 
              type="time" 
              value={bedtime} 
              onChange={(e)=>setBedtime(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
              data-testid="input-bedtime"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Wake time</span>
            <input 
              type="time" 
              value={waketime} 
              onChange={(e)=>setWaketime(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
              data-testid="input-waketime"
            />
          </label>

          <div>
            <span className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Sleep quality</span>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Sleep quality">
              {[1,2,3,4,5].map(n=>(
                <button key={n} type="button" aria-pressed={quality===n}
                  onClick={()=>setQuality(n)}
                  className={"h-9 w-9 rounded-full border flex items-center justify-center text-lg transition-all " + (quality>=n ? "bg-blue-50 border-blue-600 dark:bg-blue-900/30 dark:border-blue-400" : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600")}
                  data-testid={`quality-${n}`}
                >
                  {quality>=n ? "⭐" : "☆"}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{quality}/5</span>
            </div>
          </div>

          <label className="block">
            <span className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</span>
            <textarea 
              rows={3} 
              value={notes} 
              onChange={(e)=>setNotes(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white" 
              placeholder="Wind-down, wake-ups, how you felt…"
              data-testid="textarea-notes"
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button 
            onClick={submit} 
            disabled={createSleepLogMutation.isPending}
            className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            data-testid="button-save"
          >
            {createSleepLogMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={onClose} 
            className="rounded-lg border dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Quality rest supports steady energy and healthy daily rhythms.
        </p>
      </div>
    </div>
  );
}