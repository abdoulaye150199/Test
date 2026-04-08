import Cookies from 'js-cookie';
import { config } from '../../../config/environment';

const ACCESS_TOKEN_KEY = 'kukuza_access_token';
const REFRESH_TOKEN_KEY = 'kukuza_refresh_token';
const CSRF_TOKEN_KEY = 'kukuza_csrf_token';

const JWT_SECRET = config.jwt.secret;

const ACCESS_TOKEN_EXPIRY = 15 * 60;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;
const REFRESH_BEFORE_EXPIRY = 2 * 60;

interface CachedKey {
  key: CryptoKey;
  cachedAt: number;
}

class TokenService {
  private readonly accessTokenKey: string;
  private readonly refreshTokenKey: string;
  private readonly csrfTokenKey: string;
  private cachedSigningKey: CachedKey | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.accessTokenKey = ACCESS_TOKEN_KEY;
    this.refreshTokenKey = REFRESH_TOKEN_KEY;
    this.csrfTokenKey = CSRF_TOKEN_KEY;
    this.startRefreshTimer();
  }

  private async getSigningKey(): Promise<CryptoKey> {
    if (this.cachedSigningKey && Date.now() - this.cachedSigningKey.cachedAt < 60 * 60 * 1000) {
      return this.cachedSigningKey.key;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    this.cachedSigningKey = {
      key,
      cachedAt: Date.now()
    };

    return key;
  }

  async generateJWT(payload: any, expirySeconds: number = 900): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expirySeconds
    };

    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const encodedPayload = btoa(JSON.stringify(tokenPayload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const message = `${encodedHeader}.${encodedPayload}`;

    try {
      const key = await this.getSigningKey();
      const encoder = new TextEncoder();
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));

      const signatureArray = Array.from(new Uint8Array(signature));
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      return `${message}.${signatureBase64}`;
    } catch (error) {
      throw new Error('Failed to generate JWT: ' + String(error));
    }
  }

  getAccessToken(): string | undefined {
    try {
      return Cookies.get(this.accessTokenKey);
    } catch {
      return undefined;
    }
  }

  getRefreshToken(): string | undefined {
    try {
      return Cookies.get(this.refreshTokenKey);
    } catch {
      return undefined;
    }
  }

  private getTokenTTL(token: string): number {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return 0;

      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = payload.exp * 1000;
      return Math.max(0, expiresAt - Date.now());
    } catch {
      return 0;
    }
  }

  isTokenExpiringSoon(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return true;

    const ttl = this.getTokenTTL(tokenToCheck);
    return ttl < REFRESH_BEFORE_EXPIRY * 1000;
  }

  setTokenPair(accessToken: string, refreshToken: string): void {
    try {
      Cookies.set(this.accessTokenKey, accessToken, {
        expires: ACCESS_TOKEN_EXPIRY / (24 * 60 * 60),
        secure: config.env.isProduction,
        sameSite: 'strict',
        httpOnly: true
      });

      Cookies.set(this.refreshTokenKey, refreshToken, {
        expires: REFRESH_TOKEN_EXPIRY / (24 * 60 * 60),
        secure: config.env.isProduction,
        sameSite: 'strict',
        httpOnly: true
      });

      this.generateCsrfToken();

      this.resetRefreshTimer();
    } catch (error) {
    }
  }

  private generateCsrfToken(): void {
    try {
      const csrfToken = this.generateRandomToken(64);
      Cookies.set(this.csrfTokenKey, csrfToken, {
        expires: 7,
        secure: config.env.isProduction,
        sameSite: 'strict',
        httpOnly: false
      });
    } catch (error) {
    }
  }

  private generateRandomToken(length: number): string {
    try {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch {
      return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    }
  }

  private startRefreshTimer(): void {
    if (typeof window === 'undefined') return;

    this.refreshTimer = setInterval(() => {
      if (this.isTokenExpiringSoon()) {
        window.dispatchEvent(new CustomEvent('auth:token-expiring'));
      }
    }, 60 * 1000);
  }

  private resetRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.startRefreshTimer();
  }

  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.cachedSigningKey = null;
  }

  setToken(token: string): void {
    this.setTokenPair(token, token);
  }

  getToken(): string | undefined {
    return this.getAccessToken();
  }

  removeToken(): void {
    Cookies.remove(this.accessTokenKey);
    Cookies.remove(this.refreshTokenKey);
    Cookies.remove(this.csrfTokenKey);
  }

  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return this.getTokenTTL(token) > 0;
  }

  isTokenValidSync(): boolean {
    return this.isTokenValid();
  }

  getCsrfToken(): string | undefined {
    try {
      return Cookies.get(this.csrfTokenKey);
    } catch {
      return undefined;
    }
  }

}

export { TokenService, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };
export default TokenService;