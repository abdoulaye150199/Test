import { useState, useCallback } from 'react';
import { useAppSession } from '../../../shared/session/AppSessionContext';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name?: string;
  email?: string;
  password?: string;
  isBoutique?: boolean;
  shopName?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  description?: string;
  logo?: File | null;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  token: string;
  role?: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const session = useAppSession();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);

    try {
      return await session.login(credentials);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Echec de la connexion.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const register = useCallback(async (userData: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);

    try {
      return await session.register(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Echec de l inscription.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const logout = useCallback(async () => {
    try {
      await session.logout();
    } finally {
      setError(null);
    }
  }, [session]);

  const checkAuth = useCallback(async () => {
    await session.checkAuth();
  }, [session]);

  return {
    isAuthenticated: session.isAuthenticated,
    user: session.user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
};
