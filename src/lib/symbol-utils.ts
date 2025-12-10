/**
 * Comprehensive Symbol Normalization Utility
 * Handles: Forex Pairs, Metals, Commodities, Futures, Indices, Crypto
 * 
 * Purpose: Normalize any instrument input so EUR/USD, eurusd, Eurusd, EURUSD all map to the same database entry
 */

/**
 * Known instrument patterns with their standard display formats
 */
const INSTRUMENT_PATTERNS: Record<string, string> = {
  // FOREX PAIRS (7 major pairs)
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'USDCHF': 'USD/CHF',
  'AUDUSD': 'AUD/USD',
  'USDCAD': 'USD/CAD',
  'NZDUSD': 'NZD/USD',
  
  // FOREX PAIRS - CROSSES
  'EURGBP': 'EUR/GBP',
  'EURJPY': 'EUR/JPY',
  'EURCHF': 'EUR/CHF',
  'EURNZD': 'EUR/NZD',
  'EURAUDA': 'EUR/AUD',
  'EURCAD': 'EUR/CAD',
  'GBPJPY': 'GBP/JPY',
  'GBPCHF': 'GBP/CHF',
  'GBPAUD': 'GBP/AUD',
  'GBPCAD': 'GBP/CAD',
  'GBPNZD': 'GBP/NZD',
  'AUDJPY': 'AUD/JPY',
  'AUDCHF': 'AUD/CHF',
  'AUDCAD': 'AUD/CAD',
  'AUDNZD': 'AUD/NZD',
  'CADJPY': 'CAD/JPY',
  'CHFJPY': 'CHF/JPY',
  'NZDJPY': 'NZD/JPY',
  
  // PRECIOUS METALS
  'XAUUSD': 'XAU/USD', // Gold
  'GOLD': 'XAU/USD',
  'XAGUSD': 'XAG/USD', // Silver
  'SILVER': 'XAG/USD',
  'XPTUSD': 'XPT/USD', // Platinum
  'PLATINUM': 'XPT/USD',
  'XPDUSD': 'XPD/USD', // Palladium
  'PALLADIUM': 'XPD/USD',
  
  // CRUDE OIL
  'WTIUSD': 'WTI/USD',
  'WTICRUDELUSD': 'WTI/USD',
  'CLCRUDEOIL': 'WTI/USD', // Crude Oil Futures
  'BRENTUSD': 'BRENT/USD',
  'BRENTOIL': 'BRENT/USD',
  
  // NATURAL GAS
  'GASUSD': 'GAS/USD',
  'NATURALGAS': 'GAS/USD',
  'NGGASFUTURES': 'GAS/USD', // Natural Gas Futures
  
  // AGRICULTURAL COMMODITIES
  'CORNUSD': 'CORN/USD',
  'ZCCORNFUTURES': 'CORN/USD', // Corn Futures
  'SOYBEAN': 'SOYBEAN/USD',
  'SOYBEANS': 'SOYBEAN/USD',
  'ZSSOYBEANFUTURES': 'SOYBEAN/USD', // Soybean Futures
  'WHEAT': 'WHEAT/USD',
  'ZWWHEATFUTURES': 'WHEAT/USD', // Wheat Futures
  'SUGUR': 'SUGAR/USD', // Common misspelling
  'SUGAR': 'SUGAR/USD',
  'SBSUGARFUTURES': 'SUGAR/USD', // Sugar #11 Futures
  'COFFEE': 'COFFEE/USD',
  'KCCOFFEEFUTURES': 'COFFEE/USD', // Coffee C Futures
  'COCOA': 'COCOA/USD',
  'CCCOCOAFUTURES': 'COCOA/USD', // Cocoa Futures
  
  // STOCK INDICES
  'SPX': 'SPX500',
  'SP500': 'SPX500',
  'GSPC': 'SPX500',
  '^GSPC': 'SPX500',
  'SP': 'SPX500',
  
  'NDX': 'NASDAQ100',
  'NDAQ': 'NASDAQ100',
  'NASDAQ': 'NASDAQ100',
  '^IXIC': 'NASDAQ100',
  
  'DJX': 'DJIA30',
  'DJIA': 'DJIA30',
  'DIA': 'DJIA30',
  '^DJI': 'DJIA30',
  
  'VIX': 'VIX',
  '^VIX': 'VIX',
  
  'DAX': 'DAX',
  '^GDAXI': 'DAX',
  'GDAX': 'DAX',
  
  'CAC': 'CAC40',
  'CAC40': 'CAC40',
  '^FCHI': 'CAC40',
  
  'FTSE': 'FTSE100',
  'FTSE100': 'FTSE100',
  '^FTSE': 'FTSE100',
  
  'ASX': 'ASX200',
  'ASX200': 'ASX200',
  '^AORD': 'ASX200',
  
  'HANGSENG': 'HANGSENG',
  'HSI': 'HANGSENG',
  '^HSI': 'HANGSENG',
  
  'NIKKEI': 'NIKKEI225',
  'NIKKEI225': 'NIKKEI225',
  '^N225': 'NIKKEI225',
  
  // CRYPTOCURRENCIES
  'BTCUSD': 'BTC/USD',
  'BITCOIN': 'BTC/USD',
  'BTC': 'BTC/USD',
  'ETHUSD': 'ETH/USD',
  'ETHEREUM': 'ETH/USD',
  'ETH': 'ETH/USD',
  'LTCUSD': 'LTC/USD',
  'LITECOIN': 'LTC/USD',
  'LTC': 'LTC/USD',
  'XRPUSD': 'XRP/USD',
  'RIPPLE': 'XRP/USD',
  'XRP': 'XRP/USD',
  
  // BONDS & RATES
  'US10Y': 'US10Y',
  'US2Y': 'US2Y',
  'US30Y': 'US30Y',
  'TNOTE': 'US10Y',
  'TYZ': 'US10Y',
  
  // FUTURES - INTEREST RATES (US)
  'GCGOLDFUTURES': 'GC', // 100-oz Gold Futures
  'SISILVERFUTURES': 'SI', // 5000-oz Silver Futures
  'CLCRUDEOILFUTURES': 'CL', // Light Sweet Crude Oil Futures
  'NGFUTURES': 'NG', // Natural Gas Futures
  'ZCFUTURES': 'ZC', // Corn Futures
  'ZWFUTURES': 'ZW', // Wheat Futures
  'ZSFUTURES': 'ZS', // Soybean Futures
  'ZBTREASURYBOND': 'ZB', // US Treasury Bond Futures
  'TYTREASURYNOTE': 'TY', // US 10-Year Treasury Note Futures
  'ESSP500MINI': 'ES', // E-mini S&P 500 Futures
  'NQNASDAQMINI': 'NQ', // E-mini NASDAQ-100 Futures
  'YMDOWMINI': 'YM', // E-mini Dow Jones Futures
  'RTYRUSSSELL': 'RTY', // E-mini Russell 2000 Futures
  'EMDEMIDCAP': 'EMD', // E-mini S&P MidCap 400 Futures
  'EFEUROMINIFX': 'EF', // Euro FX Futures
  'GEURODOLLAR': 'GE', // Eurodollar Futures
  'HGCOPPER': 'HG', // Copper Futures
  'PLPLATINUM': 'PL', // Platinum Futures
  'PAPALLADIUM': 'PA', // Palladium Futures
  'CTCOTTON': 'CT', // Cotton Futures
  'OJJUICE': 'OJ', // Orange Juice Futures
  
  // FUTURES - CURRENCY
  'EC': 'EC', // Eurocurrency (Euro)
  'BP': 'BP', // British Pound Futures
  'JY': 'JY', // Japanese Yen Futures
  'AD': 'AD', // Australian Dollar Futures
  'SF': 'SF', // Swiss Franc Futures
  'CD': 'CD', // Canadian Dollar Futures
  'NE': 'NE', // New Zealand Dollar Futures
  'MEF': 'MEF', // Mexican Peso Futures
  'BR': 'BR', // Brazilian Real Futures
  
  // FUTURES - EQUITY INDICES (INTERNATIONAL)
  'FTSEINDEX': 'FTSE', // FTSE 100 Futures
  'CACINDEX': 'CAC', // CAC 40 Futures
  'DAXINDEX': 'DAX', // DAX 40 Futures
  'NIKKEIINDEX': 'NIKKEI', // Nikkei 225 Futures
  'HANGINDEX': 'HANG', // Hang Seng Index Futures
  'AORDINDEX': 'AORD', // All Ordinaries Index Futures
  
  // FUTURES - MICRO (small size contracts)
  'MES': 'MES', // Micro E-mini S&P 500
  'MNQ': 'MNQ', // Micro E-mini NASDAQ-100
  'MYM': 'MYM', // Micro E-mini Dow Jones
  'M2K': 'M2K', // Micro Russell 2000
  
  // ADDITIONAL FOREX MINORS & EXOTICS
  'HKDUSD': 'HKD/USD',
  'SGDUSD': 'SGD/USD',
  'INRUSD': 'INR/USD',
  'BRLUSD': 'BRL/USD',
  'ZARUSD': 'ZAR/USD',
  'MXNUSD': 'MXN/USD',
  'THBUSD': 'THB/USD',
  'MYRM': 'MYR/USD',
  'PHPUSD': 'PHP/USD',
  'IDRUSD': 'IDR/USD',
  'VEFUSD': 'VEF/USD',
  'ARSUSD': 'ARS/USD',
  'CLPUSD': 'CLP/USD',
  'CNYUSD': 'CNY/USD',
  'RUBLEUSD': 'RUB/USD',
};

/**
 * Normalize a symbol to its canonical form for database storage
 * Removes all special characters and converts to uppercase for matching
 * 
 * @param symbol - Raw symbol input (e.g., "EUR/USD", "eurusd", "Eurusd")
 * @returns Normalized key (e.g., "EURUSD")
 * 
 * @example
 * normalizeSymbolKey("EUR/USD") => "EURUSD"
 * normalizeSymbolKey("eurusd") => "EURUSD"
 * normalizeSymbolKey("Eurusd") => "EURUSD"
 */
export const normalizeSymbolKey = (symbol: string): string => {
  if (!symbol) return '';
  return symbol.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

/**
 * Format a symbol for display
 * Converts normalized key or raw input to standard display format
 * 
 * @param symbol - Raw symbol input or normalized key
 * @returns Formatted display string (e.g., "EUR/USD", "XAU/USD", "SPX500")
 * 
 * @example
 * formatSymbolDisplay("EURUSD") => "EUR/USD"
 * formatSymbolDisplay("EUR/USD") => "EUR/USD"
 * formatSymbolDisplay("xauusd") => "XAU/USD"
 * formatSymbolDisplay("gold") => "XAU/USD"
 */
export const formatSymbolDisplay = (symbol: string): string => {
  if (!symbol) return '';
  
  const normalized = normalizeSymbolKey(symbol);
  const standardFormat = INSTRUMENT_PATTERNS[normalized];
  
  // If we have a known pattern, use it
  if (standardFormat) {
    return standardFormat;
  }
  
  // For unknown symbols, try to intelligently format them
  // If the symbol contains numbers, it might be an index (SPX500) - keep as is
  if (/\d/.test(normalized)) {
    return normalized;
  }
  
  // For pairs (typically 6 letters like EURUSD), add slash in the middle
  if (normalized.length === 6 && /^[A-Z]{3}[A-Z]{3}$/.test(normalized)) {
    return `${normalized.substring(0, 3)}/${normalized.substring(3)}`;
  }
  
  // For precious metals with USD (7 letters), add slash
  if (normalized.length === 7 && /^X[A-Z]{2}USD$/.test(normalized)) {
    return `${normalized.substring(0, 3)}/${normalized.substring(3)}`;
  }
  
  // Return uppercase normalized if no pattern matched
  return normalized;
};

/**
 * Get the search pattern for querying the database
 * This helps find symbols even with different formatting
 * 
 * @param symbol - Raw symbol input
 * @returns Normalized search pattern
 */
export const getSearchPattern = (symbol: string): string => {
  return normalizeSymbolKey(symbol);
};

/**
 * Check if a symbol matches a search query
 * Useful for filtering symbol lists
 * 
 * @param symbol - The symbol to check
 * @param query - The search query
 * @returns True if the symbol matches the query
 * 
 * @example
 * symbolMatches("EUR/USD", "eurusd") => true
 * symbolMatches("EUR/USD", "eur") => true
 * symbolMatches("GBP/USD", "eurusd") => false
 */
export const symbolMatches = (symbol: string, query: string): boolean => {
  if (!symbol || !query) return false;
  
  const normalizedSymbol = normalizeSymbolKey(symbol);
  const normalizedQuery = normalizeSymbolKey(query);
  
  // Exact match
  if (normalizedSymbol === normalizedQuery) return true;
  
  // Partial match (query is substring of symbol)
  if (normalizedSymbol.includes(normalizedQuery)) return true;
  
  // Check if the original symbol name matches
  const displayFormat = formatSymbolDisplay(symbol);
  if (normalizeSymbolKey(displayFormat).includes(normalizedQuery)) return true;
  
  return false;
};

/**
 * Get all known instrument types
 * Useful for documentation or autocomplete
 */
export const getKnownInstruments = (): string[] => {
  return Object.values(INSTRUMENT_PATTERNS).filter((v, i, a) => a.indexOf(v) === i).sort();
};

/**
 * Check if an instrument is recognized (has a standard format)
 */
export const isKnownInstrument = (symbol: string): boolean => {
  const normalized = normalizeSymbolKey(symbol);
  return !!INSTRUMENT_PATTERNS[normalized];
};

/**
 * Get suggestions for a partial symbol input
 * Useful for autocomplete
 * 
 * @param partial - Partial symbol input
 * @param limit - Max suggestions to return
 * @returns Array of matching instrument formats
 */
export const getSymbolSuggestions = (partial: string, limit: number = 5): string[] => {
  if (!partial) return [];
  
  const normalized = normalizeSymbolKey(partial);
  const suggestions: string[] = [];
  
  // Find all patterns that contain the partial match
  for (const [key, displayFormat] of Object.entries(INSTRUMENT_PATTERNS)) {
    if (key.includes(normalized) || normalizeSymbolKey(displayFormat).includes(normalized)) {
      if (!suggestions.includes(displayFormat)) {
        suggestions.push(displayFormat);
      }
    }
  }
  
  return suggestions.slice(0, limit);
};
export default symbolMatches;