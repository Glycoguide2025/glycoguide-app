// Stage 15: Client-side error reporting utility
// Sends client errors to server for monitoring and debugging

export function reportError(err: any, meta?: Record<string, any>) {
  const message = err?.message ?? String(err);
  
  fetch("/logs/error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      message, 
      stack: err?.stack, 
      meta: {
        ...meta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    })
  }).catch(() => {
    // Silently fail - don't want error reporting to cause more errors
    console.warn("Failed to report error to server");
  });
}

// Global error boundary handler for uncaught errors
export function setupGlobalErrorHandling() {
  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    reportError(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'uncaught-error'
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, {
      type: 'unhandled-promise-rejection'
    });
  });
}