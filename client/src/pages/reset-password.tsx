import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Extract token from path parameter (/reset-password/:token)
  const [match, params] = useRoute("/reset-password/:token");

  useEffect(() => {
    // Try path parameter first (mobile-friendly)
    const pathToken = params?.token;
    
    // Fallback to query parameter for backward compatibility
    const queryParams = new URLSearchParams(window.location.search);
    const queryToken = queryParams.get('token');
    
    const extractedToken = pathToken || queryToken;
    
    console.log('[Reset Password] Token extraction:', {
      pathToken: pathToken?.substring(0, 10) + '...',
      queryToken: queryToken?.substring(0, 10) + '...',
      finalToken: extractedToken?.substring(0, 10) + '...',
      fullPath: window.location.pathname,
      search: window.location.search
    });
    
    if (!extractedToken) {
      console.error('[Reset Password] No token found');
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/auth"), 2000);
    } else {
      console.log('[Reset Password] Token set successfully');
      setToken(extractedToken);
    }
  }, [params, toast, setLocation]);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      console.log('[Reset Password] Submitting:', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasPassword: !!data.password
      });
      const res = await apiRequest("POST", "/api/reset-password", {
        token,
        password: data.password,
      });
      const result = await res.json();
      console.log('[Reset Password] Success:', result);
      return result;
    },
    onSuccess: () => {
      console.log('[Reset Password] Password reset successful');
      setResetSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });
      setTimeout(() => setLocation("/auth"), 2000);
    },
    onError: (error: Error) => {
      console.error('[Reset Password] Error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Please try again or request a new reset link",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ResetPasswordData) => {
    resetPasswordMutation.mutate(data);
  };

  if (!token) {
    return null;
  }

  return (
    <div className="h-screen w-screen fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#86A873] mb-2">GlycoGuide</h1>
          <p className="text-gray-600 dark:text-gray-400">Your holistic wellness companion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {resetSuccess ? "Password reset!" : "Create new password"}
            </CardTitle>
            <CardDescription>
              {resetSuccess
                ? "Redirecting you to login..."
                : "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="flex items-center justify-center py-6">
                <CheckCircle className="h-16 w-16 text-[#86A873]" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              data-testid="input-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="toggle-password-visibility"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              data-testid="input-confirm-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              data-testid="toggle-confirm-password-visibility"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#86A873] hover:bg-[#86A873]/90"
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
