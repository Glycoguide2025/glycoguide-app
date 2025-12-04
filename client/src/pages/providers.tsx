import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Search, MessageCircle, UserCheck, Users, FilterX } from "lucide-react";
import type { HealthcareProvider } from "@shared/schema";

const specializations = [
  "All Specializations",
  "Endocrinology", 
  "Primary Care",
  "Cardiology",
  "Nutrition",
  "Diabetes Education",
  "Internal Medicine",
  "Family Medicine",
  "Nephrology",
  "Ophthalmology"
];

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const { toast } = useToast();

  // Query for healthcare providers with search and filters
  const { data: providers = [], isLoading } = useQuery<HealthcareProvider[]>({
    queryKey: ['/api/healthcare-providers', searchTerm, selectedSpecialization, showOnlyAvailable],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSpecialization !== "All Specializations") {
        params.append('specialization', selectedSpecialization);
      }
      params.append('available', showOnlyAvailable.toString());
      params.append('limit', '20');
      
      const response = await fetch(`/api/healthcare-providers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      return response.json();
    },
  });

  // Mutation for starting a conversation with a provider
  const startConversationMutation = useMutation({
    mutationFn: async (providerId: string) => {
      return apiRequest('/api/conversations', 'POST', {
        subject: "New Patient Inquiry",
        providerId,
        conversationType: 'healthcare'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Conversation Started",
        description: "You can now message this healthcare provider",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      // Navigate to messages page if needed
      window.location.href = '/messages'; // Simple navigation for now
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialization("All Specializations");
    setShowOnlyAvailable(true);
  };

  const hasActiveFilters = searchTerm || selectedSpecialization !== "All Specializations" || !showOnlyAvailable;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Healthcare Provider Directory
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect with certified healthcare providers specializing in diabetes management and overall wellness
          </p>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Healthcare Providers
            </CardTitle>
            <CardDescription>
              Search by name, specialization, or keywords to find the right healthcare provider for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  data-testid="input-provider-search"
                  placeholder="Search by name, bio, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialization</label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger data-testid="select-specialization">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <Select 
                  value={showOnlyAvailable ? "available" : "all"} 
                  onValueChange={(value) => setShowOnlyAvailable(value === "available")}
                >
                  <SelectTrigger data-testid="select-availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available Only</SelectItem>
                    <SelectItem value="all">All Providers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {providers.length} provider{providers.length !== 1 ? 's' : ''} found
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Providers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Providers Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clearing filters"
                  : "No healthcare providers are currently available"
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider: HealthcareProvider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {provider.firstName[0]}{provider.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" data-testid={`text-provider-name-${provider.id}`}>
                        Dr. {provider.firstName} {provider.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {provider.specialization && (
                          <Badge variant="secondary" data-testid={`badge-specialization-${provider.id}`}>
                            {provider.specialization}
                          </Badge>
                        )}
                        {provider.available ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            Unavailable
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {provider.bio ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3" data-testid={`text-provider-bio-${provider.id}`}>
                      {provider.bio}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No bio available</p>
                  )}
                </CardContent>

                <Separator className="my-2" />

                <CardFooter className="space-y-2">
                  {provider.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 w-full truncate">
                      {provider.email}
                    </p>
                  )}
                  
                  <Button
                    className="w-full"
                    onClick={() => startConversationMutation.mutate(provider.id)}
                    disabled={!provider.available || startConversationMutation.isPending}
                    data-testid={`button-start-conversation-${provider.id}`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {startConversationMutation.isPending 
                      ? "Starting..." 
                      : provider.available 
                        ? "Start Conversation" 
                        : "Currently Unavailable"
                    }
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && providers.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {providers.length} provider{providers.length !== 1 ? 's' : ''}
              {hasActiveFilters && " matching your criteria"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}