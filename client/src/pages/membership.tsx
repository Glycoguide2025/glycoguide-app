import { Crown, Check, Heart, Leaf, Users, BookOpen, Activity, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24" id="main-content">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3" data-testid="text-membership-title">
            GlycoGuide Membership
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" data-testid="text-membership-subtitle">
            Your wellness journey, supported every step of the way.
          </p>
        </div>

        <Card className="mb-8 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-emerald-700 dark:text-emerald-400">
              About GlycoGuide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              GlycoGuide is a holistic wellness companion designed to support your health journey with a balanced, 
              sustainable approach. We integrate modern nutrition science with mindful awareness to help you 
              understand the interplay of food, movement, and lifestyle.
            </p>
            <p>
              Our platform offers tools for blood sugar tracking, glycemic-index-aware meal planning, 
              food logging, and various wellness practices — all designed with your lasting well-being in mind.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          What Members Enjoy
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <FeatureCard 
            icon={<Leaf className="w-6 h-6 text-emerald-600" />}
            title="500+ Low-GI Recipes"
            description="Access our full library of diabetes-friendly recipes with detailed nutritional information."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-blue-600" />}
            title="Progress Tracking"
            description="Monitor your meals, moods, and milestones with personalized insights."
          />
          <FeatureCard 
            icon={<Heart className="w-6 h-6 text-rose-600" />}
            title="Guided Wellness Practices"
            description="Stress relief, gratitude exercises, and evening wind-down routines."
          />
          <FeatureCard 
            icon={<Moon className="w-6 h-6 text-indigo-600" />}
            title="Sleep & Energy Tracking"
            description="Understand how rest impacts your blood sugar and overall wellness."
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-purple-600" />}
            title="Community Support"
            description="Connect with others on similar wellness journeys in our supportive community."
          />
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-amber-600" />}
            title="Educational Resources"
            description="Evidence-based articles and learning materials for better health decisions."
          />
        </div>

        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visit our website to learn more about membership options and begin your path to better wellness.
            </p>
            <Button 
              onClick={() => window.open('https://glycoguide.app', '_blank')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
              size="lg"
              data-testid="button-visit-website"
            >
              Visit GlycoGuide.app
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
