/**
 * RR (Risk-Reward Ratio) Calculation Utilities
 * Includes pip conversion for all asset types
 * Handles correct RR calculation regardless of asset type
 */

/**
 * Get pip size/value for a specific symbol
 * Different assets have different pip values:
 * - Forex (most pairs): 0.0001 pips
 * - JPY pairs: 0.01 pips
 * - Gold/Silver/Metals: 0.01 pips
 * - Futures: Varies (contract size)
 * - Cryptocurrencies: 0.01 USD
 * 
 * @param symbol - The trading symbol (e.g., "EUR/USD", "XAU/USD")
 * @returns Pip size for the symbol
 */
export const getPipSize = (symbol: string): number => {
  const sym = symbol?.toUpperCase() || '';
  
  // JPY PAIRS - 0.01 pip size
  if (sym.includes('JPY')) {
    return 0.01;
  }
  
  // METALS (Gold, Silver, etc.) - 0.01 pip size
  if (sym.includes('XAU') || sym.includes('GOLD') || 
      sym.includes('XAG') || sym.includes('SILVER') ||
      sym.includes('XPT') || sym.includes('PLATINUM') ||
      sym.includes('XPD') || sym.includes('PALLADIUM')) {
    return 0.01;
  }
  
  // CRUDE OIL, NATURAL GAS - 0.01 pip size
  if (sym.includes('WTI') || sym.includes('BRENT') || 
      sym.includes('CL') || sym.includes('GAS') || sym.includes('NG')) {
    return 0.01;
  }
  
  // CRYPTOCURRENCIES - 0.01 USD
  if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('CRYPTO') ||
      sym.includes('XRP') || sym.includes('LTC')) {
    return 0.01;
  }
  
  // STOCK INDICES - 1 point = 1 index point
  if (sym.includes('SPX') || sym.includes('NASDAQ') || sym.includes('DJIA') ||
      sym.includes('DAX') || sym.includes('FTSE') || sym.includes('CAC') ||
      sym.includes('NIKKEI') || sym.includes('HANG') || sym.includes('ASX') ||
      sym.includes('RUSSELL') || sym.includes('ES') || sym.includes('NQ') ||
      sym.includes('YM') || sym.includes('RTY')) {
    return 1;
  }
  
  // FUTURES - GC (Gold), SI (Silver), CL (Crude), etc.
  if (sym === 'GC') return 0.1;      // Gold Futures: $10 per point
  if (sym === 'SI') return 0.01;     // Silver Futures
  if (sym === 'CL') return 0.01;     // Crude Oil Futures
  if (sym === 'NG') return 0.001;    // Natural Gas Futures
  if (sym === 'ZC') return 0.0025;   // Corn Futures
  if (sym === 'ZW') return 0.0025;   // Wheat Futures
  if (sym === 'ZS') return 0.01;     // Soybean Futures
  if (sym === 'HG') return 0.0001;   // Copper Futures
  if (sym === 'PL') return 0.01;     // Platinum Futures
  if (sym === 'PA') return 0.01;     // Palladium Futures
  
  // AGRICULTURAL COMMODITIES
  if (sym.includes('CORN') || sym.includes('WHEAT') || 
      sym.includes('SOYBEAN') || sym.includes('COTTON') ||
      sym.includes('SUGAR') || sym.includes('COFFEE') || sym.includes('COCOA')) {
    return 0.01;
  }
  
  // DEFAULT for most Forex pairs (EUR/USD, GBP/USD, etc.) - 0.0001
  return 0.0001;
};

/**
 * Calculate points from price difference
 * Points = Price Difference / Pip Size
 * 
 * Example: Gold (XAU/USD) with pip size 0.01
 * If SL = 2000 and Entry = 2050, then:
 * Points = |2050 - 2000| / 0.01 = 50 / 0.01 = 5000 points
 * 
 * @param priceA - First price (entry or TP)
 * @param priceB - Second price (SL or another level)
 * @param symbol - Symbol to get correct pip size
 * @returns Points value
 */
export const calculatePointsFromPrice = (
  priceA: number,
  priceB: number,
  symbol: string
): number => {
  // Ensure numeric inputs
  const a = Number(priceA || 0);
  const b = Number(priceB || 0);
  if (!isFinite(a) || !isFinite(b)) return 0;

  const priceDifference = Math.abs(a - b);
  const pipSize = getPipSize(symbol);

  // Points (pips) = Price Difference / Pip Size
  // Return an integer number of points (rounded)
  if (!pipSize || pipSize <= 0) return 0;
  return Math.round(priceDifference / pipSize);
};

/**
 * Calculate price from points
 * Price Difference = Points × Pip Size
 * This is the reverse of calculatePointsFromPrice
 * 
 * @param points - Number of points
 * @param symbol - Symbol to get correct pip size
 * @returns Price difference
 */
export const calculatePriceFromPoints = (
  points: number,
  symbol: string
): number => {
  const pipSize = getPipSize(symbol);
  return points * pipSize;
};

/**
 * Calculate Risk-Reward Ratio from points
 * RR = Reward Points / Risk Points
 * Example: If you risk 50 points to make 100 points, RR = 100/50 = 2:1
 * 
 * @param riskPoints - Distance from entry to stop loss (in points)
 * @param rewardPoints - Distance from entry to take profit (in points)
 * @returns RR value (e.g., 2 for 1:2 ratio)
 */
export const calculateRRFromPoints = (
  riskPoints: number,
  rewardPoints: number
): number => {
  if (riskPoints <= 0 || rewardPoints <= 0) return 0;
  return rewardPoints / riskPoints;
};

/**
 * Calculate Risk-Reward Ratio from prices
 * Works universally for ALL asset types because prices are normalized
 * RR = (TP - Entry) / (Entry - SL)
 * 
 * This is the PREFERRED method for RR calculation because:
 * - Works identically for Forex, Gold, Indices, Futures, Crypto
 * - Doesn't require knowing pip sizes
 * - Automatically handles bidirectional trades (BUY/SELL)
 * 
 * Example: BUY EUR/USD at 1.0900, TP 1.0950, SL 1.0850
 * RR = (1.0950 - 1.0900) / (1.0900 - 1.0850) = 0.0050 / 0.0050 = 1:1
 * 
 * @param entryPrice - Entry level
 * @param tpPrice - Take profit level
 * @param slPrice - Stop loss level
 * @returns RR value capped at 50 to prevent outliers
 */
export const calculateRRFromPrices = (
  entryPrice: number,
  tpPrice: number,
  slPrice: number
): number => {
  if (!entryPrice || !tpPrice || !slPrice) return 0;
  
  const reward = Math.abs(tpPrice - entryPrice);
  const risk = Math.abs(entryPrice - slPrice);
  
  if (risk <= 0) return 0;
  
  const rr = reward / risk;
  // Cap at 50 to prevent extreme outliers from skewing averages
  return Math.min(Math.max(rr, 0), 50);
};

/**
 * Normalize RR to prevent outliers from skewing statistics
 * Most viable RRs are in 0.5-5 range, anything above 50 is likely a data error
 * 
 * @param rr - Raw RR value
 * @param maxRR - Maximum allowed RR (default 50)
 * @returns Normalized RR value
 */
export const normalizeRR = (rr: number, maxRR = 50): number => {
  if (!rr || isNaN(rr)) return 0;
  return Math.min(Math.max(rr, 0), maxRR);
};

/**
 * Calculate achieved RR from actual dollar amounts
 * Used for manual exits where actual P&L differs from TP
 * Achieved RR = Actual Profit / Risk Amount
 * 
 * Example: Risked $100 to make $200, but actually exited for $150 profit
 * Achieved RR = 150 / 100 = 1.5:1
 * 
 * @param realizedAmount - Actual profit/loss amount in dollars
 * @param riskAmount - Amount risked (in dollars)
 * @returns Achieved RR ratio
 */
export const calculateAchievedRRFromAmount = (
  realizedAmount: number,
  riskAmount: number
): number => {
  if (!riskAmount || riskAmount === 0) return 0;
  return realizedAmount / riskAmount;
};

/**
 * Safely validate and coerce RR values
 * Handles edge cases: null, undefined, NaN, negative, infinite
 * 
 * @param value - Any value to validate as RR
 * @returns Safe RR number between 0 and 50
 */
export const safeRR = (value: any): number => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(0, Math.min(num, 50));
};
