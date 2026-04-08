import { AuthRepository } from '../repositories/AuthRepository';
import { TokenService } from './TokenService';
import { RedisRateLimiter } from './RedisRateLimiter';
import { AUTH_CONFIG } from '../../../config/authConfig';
import { config } from '../../../config/environment';

/**
 * Service Container - Gère les instances singletons
 * Évite la duplication et permet le partage du cache JWT
 */
class ServiceContainer {
  private static instance: ServiceContainer;
  private tokenService: TokenService | null = null;
  private authRepository: AuthRepository | null = null;
  private redisRateLimiter: RedisRateLimiter | null = null;

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * TokenService singleton - Cache JWT persistant
   */
  getTokenService(): TokenService {
    if (!this.tokenService) {
      this.tokenService = new TokenService();
    }
    return this.tokenService;
  }

  /**
   * AuthRepository singleton - Réutilise les connexions
   */
  getAuthRepository(): AuthRepository {
    if (!this.authRepository) {
      this.authRepository = new AuthRepository();
    }
    return this.authRepository;
  }

  /**
   * RedisRateLimiter singleton - Cache distribué
   */
  getRateLimiter(): RedisRateLimiter {
    if (!this.redisRateLimiter) {
      this.redisRateLimiter = new RedisRateLimiter({
        maxAttempts: AUTH_CONFIG.rateLimit.maxAttempts,
        lockoutDuration: AUTH_CONFIG.rateLimit.lockoutDuration,
        apiBaseUrl: config.api.baseUrl || 'http://localhost:5000'
      });
    }
    return this.redisRateLimiter;
  }

  /**
   * Réinitialise tous les services (pour tests)
   */
  reset(): void {
    if (this.tokenService) {
      this.tokenService.destroy();
      this.tokenService = null;
    }
    if (this.redisRateLimiter) {
      this.redisRateLimiter.destroy();
      this.redisRateLimiter = null;
    }
    this.authRepository = null;
  }
}

export { ServiceContainer };
