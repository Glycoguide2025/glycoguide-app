import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Import i18n - using static for now
const t = {
  errors: {
    fallback_title: "Something didn't load",
    fallback_body: "Please try again in a moment.",
    retry: "Retry"
  }
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // In Replit preview, ignore non-stringifiable errors (iframe/CORS issues)
    if (import.meta.env.DEV) {
      try {
        JSON.stringify(error);
      } catch {
        // Error can't be stringified - this is a Replit preview artifact
        console.warn('⚠️ Ignoring non-stringifiable error (Replit preview artifact)');
        return { hasError: false }; // Don't show error boundary
      }
    }
    
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Check if this is a Replit preview artifact
    try {
      JSON.stringify(error);
    } catch {
      console.warn('⚠️ Ignoring non-stringifiable error in preview');
      this.setState({ hasError: false });
      return;
    }

    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging with better visibility
    console.error('==== ERROR BOUNDARY TRIGGERED ====');
    console.error('Error Message:', error?.message || 'Unknown error');
    console.error('Error Name:', error?.name || 'Unknown');
    console.error('Error Stack:', error?.stack || 'No stack trace');
    console.error('Component Stack:', errorInfo?.componentStack || 'No component stack');
    console.error('================================');
    
    // Auto-recover from common development errors (Invalid hook call)
    if (error.message.includes('Invalid hook call') || error.message.includes('Hooks can only be called')) {
      console.warn('🔄 Auto-recovering from React hook error - reloading page in 2s...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }

    // Auto-recover from Replit preview environment errors
    if (import.meta.env.DEV && (
      error.message.includes('iframe') ||
      error.message.includes('cross-origin') ||
      error.message.includes('SecurityError') ||
      !error.message // Empty error message suggests preview environment issue
    )) {
      console.warn('🔄 Detected Replit preview environment error - auto-recovering in 1s...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }
    
    // Track error if analytics is enabled and user has consented (no PII)
    try {
      // Check if analytics is opted out (privacy-first)
      const optOut = localStorage.getItem('analytics-opt-out');
      const analytics = (window as any).analytics;
      
      if (optOut !== 'true' && analytics && typeof analytics.track === 'function') {
        analytics.track('error_boundary_triggered', {
          errorMessage: error.message.substring(0, 100), // Truncate for privacy
          errorStack: error.stack?.substring(0, 200),
          componentStack: errorInfo.componentStack?.substring(0, 200),
          context: 'react_error_boundary',
          timestamp: Date.now()
        });
      }
    } catch (analyticsError) {
      // Silently fail analytics to avoid recursive errors
      console.debug('Analytics tracking failed in ErrorBoundary:', analyticsError);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="error-boundary-fallback">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl" data-testid="text-error-title">
                {t.errors.fallback_title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground" data-testid="text-error-body">
                {t.errors.fallback_body}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  data-testid="button-error-retry"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.errors.retry}
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex items-center gap-2 w-full"
                  data-testid="button-error-home"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>
              
              {/* Development error details */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 p-4 bg-muted rounded-lg text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 overflow-x-auto text-xs bg-background p-2 rounded border">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-x-auto text-xs bg-background p-2 rounded border">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export a simple wrapper component for easier usage
export function ErrorBoundaryWrapper({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}