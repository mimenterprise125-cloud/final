-- Trading Journal Database Schema
-- This schema supports a complete trading journal management system with setups, accounts, symbols, and trade logging

-- ============================================================================
-- 1. SYMBOLS TABLE - Store trading symbols/pairs
-- ============================================================================
CREATE TABLE IF NOT EXISTS symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL UNIQUE,
  normalized_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symbols_user_id ON symbols(user_id);
CREATE INDEX idx_symbols_name ON symbols(name);
CREATE INDEX idx_symbols_normalized_name ON symbols(normalized_name);

-- ============================================================================
-- 2. SETUPS TABLE - Store trading setup patterns with descriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_setup_name UNIQUE(user_id, name)
);

CREATE INDEX idx_setups_user_id ON setups(user_id);
CREATE INDEX idx_setups_name ON setups(name);

-- ============================================================================
-- 3. TRADING_ACCOUNTS TABLE - Store user's trading accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  account_identifier VARCHAR(100),
  broker VARCHAR(100),
  account_type VARCHAR(50), -- Demo, Live, Funded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trading_accounts_user_id ON trading_accounts(user_id);

-- ============================================================================
-- 4. JOURNALS TABLE - Main trade logging table
-- ============================================================================
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES trading_accounts(id) ON DELETE SET NULL,
  
  -- Trade identification
  title VARCHAR(255),
  symbol VARCHAR(50) NOT NULL,
  
  -- Trade timing
  entry_at TIMESTAMP WITH TIME ZONE,
  exit_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  
  -- Trade direction & type
  direction VARCHAR(10) NOT NULL DEFAULT 'Buy', -- Buy, Sell
  session VARCHAR(50), -- London, NY, Asia, Custom
  setup VARCHAR(100), -- Reference to setup name
  setup_rating VARCHAR(10), -- B, B+, A-, A, A+
  execution_type VARCHAR(50), -- Market, Limit, Stop
  
  -- Entry & Exit prices
  stop_loss_price DECIMAL(20, 8),
  stop_loss_points DECIMAL(20, 8),
  target_price DECIMAL(20, 8),
  target_points DECIMAL(20, 8),
  entry_price DECIMAL(20, 8),
  exit_price DECIMAL(20, 8),
  
  -- Trade result
  result VARCHAR(50) NOT NULL DEFAULT 'TP', -- TP (Take Profit), SL (Stop Loss), BREAKEVEN, MANUAL
  realized_amount DECIMAL(20, 8),
  realized_points DECIMAL(20, 8),
  win BOOLEAN DEFAULT FALSE,
  
  -- Trade quality metrics
  rule_followed BOOLEAN DEFAULT FALSE,
  confirmation BOOLEAN DEFAULT FALSE,
  loss_reason VARCHAR(255),
  
  -- Notes & media
  notes TEXT,
  screenshot_urls TEXT[], -- Array of image URLs
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journals_user_id ON journals(user_id);
CREATE INDEX idx_journals_account_id ON journals(account_id);
CREATE INDEX idx_journals_symbol ON journals(symbol);
CREATE INDEX idx_journals_created_at ON journals(created_at DESC);
CREATE INDEX idx_journals_direction ON journals(direction);
CREATE INDEX idx_journals_result ON journals(result);
CREATE INDEX idx_journals_win ON journals(win);

-- ============================================================================
-- 5. LOSS_REASONS TABLE - Predefined loss reasons for categorization
-- ============================================================================
CREATE TABLE IF NOT EXISTS loss_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_reason UNIQUE(user_id, reason)
);

CREATE INDEX idx_loss_reasons_user_id ON loss_reasons(user_id);

-- ============================================================================
-- 6. TRADING_STATS VIEW - Aggregate statistics for dashboard
-- ============================================================================
CREATE VIEW IF NOT EXISTS trading_stats AS
SELECT 
  j.user_id,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN j.win = TRUE THEN 1 END) as winning_trades,
  COUNT(CASE WHEN j.win = FALSE THEN 1 END) as losing_trades,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_realized_amount,
  COALESCE(SUM(j.realized_points), 0) as total_realized_points,
  COALESCE(AVG(CASE WHEN j.win = TRUE THEN j.realized_amount END), 0) as avg_winning_amount,
  COALESCE(AVG(CASE WHEN j.win = FALSE THEN j.realized_amount END), 0) as avg_losing_amount,
  COALESCE(MAX(j.realized_amount), 0) as largest_win,
  COALESCE(MIN(j.realized_amount), 0) as largest_loss
FROM journals j
GROUP BY j.user_id;

-- ============================================================================
-- 7. SYMBOL_STATS VIEW - Per-symbol statistics
-- ============================================================================
CREATE VIEW IF NOT EXISTS symbol_stats AS
SELECT 
  j.user_id,
  j.symbol,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN j.win = TRUE THEN 1 END) as winning_trades,
  COUNT(CASE WHEN j.win = FALSE THEN 1 END) as losing_trades,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_pnl,
  COALESCE(AVG(j.realized_amount), 0) as avg_pnl
FROM journals j
GROUP BY j.user_id, j.symbol;

-- ============================================================================
-- 8. SETUP_STATS VIEW - Per-setup statistics
-- ============================================================================
CREATE VIEW IF NOT EXISTS setup_stats AS
SELECT 
  j.user_id,
  j.setup,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN j.win = TRUE THEN 1 END) as winning_trades,
  COUNT(CASE WHEN j.win = FALSE THEN 1 END) as losing_trades,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_pnl,
  COALESCE(AVG(j.realized_amount), 0) as avg_pnl
FROM journals j
GROUP BY j.user_id, j.setup;

-- ============================================================================
-- 9. RLS POLICIES - Row Level Security
-- ============================================================================

-- Enable RLS
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons ENABLE ROW LEVEL SECURITY;

-- Symbols policies
CREATE POLICY "Users can view their own symbols" ON symbols
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create symbols" ON symbols
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their symbols" ON symbols
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their symbols" ON symbols
  FOR DELETE USING (auth.uid() = user_id);

-- Setups policies
CREATE POLICY "Users can view their own setups" ON setups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create setups" ON setups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their setups" ON setups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their setups" ON setups
  FOR DELETE USING (auth.uid() = user_id);

-- Trading accounts policies
CREATE POLICY "Users can view their own accounts" ON trading_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create accounts" ON trading_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their accounts" ON trading_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their accounts" ON trading_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Journals policies
CREATE POLICY "Users can view their own journals" ON journals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create journals" ON journals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their journals" ON journals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their journals" ON journals
  FOR DELETE USING (auth.uid() = user_id);

-- Loss reasons policies
CREATE POLICY "Users can view their own loss reasons" ON loss_reasons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create loss reasons" ON loss_reasons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their loss reasons" ON loss_reasons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their loss reasons" ON loss_reasons
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 10. TRIGGERS - Automatic timestamp updates
-- ============================================================================

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Symbols updated_at trigger
CREATE TRIGGER symbols_updated_at BEFORE UPDATE ON symbols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Setups updated_at trigger
CREATE TRIGGER setups_updated_at BEFORE UPDATE ON setups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trading accounts updated_at trigger
CREATE TRIGGER trading_accounts_updated_at BEFORE UPDATE ON trading_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Journals updated_at trigger
CREATE TRIGGER journals_updated_at BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. COMMENTS - Documentation
-- ============================================================================

COMMENT ON TABLE symbols IS 'Stores trading symbols/pairs (EUR/USD, BTC/USD, etc.)';
COMMENT ON TABLE setups IS 'Stores trading setup patterns with names and descriptions';
COMMENT ON TABLE trading_accounts IS 'Stores user trading accounts across different brokers';
COMMENT ON TABLE journals IS 'Main table for logging individual trades';
COMMENT ON TABLE loss_reasons IS 'Predefined or custom loss reasons for analysis';

COMMENT ON COLUMN journals.realized_amount IS 'Profit/loss amount in account currency';
COMMENT ON COLUMN journals.realized_points IS 'Profit/loss in points/pips';
COMMENT ON COLUMN journals.duration_minutes IS 'Trade duration in minutes';
COMMENT ON COLUMN journals.win IS 'TRUE if trade was profitable, FALSE if loss';
