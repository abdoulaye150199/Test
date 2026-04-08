import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Boutique, User } from '../../types';
import {
  cloneSeedState,
  type StoredAppState,
  type StoredShop,
  type StoredUser,
} from '../../../shared/session/appStateStorage';
import { getSupabaseClient } from './client';

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
  user: User;
  token: string;
  role: string;
}

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  avatar?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ShopRow = {
  id: string;
  owner_id: string;
  name: string;
  logo?: string | null;
  address?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone_number?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const nowIso = (): string => new Date().toISOString();

const fileToDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
    reader.readAsDataURL(file);
  });

const toStoredUser = (profile: ProfileRow): StoredUser => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  password: '',
  role: profile.role,
  avatar: profile.avatar ?? undefined,
  createdAt: profile.created_at ?? nowIso(),
  updatedAt: profile.updated_at ?? nowIso(),
});

const toStoredShop = (shop: ShopRow | null): StoredShop | null => {
  if (!shop) {
    return null;
  }

  return {
    id: shop.id,
    ownerId: shop.owner_id,
    name: shop.name,
    logo: shop.logo ?? undefined,
    address: shop.address ?? undefined,
    postalCode: shop.postal_code ?? undefined,
    country: shop.country ?? undefined,
    phoneNumber: shop.phone_number ?? undefined,
    description: shop.description ?? undefined,
    createdAt: shop.created_at ?? nowIso(),
    updatedAt: shop.updated_at ?? nowIso(),
  };
};

const mapUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

const mapShop = (shop: StoredShop, owner: StoredUser): Boutique => ({
  id: shop.id,
  name: shop.name,
  logo: shop.logo,
  owner: mapUser(owner),
  address: shop.address,
  postalCode: shop.postalCode,
  country: shop.country,
  phoneNumber: shop.phoneNumber,
  description: shop.description,
  createdAt: new Date(shop.createdAt),
  updatedAt: new Date(shop.updatedAt),
});

const fetchProfile = async (userId: string): Promise<ProfileRow> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, avatar, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Profil utilisateur introuvable dans Supabase.');
  }

  return data as ProfileRow;
};

const fetchShop = async (userId: string): Promise<ShopRow | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('shops')
    .select('id, owner_id, name, logo, address, postal_code, country, phone_number, description, created_at, updated_at')
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error('Impossible de charger la boutique depuis Supabase.');
  }

  return (data as ShopRow | null) ?? null;
};

const buildStoredState = (
  profile: ProfileRow,
  shop: ShopRow | null,
  accessToken: string
): { state: StoredAppState; user: User; role: User['role']; shopRecord: Boutique | null } => {
  const fallback = cloneSeedState();
  const storedUser = toStoredUser(profile);
  const storedShop = toStoredShop(shop);

  return {
    state: {
      ...fallback,
      auth: {
        isAuthenticated: true,
        currentUserId: storedUser.id,
        token: accessToken,
      },
      users: [storedUser],
      shop: storedShop,
    },
    user: mapUser(storedUser),
    role: storedUser.role,
    shopRecord: storedShop ? mapShop(storedShop, storedUser) : null,
  };
};

const ensureActiveSession = (session: Session | null): Session => {
  if (!session?.user || !session.access_token) {
    throw new Error(
      'Inscription creee mais session absente. Desactive la confirmation email dans Supabase pour le mode demo.'
    );
  }

  return session;
};

const ensureUserIdentity = (user: SupabaseUser | null): string => {
  if (!user?.id) {
    throw new Error('Utilisateur Supabase introuvable.');
  }

  return user.id;
};

export const loginWithSupabase = async (
  credentials: LoginCredentials
): Promise<{ auth: AuthResponse; state: StoredAppState }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    throw new Error(error.message || 'Echec de la connexion.');
  }

  const userId = ensureUserIdentity(data.user);
  const profile = await fetchProfile(userId);
  const shop = await fetchShop(userId);
  const built = buildStoredState(profile, shop, data.session?.access_token ?? '');

  return {
    auth: {
      user: built.user,
      token: built.state.auth.token ?? '',
      role: built.role,
    },
    state: built.state,
  };
};

export const registerWithSupabase = async (
  input: RegisterData
): Promise<{ auth: AuthResponse; state: StoredAppState }> => {
  const supabase = getSupabaseClient();

  if (!input.name?.trim() || !input.email?.trim() || !input.password?.trim()) {
    throw new Error('Informations utilisateur incomplètes.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Echec de l inscription.');
  }

  const session = ensureActiveSession(data.session);
  const userId = ensureUserIdentity(data.user);
  const now = nowIso();

  const profilePayload = {
    id: userId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: (input.isBoutique ? 'owner' : 'staff') as User['role'],
    updated_at: now,
    created_at: now,
  };

  const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
  if (profileError) {
    throw new Error(profileError.message || 'Impossible de creer le profil Supabase.');
  }

  if (input.isBoutique) {
    const logo = input.logo instanceof File ? await fileToDataUrl(input.logo) : null;
    const { error: shopError } = await supabase.from('shops').upsert({
      owner_id: userId,
      name: input.shopName?.trim() || 'Ma boutique',
      logo,
      address: input.address?.trim() || null,
      postal_code: input.postalCode?.trim() || null,
      country: input.country?.trim() || null,
      phone_number: input.phoneNumber?.trim() || null,
      description: input.description?.trim() || null,
      updated_at: now,
      created_at: now,
    });

    if (shopError) {
      throw new Error(shopError.message || 'Impossible de creer la boutique Supabase.');
    }
  }

  const profile = await fetchProfile(userId);
  const shop = await fetchShop(userId);
  const built = buildStoredState(profile, shop, session.access_token);

  return {
    auth: {
      user: built.user,
      token: session.access_token,
      role: built.role,
    },
    state: built.state,
  };
};

export const loadSupabaseSessionState = async (): Promise<StoredAppState> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || 'Impossible de verifier la session Supabase.');
  }

  if (!data.session?.user) {
    return cloneSeedState();
  }

  const profile = await fetchProfile(data.session.user.id);
  const shop = await fetchShop(data.session.user.id);

  return buildStoredState(profile, shop, data.session.access_token).state;
};

export const logoutFromSupabase = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || 'Impossible de fermer la session Supabase.');
  }
};

export const updateSupabaseShopProfile = async (
  shopName: string,
  shopLogo: File | null
): Promise<{ state: StoredAppState; shop: Boutique | null }> => {
  const supabase = getSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error('Session Supabase introuvable.');
  }

  const existingShop = await fetchShop(userId);
  if (!existingShop) {
    return {
      state: await loadSupabaseSessionState(),
      shop: null,
    };
  }

  const logo = shopLogo ? await fileToDataUrl(shopLogo) : existingShop.logo ?? null;
  const { error } = await supabase
    .from('shops')
    .update({
      name: shopName.trim() || existingShop.name,
      logo,
      updated_at: nowIso(),
    })
    .eq('id', existingShop.id);

  if (error) {
    throw new Error(error.message || 'Impossible de mettre a jour la boutique Supabase.');
  }

  const nextState = await loadSupabaseSessionState();
  const owner = nextState.users[0];
  const shopRecord = nextState.shop && owner ? mapShop(nextState.shop, owner) : null;

  return {
    state: nextState,
    shop: shopRecord,
  };
};

export const subscribeToSupabaseAuth = (callback: () => void): (() => void) => {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange(() => {
    void Promise.resolve(callback());
  });

  return () => {
    data.subscription.unsubscribe();
  };
};
