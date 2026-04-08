/**
 * Configuration de l'API Auth
 * À adapter selon votre environnement
 */

// URL par défaut en développement
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

// Obtenir l'URL depuis les variables d'environnement
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
  }
  // Server-side (SSR si besoin)
  return (process.env.API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
};

export const authApiConfig = {
  baseUrl: getApiBaseUrl(),
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh', // Pour token refresh futur
  },
  timeout: 10000, // 10 secondes
  retries: 1,
} as const;

// Valider que l'URL est configurée
if (!authApiConfig.baseUrl || authApiConfig.baseUrl === DEFAULT_API_BASE_URL) {
  console.warn(
    '⚠️  API_BASE_URL not configured. Using localhost:3000. ' +
    'Set REACT_APP_API_BASE_URL environment variable for production.'
  );
}

export default authApiConfig;
