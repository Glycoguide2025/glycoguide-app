import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type Props = {
  onSubmit?: (mood: "tired"|"ok"|"energized") => void;
};

export default function RestedCard({ onSubmit }: Props) {
  const { toast } = useToast();
  const [picked, setPicked] = useState<"tired"|"ok"|"energized"|null>(null);

  // Energy log mutation
  const logEnergyMutation = useMutation({
    mutationFn: async (level: number) => {
      // Map simple mood to detailed energy format
      const energyMap = {
        1: { physical: 2, mental: 2, emotional: 2, drain: 'sleep' as const }, // tired
        2: { physical: 5, mental: 5, emotional: 5, drain: 'other' as const }, // ok 
        3: { physical: 8, mental: 8, emotional: 8, drain: 'other' as const }  // energized
      };
      
      const energyData = energyMap[level as keyof typeof energyMap] || energyMap[2];
      
      return await apiRequest('POST', '/api/energy-checkin', {
        ...energyData,
        idempotencyKey: crypto.randomUUID()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/energy-checkin'] });
      toast({
        title: "Energy Logged",
        description: "Your morning check-in has been recorded!",
      });
      setPicked(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your energy check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  function send() {
    if (!picked) return;
    
    // Convert mood to energy level
    const levelMap = {
      "tired": 1,
      "ok": 2, 
      "energized": 3
    };
    
    const level = levelMap[picked];
    logEnergyMutation.mutate(level);
    onSubmit?.(picked);
  }

  return (
    <div className="rounded-2xl border dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold dark:text-white">How rested do you feel?</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Morning check-in</span>
      </div>

      <div className="flex gap-2" role="group" aria-label="Rested level">
        {[
          { id:"tired", label:"Tired", emoji:"😴" },
          { id:"ok", label:"Okay", emoji:"😐" },
          { id:"energized", label:"Energized", emoji:"😀" },
        ].map(opt=>(
          <button key={opt.id} type="button" aria-pressed={picked===opt.id}
            onClick={()=>setPicked(opt.id as any)}
            className={
              "flex-1 rounded-xl border px-3 py-3 text-center focus:outline-none focus:ring-2 transition-all " +
              (picked===opt.id 
                ? "bg-blue-50 border-blue-600 focus:ring-blue-600 dark:bg-blue-900/30 dark:border-blue-400" 
                : "bg-white border-gray-300 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600")
            }
            data-testid={`rested-${opt.id}`}
          >
            <div className="text-2xl" aria-hidden="true">{opt.emoji}</div>
            <div className="text-sm mt-1 dark:text-gray-300">{opt.label}</div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button 
          onClick={send} 
          disabled={!picked || logEnergyMutation.isPending}
          className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium disabled:opacity-50 hover:bg-blue-700"
          data-testid="button-save-rested"
        >
          {logEnergyMutation.isPending ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={()=>setPicked(null)} 
          className="rounded-lg border dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Quality rest supports steady energy and healthy daily rhythms.
      </p>
    </div>
  );
}