-- ============================================================================
-- SYMBOLS TABLE WITH SHARED & PRIVATE SEPARATION
-- ============================================================================
-- This approach separates shared symbols from user-specific custom symbols
-- Users see: Pre-defined symbols (everyone) + their own custom symbols

-- ============================================================================
-- STEP 1: Add 'is_global' Column to Symbols Table
-- ============================================================================
-- This distinguishes between pre-defined (global) and custom (user) symbols

ALTER TABLE symbols ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT false;

-- ============================================================================
-- STEP 2: RLS Policy - Everyone Sees Global, Only Own Custom
-- ============================================================================

DROP POLICY IF EXISTS "symbols_select" ON symbols;
DROP POLICY IF EXISTS "symbols_select_all" ON symbols;

-- New policy: see global symbols OR your own custom symbols
CREATE POLICY "symbols_select_shared_or_own" ON symbols FOR SELECT
  USING (
    is_global = true  -- Everyone sees global/pre-defined symbols
    OR
    user_id = auth.uid()  -- Or your own custom symbols
  );

-- Insert: only for custom symbols (user-owned)
DROP POLICY IF EXISTS "symbols_insert" ON symbols;
CREATE POLICY "symbols_insert_custom" ON symbols FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_global = false);

-- Delete: only your own custom symbols
DROP POLICY IF EXISTS "symbols_delete" ON symbols;
CREATE POLICY "symbols_delete_custom" ON symbols FOR DELETE
  USING (user_id = auth.uid() AND is_global = false);

-- ============================================================================
-- STEP 3: Insert Pre-Defined Symbols (Run Once)
-- ============================================================================
-- These are your global symbols that everyone sees

INSERT INTO symbols (id, name, normalized_name, user_id, is_global, created_at)
VALUES
  -- Forex
  (gen_random_uuid(), 'EUR/USD', 'EURUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/USD', 'GBPUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'USD/JPY', 'USDJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'USD/CHF', 'USDCHF', NULL, true, NOW()),
  (gen_random_uuid(), 'AUD/USD', 'AUDUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'USD/CAD', 'USDCAD', NULL, true, NOW()),
  (gen_random_uuid(), 'NZD/USD', 'NZDUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/GBP', 'EURGBP', NULL, true, NOW()),
  (gen_random_uuid(), 'EUR/JPY', 'EURJPY', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/JPY', 'GBPJPY', NULL, true, NOW()),
  
  -- Stocks (examples)
  (gen_random_uuid(), 'AAPL', 'AAPL', NULL, true, NOW()),
  (gen_random_uuid(), 'MSFT', 'MSFT', NULL, true, NOW()),
  (gen_random_uuid(), 'GOOGL', 'GOOGL', NULL, true, NOW()),
  (gen_random_uuid(), 'AMZN', 'AMZN', NULL, true, NOW()),
  (gen_random_uuid(), 'TSLA', 'TSLA', NULL, true, NOW()),
  
  -- Crypto (examples)
  (gen_random_uuid(), 'BTC/USD', 'BTCUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'ETH/USD', 'ETHUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'BNB/USD', 'BNBUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'XRP/USD', 'XRPUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'SOL/USD', 'SOLUSD', NULL, true, NOW())
ON CONFLICT (normalized_name, user_id) DO NOTHING;

-- ============================================================================
-- STEP 4: Query Examples
-- ============================================================================

-- See all symbols available to current user (global + their custom ones):
/*
SELECT name, is_global, user_id
FROM symbols
WHERE is_global = true 
  OR user_id = auth.uid()
ORDER BY is_global DESC, name ASC;
*/

-- See only global symbols (available to everyone):
/*
SELECT name
FROM symbols
WHERE is_global = true
ORDER BY name;
*/

-- See only your custom symbols:
/*
SELECT name
FROM symbols
WHERE user_id = auth.uid() AND is_global = false
ORDER BY name;
*/

-- Add a custom symbol (only you see it):
/*
INSERT INTO symbols (name, normalized_name, user_id, is_global)
VALUES ('CUSTOM_SYMBOL', 'CUSTOMSYMBOL', auth.uid(), false);
*/
