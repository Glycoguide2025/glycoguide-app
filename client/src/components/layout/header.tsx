import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Heart, Menu, BookOpen, Activity, Target, Info, Utensils } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (user && typeof user === 'object' && 'firstName' in user && user.firstName) return user.firstName as string;
    return "there";
  };

  return (
    <>
      {/* Skip Navigation Link for Keyboard Users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-[60] focus:ring-2 focus:ring-primary-foreground focus:outline-none"
        data-testid="skip-to-content"
      >
        Skip to main content
      </a>
      
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={() => setLocation('/')} className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity" data-testid="logo-link">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-foreground">GlycoGuide</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-none" data-testid="greeting">
                  {getGreeting()}, {getFirstName()}
                </p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Access Menu for New Features */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-muted w-9 h-9 sm:w-10 sm:h-10"
                  data-testid="button-features-menu"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/recipes')} className="cursor-pointer" data-testid="menu-recipes">
                  <Utensils className="w-4 h-4 mr-2" />
                  Recipes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/education')} className="cursor-pointer" data-testid="menu-education">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learning Library
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/movement')} className="cursor-pointer" data-testid="menu-movement">
                  <Activity className="w-4 h-4 mr-2" />
                  Movement & Fitness
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/prediabetes-risk')} className="cursor-pointer" data-testid="menu-risk-assessment">
                  <Target className="w-4 h-4 mr-2" />
                  Risk Assessment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/mindfulness')} className="cursor-pointer" data-testid="menu-mindfulness">
                  <Heart className="w-4 h-4 mr-2" />
                  Mindfulness
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/about')} className="cursor-pointer" data-testid="menu-about">
                  <Info className="w-4 h-4 mr-2" />
                  About GlycoGuide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-11 h-11 sm:w-10 sm:h-10 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 bg-primary/10" data-testid="avatar-profile">
                  <AvatarImage src={user && typeof user === 'object' && 'profileImageUrl' in user ? user.profileImageUrl as string : undefined} alt="User profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-base">
                    {(user && typeof user === 'object' && 'firstName' in user && (user.firstName as string)?.[0]?.toUpperCase()) || 
                     (user && typeof user === 'object' && 'email' in user && (user.email as string)?.[0]?.toUpperCase()) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/settings')} className="cursor-pointer" data-testid="menu-settings">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive" 
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', { method: 'POST' });
                      queryClient.clear();
                      window.location.href = '/logged-out';
                    } catch (error) {
                      console.error('Logout error:', error);
                      queryClient.clear();
                      window.location.href = '/logged-out';
                    }
                  }}
                  data-testid="menu-logout"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
