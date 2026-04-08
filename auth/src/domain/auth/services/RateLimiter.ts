
interface RateLimitEntry {
  attempts: number;
  lastAttemptTime: number;
  lockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  lockoutDuration: number;
  maxEntries?: number;
}

class RateLimiter {
  private attemptMap = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  private readonly MAX_ENTRIES = 50000;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = { maxEntries: this.MAX_ENTRIES, ...config };
    this.startCleanupInterval();
  }

  checkAndIncrement(identifier: string): void {
    const now = Date.now();
    let entry = this.attemptMap.get(identifier);

    if (!entry) {
      if (this.attemptMap.size >= this.config.maxEntries!) {
        this.evictOldestEntry();
      }

      this.attemptMap.set(identifier, {
        attempts: 0,
        lastAttemptTime: now
      });
      entry = this.attemptMap.get(identifier)!;
    }

    if (entry.lockedUntil && now < entry.lockedUntil) {
      const remainingMinutes = Math.ceil((entry.lockedUntil - now) / 1000 / 60);
      throw new Error(
        `Compte temporairement verrouillé. Veuillez réessayer dans ${remainingMinutes} minute(s).`
      );
    }

    if (now - entry.lastAttemptTime > this.config.lockoutDuration) {
      entry.attempts = 0;
      entry.lockedUntil = undefined;
    }

    entry.attempts++;
    entry.lastAttemptTime = now;

    if (entry.attempts >= this.config.maxAttempts) {
      entry.lockedUntil = now + this.config.lockoutDuration;
      throw new Error(
        `Trop de tentatives. Compte verrouillé pour ${Math.ceil(this.config.lockoutDuration / 60000)} minutes.`
      );
    }
  }

  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    this.attemptMap.forEach((entry, key) => {
      if (entry.lastAttemptTime < oldestTime) {
        oldestTime = entry.lastAttemptTime;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.attemptMap.delete(oldestKey);
    }
  }

  reset(identifier: string): void {
    this.attemptMap.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.attemptMap.forEach((entry, key) => {
      if (now - entry.lastAttemptTime > this.config.lockoutDuration * 2) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.attemptMap.delete(key));
  }

  private startCleanupInterval(): void {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), 15 * 60 * 1000);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.attemptMap.clear();
  }

    getStats(): { size: number; maxSize: number; estimatedMemory: string } {
      const sizeInBytes = this.attemptMap.size * 100;
      return {
        size: this.attemptMap.size,
        maxSize: this.config.maxEntries!,
        estimatedMemory: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
      };
    }
  }

export { RateLimiter };
