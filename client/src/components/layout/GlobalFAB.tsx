import { useState } from "react";
import { Plus, Utensils, Activity, Droplets, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GlobalFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      id: "meal",
      label: "Meal",
      icon: Utensils,
      description: "Log a meal you just had",
      color: "bg-green-500 hover:bg-green-600 text-white",
    },
    {
      id: "glucose",
      label: "Glucose",
      icon: Droplets,
      description: "Record a glucose reading",
      color: "bg-red-500 hover:bg-red-600 text-white",
    },
    {
      id: "exercise",
      label: "Exercise",
      icon: Activity,
      description: "Track physical activity",
      color: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  ];

  const handleActionClick = (actionId: string) => {
    console.log(`Quick add ${actionId} - placeholder for Step 2`);
    setIsOpen(false);
    // TODO: Step 2 will implement actual logging
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors z-40"
        data-testid="fab-main"
        aria-label="Quick add menu - Log meals, glucose readings, or exercise"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Quick Add</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                data-testid="fab-close"
                aria-label="Close quick add menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className={cn(
                    "w-full flex items-center p-4 rounded-lg transition-colors",
                    "border border-gray-200 dark:border-gray-700",
                    "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  data-testid={`fab-${action.id}`}
                >
                  <div className={cn("p-2 rounded-lg mr-3", action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {action.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}