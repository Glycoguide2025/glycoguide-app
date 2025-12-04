import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Phone, Plus } from "lucide-react";
import type { Consultation, HealthcareProvider } from "@shared/schema";

interface ConsultationWithProvider extends Consultation {
  provider?: HealthcareProvider;
}

export default function Consultations() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: consultations } = useQuery<ConsultationWithProvider[]>({
    queryKey: ["/api/consultations"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: providers } = useQuery<HealthcareProvider[]>({
    queryKey: ["/api/healthcare-providers"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const bookConsultation = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Consultation booking will be available soon.",
    });
  };

  const joinMeeting = (consultation: Consultation) => {
    toast({
      title: "Feature Coming Soon",
      description: "Video consultations will be available soon.",
    });
  };

  const upcomingConsultations = consultations?.filter(c => 
    new Date(c.scheduledAt) > new Date() && c.status === 'scheduled'
  ) || [];

  const pastConsultations = consultations?.filter(c => 
    new Date(c.scheduledAt) <= new Date() || c.status === 'completed'
  ) || [];

  return (
    <div className="min-h-screen bg-background" data-testid="consultations-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Healthcare Consultations</h1>
              <p className="text-muted-foreground">Connect with healthcare providers virtually</p>
            </div>
            <Button 
              onClick={bookConsultation}
              className="bg-primary text-primary-foreground"
              data-testid="button-book-consultation"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingConsultations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No upcoming consultations</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={bookConsultation}
                    data-testid="button-book-first-consultation"
                  >
                    Book Your First Consultation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => (
                    <div key={consultation.id} className="border border-border rounded-lg p-4" data-testid={`consultation-${consultation.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={consultation.provider?.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {consultation.provider?.firstName?.[0] || ''}{consultation.provider?.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              Dr. {consultation.provider?.firstName} {consultation.provider?.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {consultation.provider?.specialization}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{consultation.status}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(consultation.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(consultation.scheduledAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          {consultation.duration} min
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => joinMeeting(consultation)}
                        data-testid={`button-join-${consultation.id}`}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Available Providers</CardTitle>
            </CardHeader>
            <CardContent>
              {!providers || providers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No healthcare providers available at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providers.slice(0, 3).map((provider) => (
                    <div key={provider.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow" data-testid={`provider-${provider.id}`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar>
                          <AvatarImage src={provider.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {provider.firstName?.[0] || ''}{provider.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            Dr. {provider.firstName} {provider.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {provider.specialization}
                          </p>
                        </div>
                      </div>
                      
                      {provider.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {provider.bio}
                        </p>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={bookConsultation}
                        data-testid={`button-book-${provider.id}`}
                      >
                        Book Consultation
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Past Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Consultation History</CardTitle>
          </CardHeader>
          <CardContent>
            {pastConsultations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No consultation history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`past-consultation-${consultation.id}`}>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={consultation.provider?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {consultation.provider?.firstName?.[0] || ''}{consultation.provider?.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          Dr. {consultation.provider?.firstName} {consultation.provider?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(consultation.scheduledAt).toLocaleDateString()} • {consultation.duration} min
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={consultation.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {consultation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
