import { AuthRepository } from '../repositories/AuthRepository';
import { TokenService } from './TokenService';
import { Credentials } from '../entities/Credentials';
import { User } from '../entities/User';
import { RedisRateLimiter } from './RedisRateLimiter';
import { InputSanitizer } from './InputSanitizer';
import { logger } from '../../../utils/logger';
import { errorMonitor } from '../../../utils/errorMonitor';
import { validatePasswordStrength } from '../../../utils/passwordSecurity';
import { AUTH_CONFIG } from '../../../config/authConfig';
import { ServiceContainer } from './ServiceContainer';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  isBoutique?: boolean;
}

interface AuthServiceInterface {
  login(credentialsData: { email: string; password: string }): Promise<{ user: User; token: string; role: string }>;
  register(userData: RegisterData): Promise<{ user: User; token: string }>;
}

class AuthService implements AuthServiceInterface {
  private serviceContainer: ServiceContainer;

  constructor() {
    this.serviceContainer = ServiceContainer.getInstance();
  }

  // Lazy getters pour éviter les instanciations prématurées
  private get repository(): AuthRepository {
    return this.serviceContainer.getAuthRepository();
  }

  private get tokenService(): TokenService {
    return this.serviceContainer.getTokenService();
  }

  private get rateLimiter(): RedisRateLimiter {
    return this.serviceContainer.getRateLimiter();
  }

  private handleServiceError(
    error: unknown,
    component: string,
    action: string,
    userEmail?: string,
    fallbackMessage?: string
  ): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errorMonitor.trackError(error instanceof Error ? error : new Error(errorMessage), {
      component,
      action,
      data: { email: userEmail }
    });
    logger.error(`${action} failed`, error instanceof Error ? error : new Error(errorMessage), { email: userEmail });
    return new Error(errorMessage || fallbackMessage || 'Une erreur est survenue');
  }

  /**
   * Sanitise et valide les données de login
   */
  private sanitizeLoginData(credentialsData: { email: string; password: string }): {
    email: string;
    password: string;
  } {
    return {
      email: InputSanitizer.sanitize(credentialsData.email),
      password: InputSanitizer.sanitize(credentialsData.password)
    };
  }

  /**
   * Sanitise et valide les données de registration
   */
  private sanitizeRegisterData(userData: RegisterData): RegisterData {
    return {
      email: InputSanitizer.sanitize(userData.email),
      password: InputSanitizer.sanitize(userData.password),
      name: InputSanitizer.sanitize(userData.name),
      isBoutique: userData.isBoutique
    };
  }

  async login(credentialsData: { email: string; password: string }): Promise<{ user: User; token: string; role: string }> {
    const email = credentialsData.email;

    try {
      // 1. Sanitiser les données
      const sanitizedData = this.sanitizeLoginData(credentialsData);

      // 2. Vérifier le rate limiting
      await this.rateLimiter.checkAndIncrement(email);

      // 3. Créer les credentials et appeler le repository
      const credentials = new Credentials(sanitizedData.email, sanitizedData.password);
      logger.info('Login attempt', { email });
      const result = await this.repository.login(credentials);

      // 4. Sauvegarder le token
      this.tokenService.setToken(result.token);

      // 5. Réinitialiser le rate limiter
      await this.rateLimiter.reset(email);

      logger.info('Login successful', { email, userId: result.user.id });
      return result;
    } catch (error) {
      throw this.handleServiceError(error, 'AuthService', 'login', email, 'Échec de la connexion');
    }
  }

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const email = userData.email;

    try {
      // 1. Sanitiser les données
      const sanitizedData = this.sanitizeRegisterData(userData);

      // 2. Valider la force du mot de passe
      const passwordStrength = validatePasswordStrength(sanitizedData.password);
      if (!passwordStrength.isStrong) {
        logger.warn('Weak password strength', { email: sanitizedData.email, feedback: passwordStrength.feedback });
        throw new Error(`Mot de passe faible. ${passwordStrength.feedback.join('. ')}`);
      }

      // 3. Créer et enregistrer l'utilisateur
      logger.info('Registration attempt', { email: sanitizedData.email, name: sanitizedData.name });
      const result = await this.repository.register(sanitizedData);

      // 4. Sauvegarder le token
      this.tokenService.setToken(result.token);

      logger.info('Registration successful', { email: sanitizedData.email, userId: result.user.id });
      return result;
    } catch (error) {
      throw this.handleServiceError(error, 'AuthService', 'register', email, 'Échec de l\'inscription');
    }
  }

  async logout(): Promise<void> {
    try {
      logger.info('User logout');
      await this.repository.logout();
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Logout error', error instanceof Error ? error : new Error('Unknown logout error'));
    } finally {
      this.tokenService.removeToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = this.tokenService.getToken();
      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      if (!this.tokenService.isTokenValidSync()) {
        throw new Error('Token invalide ou expiré');
      }

      logger.info('Fetching current user');
      const user = await this.repository.getCurrentUser();
      logger.info('Current user fetched successfully', { userId: user.id });
      return user;
    } catch (error) {
      throw this.handleServiceError(
        error,
        'AuthService',
        'getCurrentUser',
        undefined,
        'Échec de récupération de l\'utilisateur'
      );
    }
  }
}

export { AuthService };
export default AuthService;