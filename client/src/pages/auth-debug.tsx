import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthDebug() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");

  const addDiagnostic = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setDiagnostics(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AUTH-DEBUG] ${message}`);
  };

  useEffect(() => {
    addDiagnostic("Auth debug page mounted");
  }, []);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      addDiagnostic(`Login attempt: ${data.email}`);
      const res = await apiRequest("POST", "/api/login", data);
      return await res.json();
    },
    onSuccess: (user) => {
      addDiagnostic(`Login success: ${user.email}`);
      queryClient.setQueryData(["/api/auth/user"], user);
      setLocation("/");
    },
    onError: (error: Error) => {
      addDiagnostic(`Login error: ${error.message}`);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginData) => {
    addDiagnostic("Form submitted via React Hook Form");
    loginMutation.mutate(data);
  };

  const handleManualLogin = () => {
    addDiagnostic("Manual login button clicked");
    if (!manualEmail || !manualPassword) {
      addDiagnostic("Manual login: missing email or password");
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    addDiagnostic(`Manual login attempt: ${manualEmail}`);
    loginMutation.mutate({ email: manualEmail, password: manualPassword });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0fdf4, #ffffff, #fff1f2)', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Standard React Hook Form */}
        <Card>
          <CardHeader>
            <CardTitle>React Hook Form Login</CardTitle>
            <CardDescription>Standard form with validation</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #86A873',
                            borderRadius: '6px',
                            fontSize: '16px',
                            zIndex: 9999,
                            position: 'relative'
                          }}
                          {...field}
                          onFocus={() => addDiagnostic("RHF email input focused")}
                          onClick={() => addDiagnostic("RHF email input clicked")}
                          onKeyDown={() => addDiagnostic("RHF email keydown")}
                          onChange={(e) => {
                            addDiagnostic(`RHF email changed: ${e.target.value.length} chars`);
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #86A873',
                            borderRadius: '6px',
                            fontSize: '16px'
                          }}
                          {...field}
                          onFocus={() => addDiagnostic("RHF password input focused")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#86A873] hover:bg-[#86A873]/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in (RHF)"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Manual Input (No React Hook Form) */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Login (Bypass)</CardTitle>
            <CardDescription>Direct inputs without React Hook Form</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={manualEmail}
                  onChange={(e) => {
                    setManualEmail(e.target.value);
                    addDiagnostic(`Manual email changed: ${e.target.value.length} chars`);
                  }}
                  onFocus={() => addDiagnostic("Manual email input focused")}
                  onClick={() => addDiagnostic("Manual email input clicked")}
                  onKeyDown={() => addDiagnostic("Manual email keydown")}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e11d48',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    position: 'relative',
                    zIndex: 9999
                  }}
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Value: {manualEmail || '(empty)'} ({manualEmail.length} chars)
                </small>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={manualPassword}
                  onChange={(e) => {
                    setManualPassword(e.target.value);
                    addDiagnostic(`Manual password changed: ${e.target.value.length} chars`);
                  }}
                  onFocus={() => addDiagnostic("Manual password input focused")}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e11d48',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Entered: {manualPassword ? '***' : '(empty)'} ({manualPassword.length} chars)
                </small>
              </div>

              <Button
                onClick={handleManualLogin}
                className="w-full"
                style={{ background: '#e11d48', color: 'white' }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in (Manual)"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostics Panel */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <CardHeader>
            <CardTitle>Diagnostic Log</CardTitle>
            <CardDescription>Real-time debugging information</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {diagnostics.length === 0 ? (
                <div style={{ color: '#94a3b8' }}>Waiting for events...</div>
              ) : (
                diagnostics.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px', color: log.includes('⚠️') ? '#fbbf24' : log.includes('✓') ? '#10b981' : '#e2e8f0' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => setDiagnostics([])}
              variant="outline"
              size="sm"
              style={{ marginTop: '12px' }}
            >
              Clear Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
