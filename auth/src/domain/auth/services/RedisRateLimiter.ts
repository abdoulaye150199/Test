/**
 * Redis Rate Limiter with Distributed Backend
 * Utilise un backend Redis pour rate limiting global
 * Fallback sur RateLimiter local si Redis indisponible
 */

import axios, { AxiosInstance } from 'axios';
import { RateLimiter } from './RateLimiter';
import { CircuitBreaker, CircuitBreakerState, CircuitBreakerConfig } from './CircuitBreaker';
import { RetryInterceptor, RetryConfig } from './RetryInterceptor';

interface RateLimitConfig {
  maxAttempts: number;
  lockoutDuration: number;
  apiBaseUrl: string;
}

interface RateLimitCheckResponse {
  allowed: boolean;
  attempts: number;
  remainingAttempts: number;
  lockedUntil?: number;
  message?: string;
}

interface RateLimitResetResponse {
  success: boolean;
  message: string;
}

interface RateLimitEntry {
  identifier: string;
  attempts: number;
  lastAttemptTime: number;
  lockedUntil?: number;
}

export class RedisRateLimiter {
  private httpClient: AxiosInstance;
  private localRateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;

  private circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000
  };

  private retryConfig: RetryConfig = {
    maxRetries: 3,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    backoffMs: 500
  };

  constructor(config: RateLimitConfig) {
    // Initialiser le circuit breaker
    this.circuitBreaker = new CircuitBreaker(this.circuitBreakerConfig);

    // Axios avec connection pooling HTTP/HTTPS
    this.httpClient = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 5000,
      httpAgent: this.createHttpAgent(),
      httpsAgent: this.createHttpsAgent(),
      maxRedirects: 5,
      validateStatus: () => true
    });

    // Configurer le retry interceptor
    new RetryInterceptor(this.httpClient, this.retryConfig);

    // Fallback local
    this.localRateLimiter = new RateLimiter({
      maxAttempts: config.maxAttempts,
      lockoutDuration: config.lockoutDuration
    });
  }

  /**
   * Crée un agent HTTP avec connection pooling (Node.js only)
   */
  private createHttpAgent(): any {
    if (typeof window !== 'undefined') {
      return undefined;
    }

    try {
      // @ts-ignore - Dynamic require for Node.js only
      const http = eval("require('http')");
      return new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000
      });
    } catch {
      return undefined;
    }
  }

  /**
   * Crée un agent HTTPS avec connection pooling (Node.js only)
   */
  private createHttpsAgent(): any {
    if (typeof window !== 'undefined') {
      return undefined;
    }

    try {
      // @ts-ignore - Dynamic require for Node.js only
      const https = eval("require('https')");
      return new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000
      });
    } catch {
      return undefined;
    }
  }

  /**
   * Vérifie et incrémente le compteur de rate limiting
   */
  async checkAndIncrement(identifier: string): Promise<void> {
    if (this.circuitBreaker.isOpen()) {
      console.warn('[CircuitBreaker] Redis backend unavailable, using local fallback');
      return this.localRateLimiter.checkAndIncrement(identifier);
    }

    try {
      const response = await this.httpClient.post<RateLimitCheckResponse>(
        '/rate-limit/check',
        { identifier },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { allowed, message, lockedUntil } = response.data;
      this.circuitBreaker.recordSuccess();

      if (!allowed) {
        if (lockedUntil) {
          const remainingMinutes = Math.ceil((lockedUntil - Date.now()) / 1000 / 60);
          throw new Error(
            `Compte temporairement verrouillé. Veuillez réessayer dans ${remainingMinutes} minute(s).`
          );
        }
        throw new Error(message || 'Trop de tentatives');
      }
    } catch (error) {
      this.circuitBreaker.recordFailure();

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn('[CircuitBreaker] Redis backend unavailable, using local fallback');
          return this.localRateLimiter.checkAndIncrement(identifier);
        }

        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw error;
    }
  }

  /**
   * Réinitialise le compteur de rate limiting
   */
  async reset(identifier: string): Promise<void> {
    if (this.circuitBreaker.isOpen()) {
      return this.localRateLimiter.reset(identifier);
    }

    try {
      await this.httpClient.post<RateLimitResetResponse>(
        '/rate-limit/reset',
        { identifier }
      );
      this.circuitBreaker.recordSuccess();
    } catch (error) {
      this.circuitBreaker.recordFailure();

      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        console.warn('[CircuitBreaker] Redis backend unavailable, using local fallback');
        return this.localRateLimiter.reset(identifier);
      }

      console.warn('Failed to reset rate limit:', error);
    }
  }

  /**
   * Récupère le statut du rate limiting
   */
  async getStatus(identifier: string): Promise<RateLimitEntry | null> {
    if (this.circuitBreaker.isOpen()) {
      return null;
    }

    try {
      const response = await this.httpClient.get<RateLimitEntry>(
        `/rate-limit/status/${identifier}`
      );
      this.circuitBreaker.recordSuccess();
      return response.data;
    } catch (error) {
      this.circuitBreaker.recordFailure();

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        if (error.code === 'ECONNREFUSED') {
          console.warn('[CircuitBreaker] Redis backend unavailable');
          return null;
        }
      }

      console.warn('Failed to get rate limit status:', error);
      return null;
    }
  }

  /**
   * Retourne l'état du circuit breaker
   */
  getCircuitBreakerState() {
    return this.circuitBreaker.getStatus();
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    this.localRateLimiter.destroy?.();
  }
}

export { CircuitBreakerState };
