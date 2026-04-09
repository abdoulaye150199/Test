import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Boutique, User } from '../../src/types';
import { shopEnv } from '../../src/config/env';
import {
  APP_STORAGE_KEY,
  cloneSeedState,
  loadStoredAppState,
  saveStoredAppState,
  type StoredAppState,
  type StoredShop,
  type StoredUser,
} from './appStateStorage';
import {
  completeSupabaseBoutiqueSetup,
  loadSupabaseSessionState,
  loginWithSupabase,
  logoutFromSupabase,
  registerWithSupabase,
  subscribeToSupabaseAuth,
  updateSupabaseShopProfile,
} from '../../src/services/supabase/sessionService';

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

interface BoutiqueSetupData {
  shopName?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  description?: string;
  logo?: File | null;
}

interface AuthResponse {
  user: User;
  token: string;
  role: string;
}

interface AppSessionContextValue {
  isAuthenticated: boolean;
  user: User | null;
  shop: Boutique | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  completeBoutiqueSetup: (data: BoutiqueSetupData) => Promise<Boutique | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateShopProfile: (shopName: string, shopLogo: File | null) => Promise<Boutique | null>;
}

const AppSessionContext = createContext<AppSessionContextValue | undefined>(undefined);

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const createToken = (userId: string): string =>
  `local-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const fileToDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
    reader.readAsDataURL(file);
  });

const mapStoredUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

const mapStoredShop = (shop: StoredShop, owner: StoredUser): Boutique => ({
  id: shop.id,
  name: shop.name,
  logo: shop.logo,
  owner: mapStoredUser(owner),
  createdAt: new Date(shop.createdAt),
  updatedAt: new Date(shop.updatedAt),
  address: shop.address,
  postalCode: shop.postalCode,
  country: shop.country,
  phoneNumber: shop.phoneNumber,
  description: shop.description,
});

const getCurrentUserRecord = (state: StoredAppState): StoredUser | null => {
  if (!state.auth.currentUserId) {
    return null;
  }

  return state.users.find((user) => user.id === state.auth.currentUserId) ?? null;
};

const getCurrentShopRecord = (state: StoredAppState): StoredShop | null => {
  const currentUser = getCurrentUserRecord(state);

  if (!currentUser || !state.shop || state.shop.ownerId !== currentUser.id) {
    return null;
  }

  return state.shop;
};

export const AppSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoredAppState>(() => loadStoredAppState());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    saveStoredAppState(state);
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === APP_STORAGE_KEY) {
        setState(loadStoredAppState());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistState = useCallback((nextState: StoredAppState) => {
    stateRef.current = nextState;
    saveStoredAppState(nextState);
    setState(nextState);
  }, []);

  useEffect(() => {
    if (!shopEnv.useSupabase) {
      return undefined;
    }

    const syncSession = async () => {
      try {
        const nextState = await loadSupabaseSessionState();
        persistState(nextState);
      } catch (error) {
        console.error('[AppSession] Impossible de synchroniser la session Supabase.', error);
        persistState(cloneSeedState());
      }
    };

    void syncSession();
    return subscribeToSupabaseAuth(() => {
      void syncSession();
    });
  }, [persistState]);

  const login = useCallback(async ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
    if (shopEnv.useSupabase) {
      const result = await loginWithSupabase({ email, password });
      persistState(result.state);
      return result.auth;
    }

    const currentState = stateRef.current;
    const normalizedEmail = normalizeEmail(email);
    const matchedUser = currentState.users.find(
      (user) => normalizeEmail(user.email) === normalizedEmail && user.password === password
    );

    if (!matchedUser) {
      throw new Error('Identifiants invalides.');
    }

    const token = createToken(matchedUser.id);
    const nextState: StoredAppState = {
      ...currentState,
      auth: {
        isAuthenticated: true,
        currentUserId: matchedUser.id,
        token,
      },
    };

    persistState(nextState);

    return {
      user: mapStoredUser(matchedUser),
      token,
      role: matchedUser.role,
    };
  }, [persistState]);

  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    if (shopEnv.useSupabase) {
      const result = await registerWithSupabase(data);
      persistState(result.state);
      return result.auth;
    }

    const currentState = stateRef.current;
    const now = new Date().toISOString();
    const currentUser = getCurrentUserRecord(currentState);
    const isBoutiqueRegistration = Boolean(data.isBoutique);
    const normalizedEmail = data.email ? normalizeEmail(data.email) : '';

    let users = [...currentState.users];
    let targetUser: StoredUser | null = currentUser;

    if (isBoutiqueRegistration && currentUser) {
      targetUser = {
        ...currentUser,
        role: 'owner',
        updatedAt: now,
      };
      users = users.map((user) => (user.id === targetUser?.id ? targetUser : user));
    } else {
      if (!data.name?.trim() || !normalizedEmail || !data.password?.trim()) {
        throw new Error('Informations utilisateur incomplètes.');
      }

      if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
        throw new Error('Un compte avec cet email existe deja.');
      }

      targetUser = {
        id: `user-${Date.now()}`,
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password,
        role: isBoutiqueRegistration ? 'owner' : 'staff',
        createdAt: now,
        updatedAt: now,
      };
      users.push(targetUser);
    }

    let nextShop = currentState.shop;

    if (isBoutiqueRegistration) {
      if (!targetUser) {
        throw new Error('Utilisateur introuvable pour la boutique.');
      }

      const logo = data.logo instanceof File ? await fileToDataUrl(data.logo) : currentState.shop?.logo;

      nextShop = {
        id: currentState.shop?.id ?? `shop-${Date.now()}`,
        name: data.shopName?.trim() || currentState.shop?.name || 'Ma boutique',
        logo,
        ownerId: targetUser.id,
        address: data.address?.trim() || currentState.shop?.address,
        postalCode: data.postalCode?.trim() || currentState.shop?.postalCode,
        country: data.country?.trim() || currentState.shop?.country,
        phoneNumber: data.phoneNumber?.trim() || currentState.shop?.phoneNumber,
        description: data.description?.trim() || currentState.shop?.description,
        createdAt: currentState.shop?.createdAt ?? now,
        updatedAt: now,
      };
    }

    const token = createToken(targetUser.id);
    const nextState: StoredAppState = {
      ...currentState,
      users,
      shop: nextShop,
      auth: {
        isAuthenticated: true,
        currentUserId: targetUser.id,
        token,
      },
    };

    persistState(nextState);

    return {
      user: mapStoredUser(targetUser),
      token,
      role: targetUser.role,
    };
  }, [persistState]);

  const completeBoutiqueSetup = useCallback(async (data: BoutiqueSetupData): Promise<Boutique | null> => {
    if (shopEnv.useSupabase) {
      const result = await completeSupabaseBoutiqueSetup(data);
      persistState(result.state);
      const owner = result.state.users[0];
      return result.state.shop && owner ? mapStoredShop(result.state.shop, owner) : null;
    }

    const currentState = stateRef.current;
    const currentUser = getCurrentUserRecord(currentState);

    if (!currentUser) {
      throw new Error('Session utilisateur introuvable. Reprenez l inscription depuis le debut.');
    }

    const now = new Date().toISOString();
    const nextUser: StoredUser = {
      ...currentUser,
      role: 'owner',
      updatedAt: now,
    };
    const logo = data.logo instanceof File ? await fileToDataUrl(data.logo) : currentState.shop?.logo;
    const nextShop: StoredShop = {
      id: currentState.shop?.id ?? `shop-${Date.now()}`,
      name: data.shopName?.trim() || currentState.shop?.name || 'Ma boutique',
      logo,
      ownerId: nextUser.id,
      address: data.address?.trim() || currentState.shop?.address,
      postalCode: data.postalCode?.trim() || currentState.shop?.postalCode,
      country: data.country?.trim() || currentState.shop?.country,
      phoneNumber: data.phoneNumber?.trim() || currentState.shop?.phoneNumber,
      description: data.description?.trim() || currentState.shop?.description,
      createdAt: currentState.shop?.createdAt ?? now,
      updatedAt: now,
    };
    const nextState: StoredAppState = {
      ...currentState,
      users: currentState.users.map((user) => (user.id === nextUser.id ? nextUser : user)),
      shop: nextShop,
      auth: {
        ...currentState.auth,
        isAuthenticated: true,
        currentUserId: nextUser.id,
        token: currentState.auth.token || createToken(nextUser.id),
      },
    };

    persistState(nextState);
    return mapStoredShop(nextShop, nextUser);
  }, [persistState]);

  const logout = useCallback(async (): Promise<void> => {
    if (shopEnv.useSupabase) {
      await logoutFromSupabase();
      persistState(cloneSeedState());
      return;
    }

    const currentState = stateRef.current;

    persistState({
      ...currentState,
      auth: {
        isAuthenticated: false,
        currentUserId: null,
        token: null,
      },
    });
  }, [persistState]);

  const checkAuth = useCallback(async (): Promise<void> => {
    if (shopEnv.useSupabase) {
      persistState(await loadSupabaseSessionState());
      return;
    }

    setState(loadStoredAppState());
  }, [persistState]);

  const updateShopProfile = useCallback(async (shopName: string, shopLogo: File | null): Promise<Boutique | null> => {
    if (shopEnv.useSupabase) {
      const result = await updateSupabaseShopProfile(shopName, shopLogo);
      persistState(result.state);
      return result.shop;
    }

    const currentState = stateRef.current;
    const currentUser = getCurrentUserRecord(currentState);
    const currentShop = getCurrentShopRecord(currentState);

    if (!currentUser || !currentShop) {
      return null;
    }

    const nextShop: StoredShop = {
      ...currentShop,
      name: shopName.trim() || currentShop.name,
      logo: shopLogo ? await fileToDataUrl(shopLogo) : currentShop.logo,
      updatedAt: new Date().toISOString(),
    };

    const nextState: StoredAppState = {
      ...currentState,
      shop: nextShop,
    };

    persistState(nextState);
    return mapStoredShop(nextShop, currentUser);
  }, [persistState]);

  const currentUser = useMemo(() => {
    const user = getCurrentUserRecord(state);
    return user ? mapStoredUser(user) : null;
  }, [state]);

  const currentShop = useMemo(() => {
    const shop = getCurrentShopRecord(state);
    const owner = getCurrentUserRecord(state);

    if (!shop || !owner) {
      return null;
    }

    return mapStoredShop(shop, owner);
  }, [state]);

  const value = useMemo<AppSessionContextValue>(() => ({
    isAuthenticated: state.auth.isAuthenticated && currentUser !== null,
    user: currentUser,
    shop: currentShop,
    login,
    register,
    completeBoutiqueSetup,
    logout,
    checkAuth,
    updateShopProfile,
  }), [checkAuth, completeBoutiqueSetup, currentShop, currentUser, login, logout, register, state.auth.isAuthenticated, updateShopProfile]);

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
};

export const useAppSession = (): AppSessionContextValue => {
  const context = useContext(AppSessionContext);

  if (!context) {
    throw new Error('useAppSession must be used within an AppSessionProvider.');
  }

  return context;
};
