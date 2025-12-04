import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, Droplets, Moon, Heart, Lock } from "lucide-react";

const trackingFeatures = [
  {
    id: 1,
    title: "Blood Glucose Tracking",
    description: "Monitor and analyze your blood sugar levels with detailed charts and trends",
    icon: TrendingUp,
    locked: true,
  },
  {
    id: 2,
    title: "Exercise Logging",
    description: "Track your workouts and see how they impact your glucose levels",
    icon: Activity,
    locked: true,
  },
  {
    id: 3,
    title: "Hydration Monitoring",
    description: "Log your daily water intake and build healthy hydration habits",
    icon: Droplets,
    locked: true,
  },
  {
    id: 4,
    title: "Sleep Quality",
    description: "Record your sleep patterns and discover their effect on your health",
    icon: Moon,
    locked: true,
  },
  {
    id: 5,
    title: "Meal Logging",
    description: "Track what you eat and understand how meals affect your glucose",
    icon: Heart,
    locked: true,
  },
];

export default function ProgressPreviewSection() {
  return (
    <section id="progress" className="px-6 py-20 bg-gray-50 dark:bg-gray-900" aria-labelledby="progress-preview-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="progress-preview-heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Track Your Health Progress
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Monitor your wellness journey with comprehensive tracking tools. Upgrade to Pro or Premium to unlock progress tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trackingFeatures.map((feature) => (
            <Card key={feature.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 h-12 w-12 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  {feature.locked && (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
              {feature.locked && (
                <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/20 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Premium Feature</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
          <Lock className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-3">
            Unlock Progress Tracking
          </h3>
          <p className="mb-6 max-w-2xl mx-auto opacity-90">
            Upgrade to Pro ($15/mo) or Premium ($19.99/mo) to access comprehensive health tracking, CGM integration, and personalized insights!
          </p>
          <a href="#pricing">
            <Button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold">
              View Plans & Start Tracking
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
