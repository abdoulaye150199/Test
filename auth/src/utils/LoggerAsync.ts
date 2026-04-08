
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class LoggerAsync {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logQueue: LogEntry[] = [];
  private isProcessing = false;

  private formatLogEntry(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level}: ${entry.message}${
      entry.context ? ' ' + JSON.stringify(entry.context) : ''
    }${
      entry.error ? ` Error: ${entry.error.name} - ${entry.error.message}` : ''
    }`;
  }

  private async logAsync(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : undefined,
    };

    this.logQueue.push(entry);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    setImmediate(() => {
      const batch = this.logQueue.splice(0, 100); // Traiter 100 logs à la fois

      batch.forEach(entry => {
        const formattedMessage = this.formatLogEntry(entry);
        
        if (this.isDevelopment) {
          console[entry.level.toLowerCase() as keyof Console](formattedMessage);
        } else {
          this.sendToLoggingService(entry);
        }
      });

      this.isProcessing = false;

      if (this.logQueue.length > 0) {
        this.processQueue();
      }
    });
  }

  private sendToLoggingService(entry: LogEntry): void {
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logAsync(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.logAsync(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logAsync(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.logAsync(LogLevel.ERROR, message, context, error);
  }

  async flush(): Promise<void> {
    while (this.isProcessing || this.logQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

export const loggerAsync = new LoggerAsync();
export default loggerAsync;
