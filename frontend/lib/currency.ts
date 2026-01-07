// Currency configuration
export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    position: 'before', // before or after the amount
  },
  PKR: {
    symbol: 'Rs',
    code: 'PKR',
    name: 'Pakistani Rupee',
    position: 'before',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    position: 'before',
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound',
    position: 'before',
  },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;

/**
 * Convert price from base currency (PKR) to target currency
 * @param priceInPKR - Price in Pakistani Rupees (base currency)
 * @param targetCurrency - Currency to convert to
 * @param exchangeRate - USD to PKR exchange rate (1 USD = X PKR)
 * @returns Converted price
 */
export function convertPrice(
  priceInPKR: number,
  targetCurrency: CurrencyCode,
  exchangeRate: number = 279.89
): number {
  if (targetCurrency === 'PKR') {
    return priceInPKR;
  }

  if (targetCurrency === 'USD') {
    return priceInPKR / exchangeRate;
  }

  return priceInPKR;
}

/**
 * Format a price with the appropriate currency symbol and conversion
 * @param priceInPKR - The price in PKR (base currency)
 * @param targetCurrency - The currency code to display in (USD or PKR)
 * @param exchangeRate - The USD to PKR exchange rate
 * @param showCode - Whether to show the currency code (e.g., "USD")
 * @returns Formatted price string
 */
export function formatPrice(
  priceInPKR: number,
  targetCurrency: CurrencyCode = 'USD',
  exchangeRate: number = 279.89,
  showCode: boolean = false
): string {
  const config = CURRENCY_CONFIG[targetCurrency];

  if (!config) {
    console.warn(`Unknown currency code: ${targetCurrency}, defaulting to PKR`);
    return formatPrice(priceInPKR, 'PKR', exchangeRate, showCode);
  }

  // Convert price to target currency
  const convertedPrice = convertPrice(priceInPKR, targetCurrency, exchangeRate);
  const formattedAmount = convertedPrice.toFixed(2);
  const symbol = config.symbol;
  const code = showCode ? ` ${config.code}` : '';

  if (config.position === 'before') {
    return `${symbol} ${formattedAmount}${code}`;
  } else {
    return `${formattedAmount} ${symbol}${code}`;
  }
}

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = 'PKR'): string {
  return CURRENCY_CONFIG[currencyCode]?.symbol || 'Rs';
}

/**
 * Get currency configuration
 * @param currencyCode - The currency code
 * @returns Currency configuration object
 */
export function getCurrencyConfig(currencyCode: CurrencyCode = 'PKR') {
  return CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.PKR;
}
