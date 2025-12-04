import { useLocation } from "wouter";
import { Home, Book, TrendingUp, User, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/recipes", label: "Recipes", icon: Book },
  { path: "/community", label: "Community", icon: Users },
  { path: "/mindfulness", label: "Mindfulness", icon: Heart },
  { path: "/insights", label: "Devices", icon: TrendingUp, authRequired: true },
  { path: "/profile", label: "Profile", icon: User, authRequired: true },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Filter nav items based on authentication
  const visibleNavItems = navItems.filter(item => !item.authRequired || isAuthenticated);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-600 shadow-2xl z-[100]">
      {/* Mobile: Compact grid layout */}
      <div className={cn(
        "md:hidden grid gap-0 py-1.5 px-0",
        visibleNavItems.length === 6 ? "grid-cols-6" : 
        visibleNavItems.length === 5 ? "grid-cols-5" : 
        "grid-cols-4"
      )}>
        {visibleNavItems.map((item) => {
          const isActive = location === item.path || (item.path === "/" && location === "/");
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-0.5 rounded transition-all min-h-[52px]",
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-600 dark:text-gray-400"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="h-4 w-4 mb-0.5 flex-shrink-0" />
              <span className="text-[7px] font-medium leading-none text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tablet/Desktop: Spacious flex layout */}
      <div className="hidden md:flex justify-center gap-6 py-2 px-1 max-w-7xl mx-auto">
        {visibleNavItems.map((item) => {
          const isActive = location === item.path || (item.path === "/" && location === "/");
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                "min-w-[70px] min-h-[64px]",
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}