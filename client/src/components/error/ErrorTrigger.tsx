import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug } from 'lucide-react';

// Development-only component to test error boundary
export function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  if (shouldError) {
    // This will trigger the error boundary
    throw new Error('Test error triggered by ErrorTrigger component');
  }

  return (
    <Card className="border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950" data-testid="error-trigger-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Bug className="w-5 h-5" />
          Development Error Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-orange-600 dark:text-orange-400">
          Test the error boundary functionality by triggering a React error.
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShouldError(true)}
            className="flex items-center gap-2"
            data-testid="button-trigger-error"
          >
            <AlertTriangle className="w-4 h-4" />
            Trigger Error
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate network error
              window.dispatchEvent(new Event('offline'));
              setTimeout(() => {
                window.dispatchEvent(new Event('online'));
              }, 3000);
            }}
            data-testid="button-test-offline"
          >
            Test Offline
          </Button>
        </div>
        
        <p className="text-xs text-orange-500 dark:text-orange-400">
          This component only appears in development mode.
        </p>
      </CardContent>
    </Card>
  );
}