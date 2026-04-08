import { User } from '../entities/User';
import { Credentials } from '../entities/Credentials';
import { ServiceContainer } from '../services/ServiceContainer';
import { config } from '../../../config/environment';
import { getSafeErrorMessage, getDetailedErrorLog } from '../constants/ApiErrors';
import { logger } from '../../../utils/logger';

interface LoginResponse {
  user: User;
  token: string;
  role: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  isBoutique?: boolean;
}

const API_BASE_URL = config.api.baseUrl;

// Config retry pour erreurs temporaires
interface RetryConfig {
  maxRetries: number;
  retryableStatuses: number[];
  backoffMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
  backoffMs: 1000 // Exponential backoff: 1s, 2s, 4s
};

class AuthRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Lazy getter pour TokenService singleton
  private get tokenService() {
    return ServiceContainer.getInstance().getTokenService();
  }

  /**
   * Exécute une requête avec retry intelligente
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Retry seulement pour les codes spécifiés
        if (!response.ok && retryConfig.retryableStatuses.includes(response.status)) {
          if (attempt < retryConfig.maxRetries) {
            const backoffDelay = retryConfig.backoffMs * Math.pow(2, attempt);
            console.warn(
              `[Retry] Status ${response.status} at ${url}. Attempt ${attempt + 1}/${retryConfig.maxRetries}. Waiting ${backoffDelay}ms...`
            );
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Retry pour erreurs réseau (ECONNREFUSED, ENOTFOUND, etc.)
        if (attempt < retryConfig.maxRetries) {
          const backoffDelay = retryConfig.backoffMs * Math.pow(2, attempt);
          console.warn(
            `[Retry] Network error at ${url}. Attempt ${attempt + 1}/${retryConfig.maxRetries}. Waiting ${backoffDelay}ms...`,
            lastError.message
          );
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async login(credentials: Credentials): Promise<LoginResponse> {
    const email = credentials.email.toString();
    
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: credentials.password.toString()
        }),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const backendMessage = typeof error?.message === 'string' ? error.message : null;
      const safeMessage = getSafeErrorMessage(response.status, backendMessage, 'Authentification échouée');
      const logMessage = getDetailedErrorLog(response.status, backendMessage);
      
      logger.warn('Login failed', { status: response.status, error: logMessage });
      throw new Error(safeMessage);
    }

    const data = await response.json();
    this.tokenService.setTokenPair(data.token, data.refreshToken);
    return {
      user: new User(data.user.id, data.user.username, data.user.email, data.user.role, data.user.createdAt),
      token: data.token,
      role: data.user.role
    };
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const backendMessage = typeof error?.message === 'string' ? error.message : null;
      const safeMessage = getSafeErrorMessage(response.status, backendMessage, 'Inscription échouée');
      const logMessage = getDetailedErrorLog(response.status, backendMessage);
      
      logger.warn('Registration failed', { status: response.status, email: userData.email, error: logMessage });
      throw new Error(safeMessage);
    }

    const data = await response.json();
    this.tokenService.setTokenPair(data.token, data.refreshToken);
    return {
      user: new User(data.user.id, data.user.username, data.user.email, data.user.role, data.user.createdAt),
      token: data.token
    };
  }

  async logout(): Promise<void> {
    try {
      await this.fetchWithRetry(
        `${this.baseUrl}/auth/logout`,
        {
          method: 'POST',
          credentials: 'include'
        },
        { ...DEFAULT_RETRY_CONFIG, maxRetries: 1 } // Moins de retry pour logout
      );
    } catch (error) {
      // Logout peut échouer, mais on nettoie toujours localement
      logger.warn('Logout request failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.tokenService.removeToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('Aucun token trouvé');
    }

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/auth/me`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const safeMessage = getSafeErrorMessage(response.status, null, 'Impossible de récupérer l\'utilisateur');
      const logMessage = getDetailedErrorLog(response.status, null);
      
      logger.warn('Get current user failed', { status: response.status, error: logMessage });
      throw new Error(safeMessage);
    }

    const data = await response.json();
    return new User(data.id, data.username, data.email, data.role, data.createdAt);
  }

  async getCreator(userId: number): Promise<null> {
    // TODO: Implémenter getCreator si nécessaire pour l'avenir
    // Pour l'instant, non utilisé dans l'auth
    return null;
  }
}

export { AuthRepository };
