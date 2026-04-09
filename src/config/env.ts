const DEFAULT_API_URL = 'http://localhost:3000/api';

declare const __SHOP_API_URL__: string;
declare const __SHOP_ENABLE_API_MOCKS__: string;
declare const __SHOP_SUPABASE_URL__: string;
declare const __SHOP_SUPABASE_ANON_KEY__: string;

const readBuildEnv = (
  compileTimeValue: string | undefined,
  processEnvValue: string | undefined
): string | undefined => {
  const resolved = compileTimeValue ?? processEnvValue;
  return typeof resolved === 'string' ? resolved : undefined;
};

const envValues = {
  apiUrl: readBuildEnv(
    typeof __SHOP_API_URL__ !== 'undefined' ? __SHOP_API_URL__ : undefined,
    typeof process !== 'undefined' && process.env ? process.env.REACT_APP_API_URL : undefined
  ),
  enableApiMocks: readBuildEnv(
    typeof __SHOP_ENABLE_API_MOCKS__ !== 'undefined' ? __SHOP_ENABLE_API_MOCKS__ : undefined,
    typeof process !== 'undefined' && process.env ? process.env.REACT_APP_ENABLE_API_MOCKS : undefined
  ),
  supabaseUrl: readBuildEnv(
    typeof __SHOP_SUPABASE_URL__ !== 'undefined' ? __SHOP_SUPABASE_URL__ : undefined,
    typeof process !== 'undefined' && process.env ? process.env.REACT_APP_SUPABASE_URL : undefined
  ),
  supabaseAnonKey: readBuildEnv(
    typeof __SHOP_SUPABASE_ANON_KEY__ !== 'undefined' ? __SHOP_SUPABASE_ANON_KEY__ : undefined,
    typeof process !== 'undefined' && process.env ? process.env.REACT_APP_SUPABASE_ANON_KEY : undefined
  ),
};

const isLoopbackHostname = (hostname: string): boolean => {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
};

const sanitizeApiUrl = (value: string | undefined): string | undefined => {
  const resolved = value?.trim();
  if (!resolved) {
    return undefined;
  }

  try {
    const apiUrl = new URL(resolved);
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : undefined;

    if (currentHostname && !isLoopbackHostname(currentHostname) && isLoopbackHostname(apiUrl.hostname)) {
      return undefined;
    }
  } catch {
    return resolved;
  }

  return resolved;
};

const sanitizedApiUrl = sanitizeApiUrl(envValues.apiUrl);

const normalizeBaseUrl = (value: string | undefined): string => {
  const resolved = value?.trim();
  return resolved ? resolved.replace(/\/++$/, '') : '';
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
  if (!sanitizedApiUrl && !envValues.supabaseUrl && !envValues.supabaseAnonKey) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

export const shopEnv = {
  apiBaseUrl: normalizeBaseUrl(sanitizedApiUrl),
  enableApiMocks: parseBoolean(envValues.enableApiMocks, shouldEnableMocksByDefault()),
  supabaseUrl: normalizeOptional(envValues.supabaseUrl),
  supabaseAnonKey: normalizeOptional(envValues.supabaseAnonKey),
  useSupabase: Boolean(
    normalizeOptional(envValues.supabaseUrl) &&
      normalizeOptional(envValues.supabaseAnonKey)
  ),
  requestTimeoutMs: 10000,
};
