// Mapping: pays -> devise
export const CURRENCY_BY_COUNTRY: Record<string, { code: string; symbol: string; name: string }> = {
  'Sénégal': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Mali': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Côte d\'Ivoire': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Burkina Faso': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Niger': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Bénin': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Togo': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
  'Guinée': { code: 'GNF', symbol: 'Fr', name: 'Franc Guinéen' },
  'France': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Autre': { code: 'XOF', symbol: 'Fr', name: 'Franc CFA' },
};

/**
 * Récupère les informations de devise selon le pays
 */
export const getCurrencyByCountry = (country?: string): { code: string; symbol: string; name: string } => {
  if (!country || !CURRENCY_BY_COUNTRY[country]) {
    return CURRENCY_BY_COUNTRY['Sénégal']; // Défaut
  }
  return CURRENCY_BY_COUNTRY[country];
};

/**
 * Formate le prix avec la devise simple (ex: "100 Fr" pour FCFA)
 */
export const formatPriceWithCurrency = (price: number | string, country?: string): string => {
  const currency = getCurrencyByCountry(country);
  const numPrice = typeof price === 'string' ? extractPriceNumber(price) : price;
  return `${numPrice} ${currency.symbol}`;
};

/**
 * Extrait le nombre du prix formaté (ex: "100 Fr" -> 100)
 */
export const extractPriceNumber = (priceString: string): number => {
  const match = priceString.match(/^([\d.]+)/);
  if (!match) return 0;
  return Number(match[1]);
};

/**
 * Valide et formate le prix avec la devise
 * Accepte les entrées comme "100" ou "100.50" et retourne "100 Fr"
 */
export const formatPrice = (value: string, country?: string): string => {
  // Extraire juste les chiffres et points
  const cleanValue = value.replace(/[^\d.]/g, '');
  if (!cleanValue) return '';
  
  const num = Number(cleanValue);
  if (Number.isNaN(num)) return '';
  
  const currency = getCurrencyByCountry(country);
  return `${num} ${currency.symbol}`;
};
