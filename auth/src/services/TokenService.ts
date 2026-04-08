import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'kukuza_access_token';
const REFRESH_TOKEN_KEY = 'kukuza_refresh_token';

// JWT Payload type - peut être étendu selon le backend
interface TokenPayload {
  sub?: string;        // Subject (user ID)
  email?: string;
  iat?: number;        // Issued at
  exp?: number;        // Expiration time
  iss?: string;        // Issuer
  [key: string]: any;  // Propriétés supplémentaires du JWT
}

class TokenService {
  private readonly accessTokenKey: string = ACCESS_TOKEN_KEY;
  private readonly refreshTokenKey: string = REFRESH_TOKEN_KEY;

  getToken(): string | null {
    try {
      return Cookies.get(this.accessTokenKey) || null;
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      Cookies.set(this.accessTokenKey, token, {
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });
    } catch (error) {
      console.error('Failed to set token', error);
    }
  }

  removeToken(): void {
    try {
      Cookies.remove(this.accessTokenKey);
      Cookies.remove(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to remove token', error);
    }
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1])) as TokenPayload;
      const expiresAt = (payload.exp || 0) * 1000;
      return expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  getTokenPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1])) as TokenPayload;
    } catch {
      return null;
    }
  }
}

export { TokenService, type TokenPayload };
export default TokenService;