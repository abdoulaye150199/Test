// src/config/redis.ts

import { RedisRateLimiter } from '../domain/auth/services/RedisRateLimiter';
import { AUTH_CONFIG } from './authConfig';
import { config } from './environment';

const redisRateLimiter = new RedisRateLimiter({
  maxAttempts: AUTH_CONFIG.rateLimit.maxAttempts,
  lockoutDuration: AUTH_CONFIG.rateLimit.lockoutDuration,
  apiBaseUrl: config.api.baseUrl
});

export { redisRateLimiter };
