// Stage 8 RC Hardening: Performance Monitoring & Metrics
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  navigationTiming: PerformanceTiming;
  memoryUsage?: number;
  errorCount: number;
  lastError?: string;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private errorCount = 0;
  private observer?: PerformanceObserver;

  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      navigationTiming: performance.timing,
      errorCount: 0
    };

    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Core Web Vitals
        this.observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            switch (entry.entryType) {
              case 'paint':
                if (entry.name === 'first-contentful-paint') {
                  this.metrics.firstContentfulPaint = entry.startTime;
                }
                break;
              case 'largest-contentful-paint':
                this.metrics.largestContentfulPaint = entry.startTime;
                break;
              case 'layout-shift':
                const layoutShiftEntry = entry as any;
                if (!layoutShiftEntry.hadRecentInput) {
                  this.metrics.cumulativeLayoutShift = 
                    (this.metrics.cumulativeLayoutShift || 0) + layoutShiftEntry.value;
                }
                break;
              case 'first-input':
                const inputEntry = entry as any;
                this.metrics.firstInputDelay = inputEntry.processingStart - entry.startTime;
                break;
            }
          });
        });

        // Observe multiple entry types
        this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
      } catch (error) {
        console.debug('Performance monitoring not available:', error);
      }
    }

    // Monitor page load completion
    if (document.readyState === 'complete') {
      this.calculatePageLoadTime();
    } else {
      window.addEventListener('load', () => this.calculatePageLoadTime());
    }

    // Monitor memory usage (if available)
    this.updateMemoryUsage();
    setInterval(() => this.updateMemoryUsage(), 30000); // Check every 30s

    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error?.message || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason?.message || 'Unhandled promise rejection');
    });
  }

  private calculatePageLoadTime() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
    }
  }

  private updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }
  }

  private recordError(message: string) {
    this.errorCount++;
    this.metrics.errorCount = this.errorCount;
    this.metrics.lastError = message?.substring(0, 200); // Truncate for privacy
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public reportMetrics(): void {
    // Only report in production with user consent
    if (import.meta.env.PROD && !localStorage.getItem('analytics-opt-out')) {
      const metrics = this.getMetrics();
      
      // Report to analytics if available
      try {
        const analytics = (window as any).analytics;
        if (analytics && typeof analytics.track === 'function') {
          analytics.track('performance_metrics', {
            pageLoadTime: metrics.pageLoadTime,
            firstContentfulPaint: metrics.firstContentfulPaint,
            largestContentfulPaint: metrics.largestContentfulPaint,
            cumulativeLayoutShift: metrics.cumulativeLayoutShift,
            firstInputDelay: metrics.firstInputDelay,
            memoryUsage: metrics.memoryUsage,
            errorCount: metrics.errorCount,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Silently fail analytics
        console.debug('Performance metrics reporting failed:', error);
      }
    }
  }

  public cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Report metrics periodically
if (typeof window !== 'undefined') {
  // Report metrics after 10 seconds and then every 5 minutes
  setTimeout(() => performanceMonitor.reportMetrics(), 10000);
  setInterval(() => performanceMonitor.reportMetrics(), 5 * 60 * 1000);

  // Report on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.reportMetrics();
    performanceMonitor.cleanup();
  });
}