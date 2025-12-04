import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, ChefHat, Pill, CalendarDays, Target, Shield, BookOpen, Activity, Clock, AlertCircle, CheckCircle2, X, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  insertMedicationSchema,
  insertAppointmentSchema,
  insertGoalSchema,
  insertPreventiveCareTaskSchema,
  insertUserWellnessPlanSchema,
  insertRiskAssessmentSchema,
  insertMedicationIntakeSchema,
  insertGoalLogSchema,
  type Medication,
  type Appointment,
  type Goal,
  type PreventiveCareTask,
  type UserWellnessPlan,
  type RiskAssessment,
  type MedicationIntake,
  type GoalLog
} from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function Planning() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("meals");

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

  const createMealPlan = () => {
    toast({
      title: "Meal Plan Created",
      description: "Your new meal plan has been created successfully! You can now start planning your weekly meals.",
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="planning-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Health Planning</h1>
          <p className="text-muted-foreground">Comprehensive health planning and management tools</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7" data-testid="planning-tabs">
            <TabsTrigger value="meals" data-testid="tab-meals">
              <ChefHat className="w-4 h-4 mr-2" />
              Meals
            </TabsTrigger>
            <TabsTrigger value="medications" data-testid="tab-medications">
              <Pill className="w-4 h-4 mr-2" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              <CalendarDays className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="goals" data-testid="tab-goals">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="preventive-care" data-testid="tab-preventive-care">
              <Shield className="w-4 h-4 mr-2" />
              Preventive
            </TabsTrigger>
            <TabsTrigger value="wellness-plans" data-testid="tab-wellness-plans">
              <BookOpen className="w-4 h-4 mr-2" />
              Wellness
            </TabsTrigger>
            <TabsTrigger value="risk-assessments" data-testid="tab-risk-assessments">
              <Activity className="w-4 h-4 mr-2" />
              Assessments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meals" data-testid="meals-tab-content">
            <MealsTab createMealPlan={createMealPlan} />
          </TabsContent>

          <TabsContent value="medications" data-testid="medications-tab-content">
            <MedicationsTab />
          </TabsContent>

          <TabsContent value="appointments" data-testid="appointments-tab-content">
            <AppointmentsTab />
          </TabsContent>

          <TabsContent value="goals" data-testid="goals-tab-content">
            <GoalsTab />
          </TabsContent>

          <TabsContent value="preventive-care" data-testid="preventive-care-tab-content">
            <PreventiveCareTab />
          </TabsContent>

          <TabsContent value="wellness-plans" data-testid="wellness-plans-tab-content">
            <WellnessPlansTab />
          </TabsContent>

          <TabsContent value="risk-assessments" data-testid="risk-assessments-tab-content">
            <RiskAssessmentsTab />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}

// Meals Tab Component (existing functionality)
function MealsTab({ createMealPlan }: { createMealPlan: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Meal Planning</h2>
          <p className="text-muted-foreground">Plan your meals for better number control</p>
        </div>
        <Button 
          onClick={createMealPlan}
          className="bg-primary text-primary-foreground"
          data-testid="button-create-plan"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Weekly Calendar Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              This Week's Plan
            </CardTitle>
            <Button variant="outline" size="sm" onClick={createMealPlan} data-testid="button-plan-meals">
              Plan Meals
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center" data-testid={`day-${day.toLowerCase()}`}>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">{day}</h4>
                <div className="space-y-2">
                  <div className="w-full h-8 bg-accent/20 rounded border border-accent/30 flex items-center justify-center">
                    <span className="text-xs text-accent">B</span>
                  </div>
                  <div className="w-full h-8 bg-warning/20 rounded border border-warning/30 flex items-center justify-center">
                    <span className="text-xs text-warning">L</span>
                  </div>
                  <div className="w-full h-8 bg-primary/20 rounded border border-primary/30 flex items-center justify-center">
                    <span className="text-xs text-primary">D</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-muted-foreground">
            <p>No meal plan active. Create your first plan to get started!</p>
          </div>
        </CardContent>
      </Card>

      {/* Planning Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={createMealPlan}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Smart Meal Planner</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent meal planning based on your glucose patterns and preferences
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={createMealPlan}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Weekly Templates</h3>
            <p className="text-sm text-muted-foreground">
              Pre-built meal plans optimized for number management
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={createMealPlan}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-2">Custom Plans</h3>
            <p className="text-sm text-muted-foreground">
              Build your own meal plans from scratch with our meal database
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Meal Plans */}
      <Card>
        <CardHeader>
          <CardTitle>My Meal Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No meal plans yet</h3>
            <p className="mb-6">Create your first meal plan to start managing your meals effectively</p>
            <Button onClick={createMealPlan} data-testid="button-create-first-plan">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Medications Tab Component
function MedicationsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // Fetch medications
  const { data: medications, isLoading } = useQuery({
    queryKey: ['/api/medications'],
  });

  // Fetch due medications
  const { data: dueMedications } = useQuery({
    queryKey: ['/api/medications/due-today'],
  });

  // Create medication mutation
  const createMedication = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create medication');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications/due-today'] });
      setIsDialogOpen(false);
      setEditingMedication(null);
      toast({
        title: "Success",
        description: "Medication added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add medication.",
        variant: "destructive",
      });
    },
  });

  // Update medication mutation
  const updateMedication = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update medication');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setIsDialogOpen(false);
      setEditingMedication(null);
      toast({
        title: "Success",
        description: "Medication updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update medication.",
        variant: "destructive",
      });
    },
  });

  // Delete medication mutation
  const deleteMedication = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete medication');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Success",
        description: "Medication deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete medication.",
        variant: "destructive",
      });
    },
  });

  // Log medication intake mutation
  const logIntake = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/medication-intakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to log medication intake');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications/due-today'] });
      toast({
        title: "Success",
        description: "Medication intake logged successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log medication intake.",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertMedicationSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      doseAmount: 0,
      doseUnit: "mg" as const,
      route: "oral" as const,
      prescribedBy: "",
      notes: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingMedication) {
      form.reset({
        name: editingMedication.name,
        doseAmount: Number(editingMedication.doseAmount),
        doseUnit: editingMedication.doseUnit as any,
        route: editingMedication.route as any,
        prescribedBy: editingMedication.prescribedBy || "",
        notes: editingMedication.notes || "",
        isActive: editingMedication.isActive ?? true,
      });
    } else {
      form.reset({
        name: "",
        doseAmount: 0,
        doseUnit: "mg" as const,
        route: "oral" as const,
        prescribedBy: "",
        notes: "",
        isActive: true,
      });
    }
  }, [editingMedication, form]);

  const onSubmit = (data: any) => {
    if (editingMedication) {
      updateMedication.mutate({ id: editingMedication.id, data });
    } else {
      createMedication.mutate(data);
    }
  };

  const handleLogIntake = (medicationId: string) => {
    logIntake.mutate({
      medicationId,
      takenAt: new Date().toISOString(),
      status: 'taken',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Medications</h2>
          <p className="text-muted-foreground">Manage your medications and track intake</p>
        </div>
        <Button 
          onClick={() => {
            setEditingMedication(null);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-medication"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Due Today Section */}
      {dueMedications && dueMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dueMedications as any[])?.map((medication: any) => (
                <div key={medication.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg" data-testid={`due-medication-${medication.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div>
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medication.doseAmount} {medication.doseUnit}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleLogIntake(medication.id)}
                    disabled={logIntake.isPending}
                    data-testid={`button-log-intake-${medication.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Take
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      <Card>
        <CardHeader>
          <CardTitle>My Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading medications...</p>
            </div>
          ) : medications && medications.length > 0 ? (
            <div className="space-y-4">
              {(medications as Medication[])?.map((medication: Medication) => (
                <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`medication-${medication.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{medication.name}</h3>
                      <Badge variant={medication.isActive ? "default" : "secondary"}>
                        {medication.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {medication.doseAmount} {medication.doseUnit} - {medication.route}
                    </p>
                    {medication.prescribedBy && (
                      <p className="text-sm text-muted-foreground">Prescribed by: {medication.prescribedBy}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMedication(medication);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-medication-${medication.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMedication.mutate(medication.id)}
                      disabled={deleteMedication.isPending}
                      data-testid={`button-delete-medication-${medication.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Pill className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No medications yet</h3>
              <p className="mb-6">Add your first medication to start tracking</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-medication">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Medication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Medication Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="medication-dialog">
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
            <DialogDescription>
              {editingMedication ? 'Update your medication details' : 'Add a new medication to your list'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Metformin" {...field} data-testid="input-medication-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dose Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-dose-amount" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-dose-unit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="units">units</SelectItem>
                          <SelectItem value="mL">mL</SelectItem>
                          <SelectItem value="tablet">tablet</SelectItem>
                          <SelectItem value="capsule">capsule</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-route">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="injection">Injection</SelectItem>
                        <SelectItem value="transdermal">Transdermal</SelectItem>
                        <SelectItem value="inhalation">Inhalation</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prescribedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescribed By</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Smith" {...field} data-testid="input-prescribed-by" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} data-testid="textarea-medication-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMedication.isPending || updateMedication.isPending}
                  data-testid="button-save-medication"
                >
                  {editingMedication ? 'Update' : 'Add'} Medication
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Appointments Tab Component
function AppointmentsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments'],
  });

  // Fetch upcoming appointments
  const { data: upcomingAppointments } = useQuery({
    queryKey: ['/api/appointments/upcoming'],
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/upcoming'] });
      setIsDialogOpen(false);
      setEditingAppointment(null);
      toast({
        title: "Success",
        description: "Appointment scheduled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule appointment.",
        variant: "destructive",
      });
    },
  });

  // Update appointment mutation
  const updateAppointment = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/upcoming'] });
      setIsDialogOpen(false);
      setEditingAppointment(null);
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  // Delete appointment mutation
  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/upcoming'] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment.",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertAppointmentSchema.omit({ userId: true })),
    defaultValues: {
      title: "",
      type: "primary_care" as const,
      providerName: "",
      scheduledAt: "",
      duration: 30,
      location: "",
      notes: "",
      reminderMinutes: 60,
    },
  });

  useEffect(() => {
    if (editingAppointment) {
      form.reset({
        title: editingAppointment.title,
        type: editingAppointment.type as any,
        providerName: editingAppointment.providerName || "",
        scheduledAt: new Date(editingAppointment.scheduledAt).toISOString().slice(0, 16),
        duration: editingAppointment.duration || 30,
        location: editingAppointment.location || "",
        notes: editingAppointment.notes || "",
        reminderMinutes: editingAppointment.reminderMinutes || 60,
      });
    } else {
      form.reset({
        title: "",
        type: "primary_care" as const,
        providerName: "",
        scheduledAt: "",
        duration: 30,
        location: "",
        notes: "",
        reminderMinutes: 60,
      });
    }
  }, [editingAppointment, form]);

  const onSubmit = (data: any) => {
    const appointmentData = {
      ...data,
      scheduledAt: data.scheduledAt,
    };
    
    if (editingAppointment) {
      updateAppointment.mutate({ id: editingAppointment.id, data: appointmentData });
    } else {
      createAppointment.mutate(appointmentData);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Appointments</h2>
          <p className="text-muted-foreground">Schedule and manage your healthcare appointments</p>
        </div>
        <Button 
          onClick={() => {
            setEditingAppointment(null);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-appointment"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(upcomingAppointments as any[])?.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg" data-testid={`upcoming-appointment-${appointment.id}`}>
                  <div className="flex items-center space-x-3">
                    <CalendarDays className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                      {appointment.providerName && (
                        <p className="text-sm text-muted-foreground">with {appointment.providerName}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {(appointments as Appointment[])?.map((appointment: Appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`appointment-${appointment.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{appointment.title}</h3>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {formatDateTime(appointment.scheduledAt)}
                    </p>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Type: {appointment.type.replace('_', ' ')}</p>
                      {appointment.providerName && <p>Provider: {appointment.providerName}</p>}
                      {appointment.location && <p>Location: {appointment.location}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAppointment(appointment);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-appointment-${appointment.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAppointment.mutate(appointment.id)}
                      disabled={deleteAppointment.isPending}
                      data-testid={`button-delete-appointment-${appointment.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
              <p className="mb-6">Schedule your first appointment to get started</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-schedule-first-appointment">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="appointment-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Update your appointment details' : 'Schedule a new healthcare appointment'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Check-up" {...field} data-testid="input-appointment-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-appointment-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="endocrinology">Endocrinology</SelectItem>
                          <SelectItem value="primary_care">Primary Care</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                          <SelectItem value="podiatry">Podiatry</SelectItem>
                          <SelectItem value="lab">Lab Work</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Smith" {...field} data-testid="input-provider-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-scheduled-at" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-duration" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Medical Center Dr, Suite 100" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reminderMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder (minutes before)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reminder">
                          <SelectValue placeholder="Select reminder time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="1440">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} data-testid="textarea-appointment-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAppointment.isPending || updateAppointment.isPending}
                  data-testid="button-save-appointment"
                >
                  {editingAppointment ? 'Update' : 'Schedule'} Appointment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Goals Tab Component
function GoalsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Fetch goals
  const { data: goals, isLoading } = useQuery({
    queryKey: ['/api/goals'],
  });

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create goal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      toast({
        title: "Success",
        description: "Goal created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal.",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update goal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      toast({
        title: "Success",
        description: "Goal updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update goal.",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Success",
        description: "Goal deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete goal.",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertGoalSchema.omit({ userId: true })),
    defaultValues: {
      category: "glucose" as const,
      title: "",
      description: "",
      targetValue: 0,
      unit: "",
      currentValue: 0,
      startDate: "",
      endDate: "",
      status: "active" as const,
    },
  });

  useEffect(() => {
    if (editingGoal) {
      form.reset({
        category: editingGoal.category as any,
        title: editingGoal.title,
        description: editingGoal.description || "",
        targetValue: Number(editingGoal.targetValue),
        unit: editingGoal.unit,
        currentValue: Number(editingGoal.currentValue) || 0,
        startDate: new Date(editingGoal.startDate).toISOString().slice(0, 10),
        endDate: editingGoal.endDate ? new Date(editingGoal.endDate).toISOString().slice(0, 10) : "",
        status: editingGoal.status as any,
      });
    } else {
      form.reset({
        category: "glucose" as const,
        title: "",
        description: "",
        targetValue: 0,
        unit: "",
        currentValue: 0,
        startDate: "",
        endDate: "",
        status: "active" as const,
      });
    }
  }, [editingGoal, form]);

  const onSubmit = (data: any) => {
    const goalData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    };
    
    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, data: goalData });
    } else {
      createGoal.mutate(goalData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'achieved': return 'secondary';
      case 'paused': return 'outline';
      case 'abandoned': return 'destructive';
      default: return 'default';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Health Goals</h2>
          <p className="text-muted-foreground">Set and track your health and wellness goals</p>
        </div>
        <Button 
          onClick={() => {
            setEditingGoal(null);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-goal"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Active Goals Grid */}
      <Card>
        <CardHeader>
          <CardTitle>My Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading goals...</p>
            </div>
          ) : goals && goals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal: Goal) => (
                <Card key={goal.id} className="relative" data-testid={`goal-${goal.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-primary" />
                        <Badge variant={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGoal(goal);
                            setIsDialogOpen(true);
                          }}
                          data-testid={`button-edit-goal-${goal.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal.mutate(goal.id)}
                          disabled={deleteGoal.isPending}
                          data-testid={`button-delete-goal-${goal.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-base">{goal.title}</CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Number(goal.currentValue) || 0} / {Number(goal.targetValue)} {goal.unit}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${calculateProgress(Number(goal.currentValue) || 0, Number(goal.targetValue))}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Category: {goal.category.replace('_', ' ')}
                      </div>
                      {goal.endDate && (
                        <div className="text-xs text-muted-foreground">
                          Target: {new Date(goal.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No goals set yet</h3>
              <p className="mb-6">Create your first health goal to start tracking progress</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-goal">
                <Plus className="w-4 h-4 mr-2" />
                Set Your First Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="goal-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
            <DialogDescription>
              {editingGoal ? 'Update your goal details' : 'Create a new health goal to track your progress'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-goal-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="glucose">Glucose</SelectItem>
                          <SelectItem value="a1c">A1C</SelectItem>
                          <SelectItem value="weight">Weight</SelectItem>
                          <SelectItem value="steps">Steps</SelectItem>
                          <SelectItem value="exercise">Exercise</SelectItem>
                          <SelectItem value="sleep">Sleep</SelectItem>
                          <SelectItem value="mindfulness">Mindfulness</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-goal-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="achieved">Achieved</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="abandoned">Abandoned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lower A1C to 7%" {...field} data-testid="input-goal-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your goal..." {...field} data-testid="textarea-goal-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="7.0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-target-value" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., %, mg/dL, lbs" {...field} data-testid="input-goal-unit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="8.5" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-current-value" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-start-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-end-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createGoal.isPending || updateGoal.isPending}
                  data-testid="button-save-goal"
                >
                  {editingGoal ? 'Update' : 'Create'} Goal
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Preventive Care Tab Component
function PreventiveCareTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PreventiveCareTask | null>(null);

  // Fetch preventive care tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/preventive-care-tasks'],
  });

  // Fetch due tasks
  const { data: dueTasks } = useQuery({
    queryKey: ['/api/preventive-care-tasks/due-today'],
  });

  // Fetch overdue tasks
  const { data: overdueTasks } = useQuery({
    queryKey: ['/api/preventive-care-tasks/overdue'],
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/preventive-care-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create preventive care task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/due-today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/overdue'] });
      setIsDialogOpen(false);
      setEditingTask(null);
      toast({
        title: "Success",
        description: "Preventive care task created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/preventive-care-tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update preventive care task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/due-today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/overdue'] });
      setIsDialogOpen(false);
      setEditingTask(null);
      toast({
        title: "Success",
        description: "Preventive care task updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task.",
        variant: "destructive",
      });
    },
  });

  // Complete task mutation
  const completeTask = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/preventive-care-tasks/${id}/complete`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to complete preventive care task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/due-today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/overdue'] });
      toast({
        title: "Success",
        description: "Task marked as completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/preventive-care-tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete preventive care task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/due-today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-care-tasks/overdue'] });
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task.",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertPreventiveCareTaskSchema.omit({ userId: true })),
    defaultValues: {
      type: "screening" as const,
      title: "",
      description: "",
      dueDate: "",
      recurrenceMonths: null,
      status: "due" as const,
      notes: "",
    },
  });

  useEffect(() => {
    if (editingTask) {
      form.reset({
        type: editingTask.type as any,
        title: editingTask.title,
        description: editingTask.description || "",
        dueDate: new Date(editingTask.dueDate).toISOString().slice(0, 10),
        recurrenceMonths: editingTask.recurrenceMonths || null,
        status: editingTask.status as any,
        notes: editingTask.notes || "",
      });
    } else {
      form.reset({
        type: "screening" as const,
        title: "",
        description: "",
        dueDate: "",
        recurrenceMonths: null,
        status: "due" as const,
        notes: "",
      });
    }
  }, [editingTask, form]);

  const onSubmit = (data: any) => {
    const taskData = {
      ...data,
      dueDate: new Date(data.dueDate).toISOString(),
    };
    
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: taskData });
    } else {
      createTask.mutate(taskData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due': return 'default';
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Preventive Care</h2>
          <p className="text-muted-foreground">Track your preventive healthcare tasks and screenings</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(null);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-task"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Alert Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue Tasks */}
        {overdueTasks && overdueTasks.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="w-5 h-5 mr-2" />
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg" data-testid={`overdue-task-${task.id}`}>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => completeTask.mutate(task.id)}
                      disabled={completeTask.isPending}
                      data-testid={`button-complete-overdue-${task.id}`}
                    >
                      Complete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Due Today */}
        {dueTasks && dueTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Due Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dueTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg" data-testid={`due-task-${task.id}`}>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-accent" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => completeTask.mutate(task.id)}
                      disabled={completeTask.isPending}
                      data-testid={`button-complete-due-${task.id}`}
                    >
                      Complete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>All Preventive Care Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task: PreventiveCareTask) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`task-${task.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>Type: {task.type.replace('_', ' ')}</p>
                      <p>Due: {formatDate(task.dueDate)}</p>
                      {task.recurrenceMonths && (
                        <p>Recurring: Every {task.recurrenceMonths} months</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => completeTask.mutate(task.id)}
                        disabled={completeTask.isPending}
                        data-testid={`button-complete-task-${task.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTask(task);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-task-${task.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTask.mutate(task.id)}
                      disabled={deleteTask.isPending}
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No preventive care tasks yet</h3>
              <p className="mb-6">Add your first preventive care task to stay on track</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-task">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="task-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add Preventive Care Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update your preventive care task' : 'Add a new preventive care task to track'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-task-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="lab">Lab Work</SelectItem>
                          <SelectItem value="vaccine">Vaccine</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="checkup">Check-up</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-task-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="due">Due</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Eye Exam" {...field} data-testid="input-task-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Task description..." {...field} data-testid="textarea-task-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-due-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recurrenceMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence (months, optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          data-testid="input-recurrence" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} data-testid="textarea-task-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTask.isPending || updateTask.isPending}
                  data-testid="button-save-task"
                >
                  {editingTask ? 'Update' : 'Add'} Task
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wellness Plans Tab Component
function WellnessPlansTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<UserWellnessPlan | null>(null);

  // Fetch wellness plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/user-wellness-plans'],
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['/api/wellness-plan-templates'],
  });

  // Create plan mutation
  const createPlan = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user-wellness-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create wellness plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-wellness-plans'] });
      setIsDialogOpen(false);
      setEditingPlan(null);
      toast({
        title: "Success",
        description: "Wellness plan created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create wellness plan.",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertUserWellnessPlanSchema.omit({ userId: true })),
    defaultValues: {
      templateId: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "active" as const,
    },
  });

  const onSubmit = (data: any) => {
    const planData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      templateId: data.templateId || null,
    };
    
    createPlan.mutate(planData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Wellness Plans</h2>
          <p className="text-muted-foreground">Create and follow structured wellness programs</p>
        </div>
        <Button 
          onClick={() => {
            setEditingPlan(null);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-wellness-plan"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Templates Section */}
      {templates && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template: any) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`template-${template.id}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardHeader>
                  <CardContent>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        form.setValue('templateId', template.id);
                        form.setValue('name', template.name);
                        form.setValue('description', template.description);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-use-template-${template.id}`}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Plans */}
      <Card>
        <CardHeader>
          <CardTitle>My Wellness Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading wellness plans...</p>
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="space-y-4">
              {plans.map((plan: UserWellnessPlan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`wellness-plan-${plan.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                    {plan.description && (
                      <p className="text-muted-foreground mt-1">{plan.description}</p>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>Start: {new Date(plan.startDate).toLocaleDateString()}</p>
                      {plan.endDate && (
                        <p>End: {new Date(plan.endDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No wellness plans yet</h3>
              <p className="mb-6">Create your first wellness plan to start your journey</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-plan">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="wellness-plan-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Wellness Plan</DialogTitle>
            <DialogDescription>
              Create a new wellness plan to track your health journey
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 30-Day Wellness Challenge" {...field} data-testid="input-plan-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your wellness plan..." {...field} data-testid="textarea-plan-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-plan-start-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-plan-end-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-plan-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlan.isPending}
                  data-testid="button-save-wellness-plan"
                >
                  Create Plan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Risk Assessments Tab Component
function RiskAssessmentsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  // Fetch risk assessments
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['/api/risk-assessments'],
  });

  // Create assessment mutation
  const createAssessment = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/risk-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create risk assessment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/risk-assessments'] });
      setIsDialogOpen(false);
      setSelectedType('');
      toast({
        title: "Success",
        description: "Risk assessment completed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save risk assessment.",
        variant: "destructive",
      });
    },
  });

  const assessmentTypes = [
    { id: 'hypoglycemia', name: 'Hypoglycemia Risk', description: 'Assess your risk of low number episodes' },
    { id: 'dka', name: 'DKA Risk', description: 'Diabetic ketoacidosis risk assessment' },
    { id: 'complication', name: 'Complication Risk', description: 'Long-term diabetes complications assessment' },
    { id: 'foot_ulcer', name: 'Foot Ulcer Risk', description: 'Diabetic foot ulcer risk evaluation' },
    { id: 'cvd', name: 'Cardiovascular Risk', description: 'Heart disease risk assessment for diabetes' },
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'secondary';
      case 'moderate': return 'default';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const startAssessment = (type: string) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  const completeAssessment = (type: string, score: number, level: string, recommendations: string[]) => {
    const assessmentData = {
      type,
      input: { score, answers: {} }, // Simplified for demo
      score,
      level,
      recommendations,
    };
    
    createAssessment.mutate(assessmentData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Risk Assessments</h2>
          <p className="text-muted-foreground">Evaluate your health risks and get personalized recommendations</p>
        </div>
      </div>

      {/* Assessment Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assessmentTypes.map((type) => (
              <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startAssessment(type.id)} data-testid={`assessment-type-${type.id}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  <Button className="mt-4 w-full" data-testid={`button-start-${type.id}`}>
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Previous Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading assessments...</p>
            </div>
          ) : assessments && assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assessment: RiskAssessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`assessment-${assessment.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">
                        {assessmentTypes.find(t => t.id === assessment.type)?.name || assessment.type}
                      </h3>
                      <Badge variant={getRiskLevelColor(assessment.level)}>
                        {assessment.level} risk
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Score: {assessment.score}</p>
                      <p>Assessed: {new Date(assessment.assessedAt).toLocaleDateString()}</p>
                    </div>
                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Recommendations:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {assessment.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                          {assessment.recommendations.length > 2 && (
                            <li>+ {assessment.recommendations.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
              <p className="mb-6">Complete your first risk assessment to get personalized health insights</p>
              <Button onClick={() => startAssessment('hypoglycemia')} data-testid="button-first-assessment">
                <Activity className="w-4 h-4 mr-2" />
                Start Your First Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="assessment-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {assessmentTypes.find(t => t.id === selectedType)?.name} Assessment
            </DialogTitle>
            <DialogDescription>
              Complete this assessment to evaluate your risk level and receive personalized recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Assessment Demo</h3>
                <p className="text-muted-foreground mb-4">
                  This is a simplified demo. In a real implementation, this would include:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Multiple choice questions</li>
                  <li>Risk factor evaluation</li>
                  <li>Scoring algorithm</li>
                  <li>Personalized recommendations</li>
                </ul>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={() => completeAssessment(selectedType, 65, 'moderate', [
                    'Monitor blood glucose more frequently',
                    'Consult with your healthcare provider',
                    'Consider adjusting medication timing',
                    'Keep glucose tablets handy'
                  ])}
                  disabled={createAssessment.isPending}
                  data-testid="button-complete-assessment"
                >
                  Complete Demo Assessment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}