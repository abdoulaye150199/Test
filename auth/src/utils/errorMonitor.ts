
import { logger, LogEntry } from './logger';

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  recentErrors: Array<{
    timestamp: string;
    message: string;
    type: string;
    component?: string;
  }>;
}

class ErrorMonitor {
  private errors: Array<{
    timestamp: string;
    message: string;
    type: string;
    component?: string;
    stack?: string;
  }> = [];

  private readonly MAX_STORED_ERRORS = 100;

  trackError(
    error: Error | string,
    context?: {
      component?: string;
      action?: string;
      data?: Record<string, any>;
    }
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';

    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: errorMessage,
      type: errorType,
      component: context?.component,
      stack: error instanceof Error ? error.stack : undefined,
    };

    this.errors.push(errorEntry);
    if (this.errors.length > this.MAX_STORED_ERRORS) {
      this.errors.shift();
    }

    logger.error(errorMessage, error instanceof Error ? error : new Error(errorMessage), {
      component: context?.component,
      action: context?.action,
      ...context?.data,
    });

    this.saveErrorsToStorage();
  }

  getMetrics(): ErrorMetrics {
    const errorsByType: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;

      if (error.component) {
        errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1;
      }
    });

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsByComponent,
      recentErrors: this.errors.slice(-20),
    };
  }

  clearErrors(): void {
    this.errors = [];
  }

  getStoredErrors(): typeof this.errors {
    return [];
  }

  private saveErrorsToStorage(): void {
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    const report = `
=== ERROR REPORT ===
Total Errors: ${metrics.totalErrors}

Errors by Type:
${Object.entries(metrics.errorsByType)
  .map(([type, count]) => `  ${type}: ${count}`)
  .join('\n')}

Errors by Component:
${Object.entries(metrics.errorsByComponent)
  .map(([component, count]) => `  ${component}: ${count}`)
  .join('\n')}

Recent Errors:
${metrics.recentErrors
  .map(err => `  [${err.timestamp}] ${err.type}: ${err.message}`)
  .join('\n')}
    `;
    return report;
  }
}

export const errorMonitor = new ErrorMonitor();
export default errorMonitor;
