// Stage 8 RC Hardening: Performance Status Badge (Development Only)
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { performanceMonitor, type PerformanceMetrics } from '@/lib/performance';

export function PerformanceBadge() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Only show in development
    if (!import.meta.env.DEV) return;

    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // Update metrics every 5 seconds
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only render in development
  if (!import.meta.env.DEV || !metrics) return null;

  const getPerformanceStatus = () => {
    // Core Web Vitals thresholds
    const lcp = metrics.largestContentfulPaint || 0;
    const cls = metrics.cumulativeLayoutShift || 0;
    const fid = metrics.firstInputDelay || 0;

    if (lcp > 4000 || cls > 0.25 || fid > 300 || metrics.errorCount > 0) {
      return { status: 'poor', color: 'destructive', icon: AlertTriangle };
    }
    
    if (lcp > 2500 || cls > 0.1 || fid > 100) {
      return { status: 'needs-improvement', color: 'secondary', icon: Zap };
    }

    return { status: 'good', color: 'default', icon: CheckCircle };
  };

  const { status, color, icon: Icon } = getPerformanceStatus();

  return (
    <div className="fixed bottom-20 left-4 z-50 md:hidden">
      <Badge 
        variant={color as any} 
        className="flex items-center gap-1 text-xs px-2 py-1"
        title={`Performance: ${status} | LCP: ${Math.round(metrics.largestContentfulPaint || 0)}ms | CLS: ${(metrics.cumulativeLayoutShift || 0).toFixed(3)} | Errors: ${metrics.errorCount}`}
      >
        <Icon className="w-3 h-3" />
        {status === 'good' ? 'Fast' : status === 'needs-improvement' ? 'OK' : 'Slow'}
      </Badge>
    </div>
  );
}