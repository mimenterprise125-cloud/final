-- ============================================================================
-- POPULATE GLOBAL SYMBOLS - Complete Symbol Library
-- ============================================================================
-- This script populates the symbols table with ALL symbols from the
-- src/lib/symbol-utils.ts INSTRUMENT_PATTERNS record.
-- 
-- All symbols are marked as is_global = true so they're available to all users.
-- Users can still create custom private symbols.
--
-- EXECUTION:
-- 1. Go to Supabase SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- ============================================================================

-- First, check if symbols already exist (for idempotency)
-- This query shows how many global symbols we have
SELECT COUNT(*) as existing_global_symbols 
FROM symbols 
WHERE is_global = true;

-- ============================================================================
-- INSERT ALL GLOBAL SYMBOLS
-- ============================================================================
-- Forex Major Pairs (7)
INSERT INTO symbols (id, name, normalized_name, user_id, is_global, created_at)
VALUES 
  (gen_random_uuid(), 'EUR/USD', 'EURUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/USD', 'GBPUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'USD/JPY', 'USDJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'USD/CHF', 'USDCHF', NULL, true, NOW()),
  (gen_random_uuid(), 'AUD/USD', 'AUDUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'USD/CAD', 'USDCAD', NULL, true, NOW()),
  (gen_random_uuid(), 'NZD/USD', 'NZDUSD', NULL, true, NOW()),

-- Forex Crosses (20+)
  (gen_random_uuid(), 'EUR/GBP', 'EURGBP', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/JPY', 'EURJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/CHF', 'EURCHF', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/AUD', 'EURAUD', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/CAD', 'EURCAD', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/NZD', 'EURNZD', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/JPY', 'GBPJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/CHF', 'GBPCHF', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/AUD', 'GBPAUD', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/CAD', 'GBPCAD', NULL, true, NOW()),
  (gen_random_uuid(), 'JPY/CHF', 'JPYCHF', NULL, true, NOW()),
  (gen_random_uuid(), 'AUD/JPY', 'AUDJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'AUD/CHF', 'AUDCHF', NULL, true, NOW()),
  (gen_random_uuid(), 'CAD/JPY', 'CADJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'NZD/JPY', 'NZDJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'NZD/CHF', 'NZDCHF', NULL, true, NOW()),

-- Precious Metals (4)
  (gen_random_uuid(), 'XAU/USD', 'XAUUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'XAG/USD', 'XAGUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'XPT/USD', 'XPTUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'XPD/USD', 'XPDUSD', NULL, true, NOW()),

-- Energy Commodities
  (gen_random_uuid(), 'WTI/USD', 'WTIUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'BRENT/USD', 'BRENTUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'GAS/USD', 'GASUSD', NULL, true, NOW()),

-- Agricultural Commodities
  (gen_random_uuid(), 'CORN/USD', 'CORNUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'SOYBEAN/USD', 'SOYBEAN', NULL, true, NOW()),
  (gen_random_uuid(), 'WHEAT/USD', 'WHEAT', NULL, true, NOW()),
  (gen_random_uuid(), 'SUGAR/USD', 'SUGAR', NULL, true, NOW()),
  (gen_random_uuid(), 'COFFEE/USD', 'COFFEE', NULL, true, NOW()),
  (gen_random_uuid(), 'COCOA/USD', 'COCOA', NULL, true, NOW()),

-- Stock Indices (US)
  (gen_random_uuid(), 'SPX500', 'SPX', NULL, true, NOW()),
  (gen_random_uuid(), 'NASDAQ100', 'NDX', NULL, true, NOW()),
  (gen_random_uuid(), 'DJIA30', 'DJX', NULL, true, NOW()),
  (gen_random_uuid(), 'VIX', 'VIX', NULL, true, NOW()),

-- Stock Indices (International)
  (gen_random_uuid(), 'DAX', 'DAX', NULL, true, NOW()),
  (gen_random_uuid(), 'CAC40', 'CAC', NULL, true, NOW()),
  (gen_random_uuid(), 'FTSE100', 'FTSE', NULL, true, NOW()),
  (gen_random_uuid(), 'ASX200', 'ASX', NULL, true, NOW()),
  (gen_random_uuid(), 'HANGSENG', 'HANGSENG', NULL, true, NOW()),
  (gen_random_uuid(), 'NIKKEI225', 'NIKKEI', NULL, true, NOW()),

-- Cryptocurrencies (4 major)
  (gen_random_uuid(), 'BTC/USD', 'BTCUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'ETH/USD', 'ETHUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'LTC/USD', 'LTCUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'XRP/USD', 'XRPUSD', NULL, true, NOW()),

-- Bonds & Rates
  (gen_random_uuid(), 'US10Y', 'US10Y', NULL, true, NOW()),
  (gen_random_uuid(), 'US2Y', 'US2Y', NULL, true, NOW()),
  (gen_random_uuid(), 'US30Y', 'US30Y', NULL, true, NOW()),

-- Futures - Commodities
  (gen_random_uuid(), 'GC', 'GC', NULL, true, NOW()),
  (gen_random_uuid(), 'SI', 'SI', NULL, true, NOW()),
  (gen_random_uuid(), 'CL', 'CL', NULL, true, NOW()),
  (gen_random_uuid(), 'NG', 'NG', NULL, true, NOW()),
  (gen_random_uuid(), 'ZC', 'ZC', NULL, true, NOW()),
  (gen_random_uuid(), 'ZW', 'ZW', NULL, true, NOW()),
  (gen_random_uuid(), 'ZS', 'ZS', NULL, true, NOW()),
  (gen_random_uuid(), 'CT', 'CT', NULL, true, NOW()),
  (gen_random_uuid(), 'OJ', 'OJ', NULL, true, NOW()),

-- Futures - Treasury Bonds
  (gen_random_uuid(), 'ZB', 'ZB', NULL, true, NOW()),
  (gen_random_uuid(), 'TY', 'TY', NULL, true, NOW()),

-- Futures - Equity Indices
  (gen_random_uuid(), 'ES', 'ES', NULL, true, NOW()),
  (gen_random_uuid(), 'NQ', 'NQ', NULL, true, NOW()),
  (gen_random_uuid(), 'YM', 'YM', NULL, true, NOW()),
  (gen_random_uuid(), 'RTY', 'RTY', NULL, true, NOW()),
  (gen_random_uuid(), 'EMD', 'EMD', NULL, true, NOW()),

-- Futures - Currency
  (gen_random_uuid(), 'EC', 'EC', NULL, true, NOW()),
  (gen_random_uuid(), 'BP', 'BP', NULL, true, NOW()),
  (gen_random_uuid(), 'JY', 'JY', NULL, true, NOW()),
  (gen_random_uuid(), 'AD', 'AD', NULL, true, NOW()),
  (gen_random_uuid(), 'SF', 'SF', NULL, true, NOW()),
  (gen_random_uuid(), 'CD', 'CD', NULL, true, NOW()),
  (gen_random_uuid(), 'NE', 'NE', NULL, true, NOW()),
  (gen_random_uuid(), 'MEF', 'MEF', NULL, true, NOW()),
  (gen_random_uuid(), 'BR', 'BR', NULL, true, NOW()),

-- Futures - Other
  (gen_random_uuid(), 'EF', 'EF', NULL, true, NOW()),
  (gen_random_uuid(), 'GE', 'GE', NULL, true, NOW()),
  (gen_random_uuid(), 'HG', 'HG', NULL, true, NOW()),
  (gen_random_uuid(), 'PL', 'PL', NULL, true, NOW()),
  (gen_random_uuid(), 'PA', 'PA', NULL, true, NOW()),

-- Micro Contracts
  (gen_random_uuid(), 'MES', 'MES', NULL, true, NOW()),
  (gen_random_uuid(), 'MNQ', 'MNQ', NULL, true, NOW()),
  (gen_random_uuid(), 'MYM', 'MYM', NULL, true, NOW()),
  (gen_random_uuid(), 'M2K', 'M2K', NULL, true, NOW()),

-- Additional Forex Minors & Exotics
  (gen_random_uuid(), 'HKD/USD', 'HKDUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'SGD/USD', 'SGDUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'INR/USD', 'INRUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'BRL/USD', 'BRLUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'ZAR/USD', 'ZARUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'MXN/USD', 'MXNUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'THB/USD', 'THBUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'MYR/USD', 'MYRM', NULL, true, NOW()),
  (gen_random_uuid(), 'PHP/USD', 'PHPUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'IDR/USD', 'IDRUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'VEF/USD', 'VEFUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'ARS/USD', 'ARSUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'CLP/USD', 'CLPUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'CNY/USD', 'CNYUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'RUB/USD', 'RUBLEUSD', NULL, true, NOW())
ON CONFLICT (normalized_name, user_id) DO NOTHING;

-- ============================================================================
-- VERIFY POPULATION
-- ============================================================================
-- Run these queries to verify the symbols were inserted successfully

-- Count total global symbols
SELECT COUNT(*) as total_global_symbols 
FROM symbols 
WHERE is_global = true;

-- Show sample of inserted symbols
SELECT id, name, normalized_name, is_global, created_at 
FROM symbols 
WHERE is_global = true 
LIMIT 20;

-- Count by category (estimated)
SELECT 
  'Total Symbols' as category,
  COUNT(*) as count
FROM symbols 
WHERE is_global = true
UNION ALL
SELECT 
  'Forex Pairs' as category,
  COUNT(*) as count
FROM symbols 
WHERE is_global = true AND name LIKE '%/%'
UNION ALL
SELECT 
  'Futures Contracts' as category,
  COUNT(*) as count
FROM symbols 
WHERE is_global = true AND normalized_name IN ('ES', 'NQ', 'YM', 'RTY', 'MES', 'MNQ', 'MYM', 'M2K', 'GC', 'SI', 'CL', 'NG', 'ZC', 'ZW', 'ZS', 'ZB', 'TY', 'EC', 'BP', 'JY', 'AD', 'SF', 'CD', 'NE', 'MEF', 'BR', 'EF', 'GE', 'HG', 'PL', 'PA', 'CT', 'OJ');

-- ============================================================================
-- TEST: Verify symbol visibility (should return all symbols for any user)
-- ============================================================================
-- This simulates what happens when a user queries for symbols
-- They should see all global symbols + any custom ones they created

-- Change this UUID to your test user ID
WITH test_user AS (
  SELECT '00000000-0000-0000-0000-000000000001'::uuid as user_id
)
SELECT 
  s.id,
  s.name,
  s.normalized_name,
  CASE 
    WHEN s.is_global THEN 'Global (All Users)'
    ELSE 'Private (Custom)'
  END as visibility,
  s.created_at
FROM symbols s
CROSS JOIN test_user t
WHERE s.is_global = true 
   OR s.user_id = t.user_id
ORDER BY s.is_global DESC, s.name
LIMIT 30;
