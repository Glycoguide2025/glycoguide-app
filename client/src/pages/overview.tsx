import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Utensils, Brain, Calendar, Users, 
  Activity, Moon, BookOpen, Stethoscope, 
  Heart, TrendingUp, Shield, Sparkles,
  Crown, CheckCircle, ArrowRight 
} from "lucide-react";

export default function Overview() {
  const { user } = useAuth();

  const sections = [
    {
      title: "Dashboard",
      path: "/",
      icon: Home,
      description: "Your health command center with daily metrics and trends",
      features: [
        "Real-time glucose monitoring",
        "Daily nutrition summary",
        "Health analytics dashboard",
        "Quick action buttons",
        "Healthcare appointment tracking"
      ],
      color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Wellness & Mindfulness",
      path: "/mindfulness", 
      icon: Brain,
      description: "Complete mental health and mindfulness toolkit",
      features: [
        "Guided meditation sessions (unlimited for Pro)",
        "Daily affirmations and positive psychology",
        "Stress management techniques",
        "Breathing exercises and relaxation",
        "Mental wellness tracking",
        "Emotional health resources"
      ],
      color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
      isPremium: true
    },
    {
      title: "Nutrition & Meals",
      path: "/meals",
      icon: Utensils, 
      description: "Smart meal planning with glycemic index guidance",
      features: [
        "Comprehensive meal database",
        "Glycemic index education",
        "Meal logging and nutrition tracking",
        "Smart food recommendations",
        "Carbohydrate counting tools",
        "Blood sugar impact analysis"
      ],
      color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
    },
    {
      title: "Health Planning",
      path: "/planning",
      icon: Calendar,
      description: "Preventive care and personalized health planning",
      features: [
        "Preventive care scheduling",
        "Health goal setting and tracking", 
        "Medication reminders",
        "Appointment management",
        "Personalized wellness plans",
        "Risk assessment tools"
      ],
      color: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
    },
    {
      title: "Community Support",
      path: "/community",
      icon: Users,
      description: "Connect with others on similar health journeys",
      features: [
        "Discussion forums (full participation for Pro)",
        "Support groups for diabetes and wellness",
        "Expert Q&A sessions",
        "Success stories and motivation",
        "Peer accountability partnerships",
        "Health challenges and events"
      ],
      color: "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800",
      isPremium: true
    },
    {
      title: "Health Tracking",
      path: "/tracking",
      icon: Activity,
      description: "Comprehensive health monitoring and analytics",
      features: [
        "Blood glucose tracking",
        "Exercise and activity logging",
        "Weight and vitals monitoring", 
        "Symptom tracking",
        "Health trend analysis",
        "Export reports for doctors"
      ],
      color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
    },
    {
      title: "Sleep & Recovery",
      path: "/sleep",
      icon: Moon,
      description: "Sleep optimization and recovery tracking",
      features: [
        "Sleep quality monitoring",
        "Sleep pattern analysis",
        "Recovery recommendations",
        "Sleep-glucose correlations (Pro)",
        "Sleep hygiene education",
        "Bedtime routine planning"
      ],
      color: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800"
    },
    {
      title: "Personal Journal",
      path: "/journal",
      icon: BookOpen,
      description: "Reflective journaling and mood tracking",
      features: [
        "Daily journal entries",
        "Mood and emotion tracking",
        "Gratitude practice",
        "Health reflection prompts",
        "Personal insights",
        "Progress celebration"
      ],
      color: "bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800"
    },
    {
      title: "Healthcare Integration",
      path: "/consultations",
      icon: Stethoscope,
      description: "Virtual healthcare and professional support",
      features: [
        "Virtual consultations with providers",
        "1-on-1 coaching sessions (Pro monthly)",
        "Healthcare provider directory",
        "Appointment scheduling",
        "Health data sharing with doctors",
        "Clinical insights and recommendations"
      ],
      color: "bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800",
      isPremium: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Complete Platform Overview
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive wellness platform covering physical health, mental wellbeing, 
            and spiritual growth. Explore all features and sections available to you.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Pro Subscriber - Full Access Unlocked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sections.map((section) => {
            const IconComponent = section.icon;
            
            return (
              <Card key={section.path} className={`${section.color} hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white/20 dark:bg-black/20">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.isPremium && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Pro Feature
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {section.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={section.path}>
                    <Button className="w-full group" variant="outline">
                      Explore {section.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Your Holistic Wellness Journey</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                GlycoGuide provides a comprehensive approach to diabetes management and overall wellness, 
                combining physical health tracking, mental wellbeing support, and community connection 
                to help you thrive in all aspects of life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg">
                    <Home className="w-5 h-5 mr-2" />
                    Return to Dashboard
                  </Button>
                </Link>
                <Link href="/subscribe">
                  <Button size="lg" variant="outline">
                    <Crown className="w-5 h-5 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}