export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const AVAILABLE_CURRENCIES: CurrencyOption[] = [
  { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  { code: 'GNF', symbol: 'Fr', name: 'Franc Guinéen' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar US' },
];

export const DEFAULT_CURRENCY_CODE = 'XOF';

const CURRENCY_BY_CODE: Record<string, CurrencyOption> = AVAILABLE_CURRENCIES.reduce<Record<string, CurrencyOption>>(
  (accumulator, currency) => {
    accumulator[currency.code] = currency;
    return accumulator;
  },
  {}
);

// Mapping: pays -> devise
export const CURRENCY_BY_COUNTRY: Record<string, CurrencyOption> = {
  'Sénégal': CURRENCY_BY_CODE.XOF,
  'Mali': CURRENCY_BY_CODE.XOF,
  'Côte d\'Ivoire': CURRENCY_BY_CODE.XOF,
  'Burkina Faso': CURRENCY_BY_CODE.XOF,
  'Niger': CURRENCY_BY_CODE.XOF,
  'Bénin': CURRENCY_BY_CODE.XOF,
  'Togo': CURRENCY_BY_CODE.XOF,
  'Guinée': CURRENCY_BY_CODE.GNF,
  'France': CURRENCY_BY_CODE.EUR,
  'Autre': CURRENCY_BY_CODE.XOF,
};

export const getCurrencyByCode = (code?: string): CurrencyOption => {
  if (!code) {
    return CURRENCY_BY_CODE[DEFAULT_CURRENCY_CODE];
  }

  return CURRENCY_BY_CODE[code] ?? CURRENCY_BY_CODE[DEFAULT_CURRENCY_CODE];
};

/**
 * Récupère les informations de devise selon le pays
 */
export const getCurrencyByCountry = (country?: string): CurrencyOption => {
  if (!country || !CURRENCY_BY_COUNTRY[country]) {
    return CURRENCY_BY_CODE[DEFAULT_CURRENCY_CODE];
  }
  return CURRENCY_BY_COUNTRY[country];
};

/**
 * Formate le prix avec la devise simple (ex: "100 Fr" pour FCFA)
 */
export const formatPriceWithCurrency = (price: number | string, currencyCode?: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  const numPrice = typeof price === 'string' ? extractPriceNumber(price) : price;
  return `${numPrice} ${currency.symbol}`;
};

/**
 * Extrait le nombre du prix formaté (ex: "100 Fr" -> 100)
 */
export const extractPriceNumber = (priceString: string): number => {
  const normalized = priceString.replace(',', '.');
  const match = normalized.match(/^([\d.]+)/);
  if (!match) return 0;
  return Number(match[1]);
};

/**
 * Nettoie une saisie de prix pour conserver uniquement les chiffres et un séparateur décimal.
 */
export const sanitizePriceInput = (value: string): string => {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  const parts = normalized.split('.');

  if (parts.length <= 1) {
    return normalized;
  }

  return `${parts[0]}.${parts.slice(1).join('')}`;
};
