const DEFAULT_API_URL = 'http://localhost:3000/api';

declare const __SHOP_API_URL__: string;
declare const __SHOP_ENABLE_API_MOCKS__: string;
declare const __SHOP_SUPABASE_URL__: string;
declare const __SHOP_SUPABASE_ANON_KEY__: string;

const normalizeBaseUrl = (value: string | undefined): string => {
  const resolved = value?.trim() || DEFAULT_API_URL;
  return resolved.replace(/\/+$/, '');
};

const normalizeOptional = (value: string | undefined): string | undefined => {
  const resolved = value?.trim();
  return resolved ? resolved : undefined;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const shouldEnableMocksByDefault = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

export const shopEnv = {
  apiBaseUrl: normalizeBaseUrl(__SHOP_API_URL__),
  enableApiMocks: parseBoolean(__SHOP_ENABLE_API_MOCKS__, shouldEnableMocksByDefault()),
  supabaseUrl: normalizeOptional(__SHOP_SUPABASE_URL__),
  supabaseAnonKey: normalizeOptional(__SHOP_SUPABASE_ANON_KEY__),
  useSupabase: Boolean(
    normalizeOptional(__SHOP_SUPABASE_URL__) &&
      normalizeOptional(__SHOP_SUPABASE_ANON_KEY__)
  ),
  requestTimeoutMs: 10000,
};
