import { Link, useLocation } from "wouter";
import { Home, Utensils, Brain, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPage?: string;
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string, page?: string) => {
    if (page) return currentPage === page;
    return location === path;
  };

  return (
    <nav 
      id="navigation"
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50" 
      data-testid="bottom-navigation"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 h-16">
        <Link 
          href="/"
          className={cn(
            "flex flex-col items-center justify-center space-y-1 h-full w-full transition-colors focus-visible-enhanced",
            isActive("/", "home") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="nav-home"
          aria-label="Go to Home"
          aria-current={isActive("/", "home") ? "page" : undefined}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link 
          href="/meals"
          className={cn(
            "flex flex-col items-center justify-center space-y-1 h-full w-full transition-colors focus-visible-enhanced",
            isActive("/meals", "meals") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="nav-meals"
          aria-label="Go to Meals"
          aria-current={isActive("/meals", "meals") ? "page" : undefined}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-xs">Meals</span>
        </Link>
        
        <Link 
          href="/mindfulness"
          className={cn(
            "flex flex-col items-center justify-center space-y-1 h-full w-full transition-colors focus-visible-enhanced",
            isActive("/mindfulness", "mindfulness") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="nav-mindfulness"
          aria-label="Go to Wellness"
          aria-current={isActive("/mindfulness", "mindfulness") ? "page" : undefined}
        >
          <Brain className="w-5 h-5" />
          <span className="text-xs">Wellness</span>
        </Link>
        
        <Link 
          href="/planning"
          className={cn(
            "flex flex-col items-center justify-center space-y-1 h-full w-full transition-colors focus-visible-enhanced",
            isActive("/planning", "planning") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="nav-planning"
          aria-label="Go to Planning"
          aria-current={isActive("/planning", "planning") ? "page" : undefined}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Plan</span>
        </Link>
        
        <Link 
          href="/community"
          className={cn(
            "flex flex-col items-center justify-center space-y-1 h-full w-full transition-colors focus-visible-enhanced",
            isActive("/community", "community") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="nav-community"
          aria-label="Go to Community"
          aria-current={isActive("/community", "community") ? "page" : undefined}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Community</span>
        </Link>
      </div>
    </nav>
  );
}
