import { Heart, Leaf, Users, Sparkles } from "lucide-react";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F0F4F0] to-[#E8F1E3] pb-24">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12" data-testid="about-hero">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#A9B89E] to-[#8B9DC3] mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#5C5044] mb-4">
            About GlycoGuide
          </h1>
          <p className="text-lg text-[#5C5044]/70 max-w-2xl mx-auto">
            Your wellness companion — balancing food, mood, and movement with mindful awareness.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-sm" data-testid="mission-section">
          <h2 className="text-2xl font-semibold text-[#5C5044] mb-4 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#A9B89E]" />
            Our Mission
          </h2>
          <p className="text-[#5C5044]/80 leading-relaxed mb-4">
            GlycoGuide was created with you in mind — to make balanced living simple, supportive, and sustainable. 
            Our approach blends modern nutrition science with mindful awareness, helping you understand how food, 
            movement, and lifestyle work together to support lasting wellbeing.
          </p>
          <p className="text-[#5C5044]/80 leading-relaxed italic">
            "Created with care to help you reconnect with your body's natural wisdom."
          </p>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm" data-testid="value-gentle">
            <div className="w-12 h-12 rounded-full bg-[#A9B89E]/20 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-[#A9B89E]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5C5044] mb-2">Gentle & Nurturing</h3>
            <p className="text-sm text-[#5C5044]/70">
              We support and encourage, never judge or pressure. Every journey is unique and worthy of respect.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm" data-testid="value-balanced">
            <div className="w-12 h-12 rounded-full bg-[#8B9DC3]/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#8B9DC3]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5C5044] mb-2">Balanced & Mindful</h3>
            <p className="text-sm text-[#5C5044]/70">
              We help you find your body's natural rhythm through awareness, not restriction or control.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm" data-testid="value-community">
            <div className="w-12 h-12 rounded-full bg-[#A9B89E]/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#A9B89E]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5C5044] mb-2">Community-Centered</h3>
            <p className="text-sm text-[#5C5044]/70">
              Your wellness journey is supported by a caring community that understands and encourages.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-sm" data-testid="features-section">
          <h2 className="text-2xl font-semibold text-[#5C5044] mb-6">What We Offer</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#A9B89E] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-[#5C5044] mb-1">Low Glycemic Nutrition</h4>
                <p className="text-sm text-[#5C5044]/70">500+ curated meals designed to support balanced blood sugar and sustained energy.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B9DC3] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-[#5C5044] mb-1">Mindful Movement</h4>
                <p className="text-sm text-[#5C5044]/70">Gentle exercises and sedentary break reminders that honor your body's needs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#A9B89E] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-[#5C5044] mb-1">Emotional Wellness</h4>
                <p className="text-sm text-[#5C5044]/70">Mood tracking, mindfulness practices, and circadian-aligned support throughout your day.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B9DC3] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-[#5C5044] mb-1">Personalized Insights</h4>
                <p className="text-sm text-[#5C5044]/70">Advanced pattern analysis that helps you understand your unique wellness rhythm.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className="bg-gradient-to-br from-[#A9B89E]/10 to-[#8B9DC3]/10 rounded-2xl p-8 border border-[#A9B89E]/20" data-testid="founder-section">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/80 mb-4">
              <Heart className="w-8 h-8 text-[#A9B89E]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#5C5044] mb-3">
              A Personal Note
            </h2>
            <p className="text-[#5C5044]/80 leading-relaxed max-w-2xl mx-auto mb-4">
              GlycoGuide began with a simple belief: that wellness should feel supportive, not stressful. 
              Each feature, from our gentle morning greetings to our evidence-based meal plans, has been 
              crafted with intention and care.
            </p>
            <p className="text-[#5C5044]/80 leading-relaxed max-w-2xl mx-auto mb-4">
              My hope is that GlycoGuide becomes more than an app — that it becomes a trusted companion 
              on your journey to reconnecting with your body's natural wisdom.
            </p>
            <p className="text-[#5C5044]/70 italic mt-6">
              Guided with care by Dr. Cheryl Morgan
            </p>
            <p className="text-sm text-[#5C5044]/50 mt-2">
              Founder, GlycoGuide
            </p>
          </div>
        </div>

        {/* Science-Backed Note */}
        <div className="mt-8 text-center">
          <a 
            href="/science" 
            className="inline-flex items-center gap-2 text-[#A9B89E] hover:text-[#8B9DC3] transition-colors"
            data-testid="link-science"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Backed by Research</span>
          </a>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
