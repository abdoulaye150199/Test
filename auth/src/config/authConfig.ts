
const AUTH_CONFIG = {
  rateLimit: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000
  },
  password: {
    minLength: 8,
    iterations: 100000 
  },
  token: {
    expirationTime: 24 * 60 * 60 * 1000 
  }
} as const;

export { AUTH_CONFIG };
