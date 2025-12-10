-- Symbol Normalization Database Migration
-- This migration ensures symbols are stored with normalized keys for case-insensitive matching
-- EUR/USD, eurusd, EURUSD, Eurusd will all match the same entry

-- Step 1: Check if normalized_name column exists, if not add it
ALTER TABLE symbols ADD COLUMN IF NOT EXISTS normalized_name TEXT;

-- Step 2: Create unique index on normalized_name (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_symbols_normalized_name ON symbols(normalized_name);

-- Step 3: Populate normalized_name for existing symbols
-- This normalizes by: removing special chars, converting to uppercase
UPDATE symbols 
SET normalized_name = UPPER(
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    name, '/', ''), '-', ''), '^', ''), ' ', ''), '.', '')
)
WHERE normalized_name IS NULL OR normalized_name = '';

-- Step 4: Verify all symbols have normalized_name
SELECT COUNT(*) as symbols_without_normalized_name 
FROM symbols 
WHERE normalized_name IS NULL OR normalized_name = '';

-- Step 5: Create RLS policy for symbols table (if not exists)
-- Symbols are shared across all users, but only authenticated users can create new ones
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;

-- Policy for viewing symbols (anyone)
CREATE POLICY "Anyone can view symbols" ON symbols
  FOR SELECT USING (true);

-- Policy for creating symbols (authenticated users only)
CREATE POLICY "Authenticated users can create symbols" ON symbols
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating symbols (authenticated users who created them or admins)
CREATE POLICY "Users can update symbols they created" ON symbols
  FOR UPDATE USING (
    auth.uid() = created_by_user_id OR 
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true')
  );

-- Step 6: Add created_by_user_id column if not exists (optional, for tracking)
ALTER TABLE symbols ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 7: Create sample data (if table is empty)
INSERT INTO symbols (name, normalized_name, category, is_active)
SELECT * FROM (VALUES
  -- FOREX
  ('EUR/USD', 'EURUSD', 'FOREX', true),
  ('GBP/USD', 'GBPUSD', 'FOREX', true),
  ('USD/JPY', 'USDJPY', 'FOREX', true),
  ('USD/CHF', 'USDCHF', 'FOREX', true),
  ('AUD/USD', 'AUDUSD', 'FOREX', true),
  ('USD/CAD', 'USDCAD', 'FOREX', true),
  ('NZD/USD', 'NZDUSD', 'FOREX', true),
  ('EUR/GBP', 'EURGBP', 'FOREX', true),
  ('EUR/JPY', 'EURJPY', 'FOREX', true),
  -- METALS
  ('XAU/USD', 'XAUUSD', 'METALS', true),
  ('XAG/USD', 'XAGUSD', 'METALS', true),
  ('XPT/USD', 'XPTUSD', 'METALS', true),
  ('XPD/USD', 'XPDUSD', 'METALS', true),
  -- COMMODITIES
  ('WTI/USD', 'WTIUSD', 'COMMODITIES', true),
  ('BRENT/USD', 'BRENTUSD', 'COMMODITIES', true),
  ('GAS/USD', 'GASUSD', 'COMMODITIES', true),
  ('CORN/USD', 'CORNUSD', 'COMMODITIES', true),
  ('SOYBEAN/USD', 'SOYBEANSUSD', 'COMMODITIES', true),
  ('WHEAT/USD', 'WHEATUSD', 'COMMODITIES', true),
  ('SUGAR/USD', 'SUGARUSD', 'COMMODITIES', true),
  ('COFFEE/USD', 'COFFEEUSD', 'COMMODITIES', true),
  ('COCOA/USD', 'COCOAUSD', 'COMMODITIES', true),
  -- INDICES
  ('SPX500', 'SPX500', 'INDICES', true),
  ('NASDAQ100', 'NASDAQ100', 'INDICES', true),
  ('DJIA30', 'DJIA30', 'INDICES', true),
  ('DAX', 'DAX', 'INDICES', true),
  ('FTSE100', 'FTSE100', 'INDICES', true),
  ('CAC40', 'CAC40', 'INDICES', true),
  ('ASX200', 'ASX200', 'INDICES', true),
  ('HANGSENG', 'HANGSENG', 'INDICES', true),
  ('NIKKEI225', 'NIKKEI225', 'INDICES', true),
  ('VIX', 'VIX', 'INDICES', true),
  -- FUTURES
  ('ES', 'ES', 'FUTURES', true),
  ('NQ', 'NQ', 'FUTURES', true),
  ('YM', 'YM', 'FUTURES', true),
  ('RTY', 'RTY', 'FUTURES', true),
  ('GC', 'GC', 'FUTURES', true),
  ('SI', 'SI', 'FUTURES', true),
  ('CL', 'CL', 'FUTURES', true),
  ('NG', 'NG', 'FUTURES', true),
  ('ZC', 'ZC', 'FUTURES', true),
  ('ZW', 'ZW', 'FUTURES', true),
  ('ZS', 'ZS', 'FUTURES', true),
  -- CRYPTO
  ('BTC/USD', 'BTCUSD', 'CRYPTO', true),
  ('ETH/USD', 'ETHUSD', 'CRYPTO', true),
  ('XRP/USD', 'XRPUSD', 'CRYPTO', true),
  ('LTC/USD', 'LTCUSD', 'CRYPTO', true)
) as new_symbols(name, normalized_name, category, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM symbols WHERE normalized_name = new_symbols.normalized_name
)
ON CONFLICT (normalized_name) DO NOTHING;

-- Step 8: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_symbols_category ON symbols(category) WHERE is_active = true;

-- Verification queries
SELECT 'Total symbols' as check_type, COUNT(*) as count FROM symbols;
SELECT 'Symbols without normalized_name' as check_type, COUNT(*) as count FROM symbols WHERE normalized_name IS NULL;
SELECT 'Duplicate normalized names' as check_type, COUNT(*) as count FROM (
  SELECT normalized_name FROM symbols GROUP BY normalized_name HAVING COUNT(*) > 1
) as dupes;

-- Test normalization with sample queries
-- These should all return the same row:
-- SELECT * FROM symbols WHERE normalized_name = 'EURUSD';
-- SELECT * FROM symbols WHERE name = 'EUR/USD';
