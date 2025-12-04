import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Heart, Brain, Activity, Moon, Droplets, Lock } from "lucide-react";

const wellnessGuides = [
  {
    id: 1,
    title: "Hydration & Wellness",
    description: "Learn how proper hydration supports blood sugar balance and overall health",
    icon: Droplets,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: 2,
    title: "Mindfulness Practices",
    description: "Reduce stress and improve glucose control through mindful awareness",
    icon: Brain,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    id: 3,
    title: "Exercise & Movement",
    description: "Discover how physical activity helps regulate blood sugar levels",
    icon: Activity,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    id: 4,
    title: "Sleep Optimization",
    description: "Understand the crucial connection between sleep quality and metabolic health",
    icon: Moon,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    id: 5,
    title: "Digestive Health",
    description: "Support gut health to improve nutrient absorption and blood sugar stability",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    id: 6,
    title: "Energy Management",
    description: "Balance your energy throughout the day with smart nutrition choices",
    icon: Book,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
];

export default function WellnessPreviewSection() {
  return (
    <section id="wellness" className="px-6 py-20 bg-white dark:bg-gray-950" aria-labelledby="wellness-preview-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="wellness-preview-heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Wellness Education Guides
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            In order to access this section you need to upgrade to Pro or Premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wellnessGuides.map((guide) => (
            <Card key={guide.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className={`${guide.bgColor} ${guide.color} h-12 w-12 rounded-lg flex items-center justify-center mb-4`}>
                  <guide.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {guide.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {guide.description}
                </p>
              </CardContent>
              <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/20 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Pro/Premium Feature</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
          <Lock className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-3">
            Unlock Wellness Guides
          </h3>
          <p className="mb-6 max-w-2xl mx-auto opacity-90">
            Upgrade to Pro ($15/mo) or Premium ($19.99/mo) to access comprehensive wellness education guides!
          </p>
          <a href="#pricing">
            <Button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold">
              View Plans & Get Access
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
