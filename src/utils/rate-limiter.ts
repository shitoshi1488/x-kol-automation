interface RateLimiterConfig {
  maxCalls: number;
  timeWindowMs: number;
}

class RateLimiter {
  private timestamps: number[] = [];
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  async acquire(): Promise<boolean> {
    const now = Date.now();
    
    this.timestamps = this.timestamps.filter(timestamp => 
      now - timestamp < this.config.timeWindowMs
    );

    if (this.timestamps.length >= this.config.maxCalls) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getRemainingCalls(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(timestamp => 
      now - timestamp < this.config.timeWindowMs
    );
    return this.config.maxCalls - this.timestamps.length;
  }

  getNextAvailable(): number {
    if (this.timestamps.length === 0) return 0;
    
    const oldest = this.timestamps[0];
    const waitTime = this.config.timeWindowMs - (Date.now() - oldest);
    return Math.max(0, waitTime);
  }

  reset(): void {
    this.timestamps = [];
  }
}

export { RateLimiter };
export type { RateLimiterConfig };