import seedData from '../../src/data/shop-data.json';

export const APP_STORAGE_KEY = 'kukuza_app_state';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'owner' | 'staff';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredShop {
  id: string;
  name: string;
  logo?: string;
  ownerId: string;
  address?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAuthState {
  isAuthenticated: boolean;
  currentUserId: string | null;
  token: string | null;
}

export interface StoredProduct {
  id: string;
  reference: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  ageRange?: string;
  gender?: string;
  status: 'in_stock' | 'out_of_stock' | 'low_stock';
  createdAt: string;
  updatedAt: string;
}

export interface StoredAppState {
  auth: StoredAuthState;
  users: StoredUser[];
  shop: StoredShop | null;
  dashboard: unknown;
  products: StoredProduct[];
  sales: unknown[];
}

export const cloneSeedState = (): StoredAppState =>
  JSON.parse(JSON.stringify(seedData)) as StoredAppState;

export const loadStoredAppState = (): StoredAppState => {
  if (typeof window === 'undefined') {
    return cloneSeedState();
  }

  const rawValue = window.localStorage.getItem(APP_STORAGE_KEY);
  if (!rawValue) {
    return cloneSeedState();
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredAppState>;
    const fallback = cloneSeedState();

    return {
      auth: {
        isAuthenticated: Boolean(parsed.auth?.isAuthenticated),
        currentUserId: parsed.auth?.currentUserId ?? null,
        token: parsed.auth?.token ?? null,
      },
      users: Array.isArray(parsed.users) ? parsed.users : fallback.users,
      shop: parsed.shop ?? fallback.shop,
      dashboard: parsed.dashboard ?? fallback.dashboard,
      products: Array.isArray(parsed.products) ? parsed.products : fallback.products,
      sales: Array.isArray(parsed.sales) ? parsed.sales : fallback.sales,
    };
  } catch {
    return cloneSeedState();
  }
};

export const saveStoredAppState = (state: StoredAppState): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
};
