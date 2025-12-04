import { useState } from "react";
import LogSleepModal from "@/components/LogSleepModal";
import RestedCard from "@/components/RestedCard";

export default function HomeSleepSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-3">
      <RestedCard />
      <button 
        onClick={() => setOpen(true)} 
        className="w-full rounded-xl border dark:border-gray-700 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        data-testid="button-open-sleep-modal"
      >
        <div className="flex items-center">
          <span className="text-lg mr-3">💤</span>
          <span className="dark:text-white">Log Sleep</span>
        </div>
      </button>
      <LogSleepModal 
        open={open} 
        onClose={() => setOpen(false)} 
        onSave={() => {
          // Optional: additional actions after save
          console.log('Sleep logged successfully!');
        }}
      />
    </section>
  );
}