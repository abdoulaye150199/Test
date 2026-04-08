
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

const API_BASE_URL = getEnvVar(
  'REACT_APP_API_BASE_URL',
  'http://localhost:3000/api'
);

const JWT_SECRET = getEnvVar(
  'REACT_APP_JWT_SECRET',
  'kukuza_dev_secret_key_change_in_production_12345'
);

const API_TIMEOUT = parseInt(
  getEnvVar('REACT_APP_API_TIMEOUT', '30000'),
  10
);

const ENVIRONMENT = getEnvVar('NODE_ENV', 'development');

const IS_PRODUCTION = ENVIRONMENT === 'production';

const IS_DEVELOPMENT = ENVIRONMENT === 'development';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
  },
  jwt: {
    secret: JWT_SECRET,
  },
  env: {
    isDevelopment: IS_DEVELOPMENT,
    isProduction: IS_PRODUCTION,
    current: ENVIRONMENT,
  },
};

export default config;
