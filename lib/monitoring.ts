// lib/monitoring.ts
export function logError(error: Error, context?: any) {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
  
  // Send to monitoring service (Sentry, LogRocket, etc.)
}
