import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Footprints, Hand, Dumbbell, PersonStanding, Music, Bike, Heart, Waves, ArrowLeft } from "lucide-react";

const movementTypes = [
  {
    id: "walking",
    title: "Walking for Wellness",
    description: "Simple, accessible movement that builds endurance and supports heart health",
    icon: Footprints,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    path: "/articles/movement/walking-for-wellness"
  },
  {
    id: "stretching",
    title: "Stretching for Flexibility",
    description: "Improve range of motion, reduce tension, and enhance overall mobility",
    icon: Hand,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    path: "/articles/movement/stretching-for-flexibility"
  },
  {
    id: "strength",
    title: "Strength Training",
    description: "Build muscle, boost metabolism, and strengthen bones for vibrant living",
    icon: Dumbbell,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    path: "/articles/movement/strength-training"
  },
  {
    id: "running",
    title: "Running for Balance",
    description: "Cardiovascular exercise that improves endurance and mental clarity",
    icon: PersonStanding,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    path: "/articles/movement/running-for-balance"
  },
  {
    id: "dancing",
    title: "Dancing for Joy",
    description: "Joyful movement that lifts the spirit and improves coordination",
    icon: Music,
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    path: "/articles/movement/dancing-for-joy"
  },
  {
    id: "cycling",
    title: "Cycling for Stamina",
    description: "Low-impact cardio that builds strength and cardiovascular health",
    icon: Bike,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    path: "/articles/movement/cycling-for-stamina"
  },
  {
    id: "yoga",
    title: "Yoga for Harmony",
    description: "Mind-body practice that enhances flexibility, focus, and inner calm",
    icon: Heart,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    path: "/articles/movement/yoga-for-harmony"
  },
  {
    id: "swimming",
    title: "Swimming for Wellness",
    description: "Refreshing, joyful movement that energizes and soothes your whole body",
    icon: Waves,
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    path: "/articles/movement/swimming-for-fitness"
  }
];

export default function MovementHub() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/movement">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-movement">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movement Tracker
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
              <Footprints className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Movement Education</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover different ways to move your body. Each form of exercise offers unique benefits for your physical health, mental well-being, and overall vitality.
            </p>
          </div>
        </div>

        {/* Movement Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movementTypes.map((movement) => {
            const Icon = movement.icon;
            return (
              <Card 
                key={movement.id} 
                className="hover:shadow-lg transition-shadow"
                data-testid={`card-movement-${movement.id}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-full ${movement.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{movement.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {movement.description}
                  </p>
                  <Link href={movement.path}>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid={`button-learn-${movement.id}`}
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Overview */}
        <Card className="mt-8 border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-green-900 dark:text-green-100">💡 Movement Tips</h3>
            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <p>• Choose activities you enjoy - consistency comes from finding joy in movement</p>
              <p>• Start small and gradually increase intensity and duration</p>
              <p>• Mix different types of movement for balanced fitness</p>
              <p>• Listen to your body and rest when needed</p>
              <p>• Any movement is better than no movement - progress at your own pace</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
