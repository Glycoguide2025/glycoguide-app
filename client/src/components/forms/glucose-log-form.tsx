import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { insertGlucoseReadingSchema } from "@shared/schema";

const formSchema = insertGlucoseReadingSchema.extend({
  value: z.coerce.number().min(20, "Glucose value must be at least 20").max(600, "Glucose value cannot exceed 600"),
  readingType: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface GlucoseLogFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function GlucoseLogForm({ onClose, onSuccess }: GlucoseLogFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
      unit: 'mg/dL',
      readingType: 'random',
      notes: '',
    },
  });

  const createGlucoseReading = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/glucose-readings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glucose-readings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/glucose-readings/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/daily"] });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to log glucose reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createGlucoseReading.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="glucose-log-form">
        <DialogHeader>
          <DialogTitle>Log Blood Sugar Reading</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glucose Value *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Enter glucose value"
                        {...field}
                        data-testid="input-glucose-value"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        mg/dL
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-reading-type">
                        <SelectValue placeholder="Select reading type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="post_meal">Post-meal</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="bedtime">Bedtime</SelectItem>
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this reading..."
                      className="resize-none"
                      {...field}
                      data-testid="textarea-glucose-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createGlucoseReading.isPending}
                data-testid="button-cancel-glucose"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGlucoseReading.isPending}
                data-testid="button-save-glucose"
              >
                {createGlucoseReading.isPending ? "Saving..." : "Save Reading"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
