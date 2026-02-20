interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component?: string;
  metadata?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 10000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogEntry['level'], message: string, component?: string, metadata?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      metadata
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    const logString = `[${entry.timestamp}] [${level.toUpperCase()}]${component ? ` [${component}]` : ''} ${message}${metadata ? ` ${JSON.stringify(metadata)}` : ''}`;
    
    switch (level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'debug':
        console.debug(logString);
        break;
      default:
        console.log(logString);
    }
  }

  info(message: string, component?: string, metadata?: any): void {
    this.log('info', message, component, metadata);
  }

  warn(message: string, component?: string, metadata?: any): void {
    this.log('warn', message, component, metadata);
  }

  error(message: string, component?: string, metadata?: any): void {
    this.log('error', message, component, metadata);
  }

  debug(message: string, component?: string, metadata?: any): void {
    this.log('debug', message, component, metadata);
  }

  getLogs(level?: LogEntry['level'], limit = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    return filtered.slice(-limit);
  }

  getStats(): { total: number; info: number; warn: number; error: number; debug: number } {
    return {
      total: this.logs.length,
      info: this.logs.filter(l => l.level === 'info').length,
      warn: this.logs.filter(l => l.level === 'warn').length,
      error: this.logs.filter(l => l.level === 'error').length,
      debug: this.logs.filter(l => l.level === 'debug').length
    };
  }

  clear(): void {
    this.logs = [];
    this.info('Logs cleared');
  }
}

export { Logger };
export type { LogEntry };