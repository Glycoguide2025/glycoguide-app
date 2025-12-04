import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Subscribe() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to profile page where users can upgrade using the working flow
    setLocation("/profile");
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to your profile...</p>
    </div>
  );
}
