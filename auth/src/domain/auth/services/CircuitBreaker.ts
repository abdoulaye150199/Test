/**
 * Circuit Breaker Pattern
 * Gère l'état de connexion au backend Redis avec 3 états:
 * - CLOSED: Tout fonctionne, requêtes normales
 * - OPEN: Trop d'erreurs, bypasse Redis vers fallback local
 * - HALF_OPEN: Testant la récupération du service
 */

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

export interface CircuitBreakerStatus {
  state: CircuitBreakerState;
  failureCount: number;
  uptime?: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Enregistre un succès et tente de fermer le circuit si en HALF_OPEN
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
        console.log('[CircuitBreaker] Recovered - switching to CLOSED state');
      }
    }
  }

  /**
   * Enregistre une erreur et ouvre le circuit si trop d'erreurs
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.CLOSED && 
        this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      console.error('[CircuitBreaker] Too many failures - switching to OPEN state');
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.successCount = 0;
      console.error('[CircuitBreaker] Recovery failed - back to OPEN state');
    }
  }

  /**
   * Vérifie l'état du circuit et tente une dégradation gracieuse
   */
  isOpen(): boolean {
    if (this.state === CircuitBreakerState.OPEN) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;

      if (timeSinceFailure >= this.config.timeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.failureCount = 0;
        console.log('[CircuitBreaker] Timeout reached - attempting recovery (HALF_OPEN)');
        return false;
      }

      return true;
    }

    return false;
  }

  getStatus(): CircuitBreakerStatus {
    return {
      state: this.state,
      failureCount: this.failureCount,
      uptime: this.lastFailureTime > 0 ? Date.now() - this.lastFailureTime : undefined
    };
  }
}
