-- ============================================================================
-- MIGRATIONS FOR TRADING JOURNAL DATABASE
-- Apply these migrations if you have an existing database
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Add description column to setups table
-- ============================================================================
ALTER TABLE setups ADD COLUMN IF NOT EXISTS description TEXT;

-- Add screenshot_urls if missing
ALTER TABLE journals ADD COLUMN IF NOT EXISTS screenshot_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add entry_price and exit_price if missing
ALTER TABLE journals ADD COLUMN IF NOT EXISTS entry_price DECIMAL(20, 8);
ALTER TABLE journals ADD COLUMN IF NOT EXISTS exit_price DECIMAL(20, 8);

-- ============================================================================
-- 2. USEFUL STORED PROCEDURES
-- ============================================================================

-- Get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_trades BIGINT,
  winning_trades BIGINT,
  losing_trades BIGINT,
  win_rate NUMERIC,
  total_pnl DECIMAL,
  avg_trade_size DECIMAL,
  best_trade DECIMAL,
  worst_trade DECIMAL
) AS $$
SELECT
  COUNT(*) as total_trades,
  COUNT(CASE WHEN win = TRUE THEN 1 END) as winning_trades,
  COUNT(CASE WHEN win = FALSE THEN 1 END) as losing_trades,
  ROUND(100.0 * COUNT(CASE WHEN win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(realized_amount), 0) as total_pnl,
  COALESCE(AVG(ABS(realized_amount)), 0) as avg_trade_size,
  COALESCE(MAX(realized_amount), 0) as best_trade,
  COALESCE(MIN(realized_amount), 0) as worst_trade
FROM journals
WHERE user_id = user_uuid;
$$ LANGUAGE SQL;

-- Get monthly performance
CREATE OR REPLACE FUNCTION get_monthly_performance(user_uuid UUID)
RETURNS TABLE (
  month DATE,
  trades_count BIGINT,
  win_rate NUMERIC,
  total_pnl DECIMAL,
  winning_trades BIGINT,
  losing_trades BIGINT
) AS $$
SELECT
  DATE_TRUNC('month', created_at)::DATE as month,
  COUNT(*) as trades_count,
  ROUND(100.0 * COUNT(CASE WHEN win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(realized_amount), 0) as total_pnl,
  COUNT(CASE WHEN win = TRUE THEN 1 END) as winning_trades,
  COUNT(CASE WHEN win = FALSE THEN 1 END) as losing_trades
FROM journals
WHERE user_id = user_uuid
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
$$ LANGUAGE SQL;

-- Get best performing symbols
CREATE OR REPLACE FUNCTION get_best_symbols(user_uuid UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  symbol VARCHAR,
  trades BIGINT,
  win_rate NUMERIC,
  total_pnl DECIMAL
) AS $$
SELECT
  j.symbol,
  COUNT(*) as trades,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_pnl
FROM journals j
WHERE j.user_id = user_uuid
GROUP BY j.symbol
ORDER BY total_pnl DESC
LIMIT limit_count;
$$ LANGUAGE SQL;

-- Get best performing setups
CREATE OR REPLACE FUNCTION get_best_setups(user_uuid UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  setup VARCHAR,
  trades BIGINT,
  win_rate NUMERIC,
  total_pnl DECIMAL
) AS $$
SELECT
  j.setup,
  COUNT(*) as trades,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_pnl
FROM journals j
WHERE j.user_id = user_uuid AND j.setup IS NOT NULL
GROUP BY j.setup
ORDER BY total_pnl DESC
LIMIT limit_count;
$$ LANGUAGE SQL;

-- ============================================================================
-- 3. HELPER VIEWS
-- ============================================================================

-- Recent trades with all details
CREATE OR REPLACE VIEW recent_trades AS
SELECT
  j.id,
  j.symbol,
  j.direction,
  j.setup,
  j.entry_at,
  j.exit_at,
  j.duration_minutes,
  j.result,
  j.realized_amount,
  j.realized_points,
  j.win,
  j.setup_rating,
  ta.name as account_name,
  j.created_at
FROM journals j
LEFT JOIN trading_accounts ta ON j.account_id = ta.id
ORDER BY j.created_at DESC;

-- Trades needing analysis (losses without loss_reason)
CREATE OR REPLACE VIEW trades_needing_analysis AS
SELECT
  j.id,
  j.symbol,
  j.setup,
  j.result,
  j.realized_amount,
  j.created_at
FROM journals j
WHERE j.win = FALSE AND j.loss_reason IS NULL
ORDER BY j.created_at DESC;

-- This week's performance
CREATE OR REPLACE VIEW weekly_performance AS
SELECT
  DATE_TRUNC('week', j.created_at)::DATE as week_start,
  COUNT(*) as trades,
  COUNT(CASE WHEN j.win = TRUE THEN 1 END) as wins,
  COUNT(CASE WHEN j.win = FALSE THEN 1 END) as losses,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_pnl
FROM journals j
GROUP BY DATE_TRUNC('week', j.created_at)
ORDER BY week_start DESC;

-- Best and worst trading days
CREATE OR REPLACE VIEW daily_performance AS
SELECT
  DATE(j.created_at) as trade_date,
  COUNT(*) as trades,
  COUNT(CASE WHEN j.win = TRUE THEN 1 END) as wins,
  COUNT(CASE WHEN j.win = FALSE THEN 1 END) as losses,
  ROUND(100.0 * COUNT(CASE WHEN j.win = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  COALESCE(SUM(j.realized_amount), 0) as total_pnl,
  MAX(j.realized_amount) as best_trade,
  MIN(j.realized_amount) as worst_trade
FROM journals j
GROUP BY DATE(j.created_at)
ORDER BY trade_date DESC;

-- ============================================================================
-- 4. DATA CLEANUP PROCEDURES
-- ============================================================================

-- Remove duplicate setups (keeps oldest)
CREATE OR REPLACE FUNCTION remove_duplicate_setups(user_uuid UUID)
RETURNS VOID AS $$
DELETE FROM setups s1
WHERE s1.user_id = user_uuid
AND s1.id NOT IN (
  SELECT MIN(id)
  FROM setups s2
  WHERE s2.user_id = user_uuid
  GROUP BY LOWER(s2.name)
);
$$ LANGUAGE SQL;

-- Remove duplicate symbols
CREATE OR REPLACE FUNCTION remove_duplicate_symbols(user_uuid UUID)
RETURNS VOID AS $$
DELETE FROM symbols s1
WHERE s1.user_id = user_uuid
AND s1.id NOT IN (
  SELECT MIN(id)
  FROM symbols s2
  WHERE s2.user_id = user_uuid
  GROUP BY LOWER(s2.name)
);
$$ LANGUAGE SQL;

-- ============================================================================
-- 5. MAINTENANCE PROCEDURES
-- ============================================================================

-- Vacuum and analyze tables for better query performance
CREATE OR REPLACE FUNCTION maintain_database()
RETURNS VOID AS $$
BEGIN
  VACUUM ANALYZE symbols;
  VACUUM ANALYZE setups;
  VACUUM ANALYZE trading_accounts;
  VACUUM ANALYZE journals;
  VACUUM ANALYZE loss_reasons;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample setups
INSERT INTO setups (user_id, name, description) VALUES
  (auth.uid(), 'Breakout', 'Price breaks above resistance with volume confirmation. Best in London/NY sessions.'),
  (auth.uid(), 'Pullback', 'Wait for pullback to support and bounce. Use 4H or daily timeframe.'),
  (auth.uid(), 'Mean Reversion', 'Trade extreme moves back to average. Works best in ranging markets.'),
  (auth.uid(), 'Trend Following', 'Follow the trend with higher lows/highs. Use on trending days.'),
  (auth.uid(), 'Support Resistance', 'Trade bounces off key levels. Combine with volume analysis.')
ON CONFLICT DO NOTHING;

-- Insert sample symbols (comment out if not needed)
-- INSERT INTO symbols (user_id, name, normalized_name) VALUES
--   (auth.uid(), 'EUR/USD', 'EURUSD'),
--   (auth.uid(), 'GBP/USD', 'GBPUSD'),
--   (auth.uid(), 'USD/JPY', 'USDJPY'),
--   (auth.uid(), 'AUD/USD', 'AUDUSD'),
--   (auth.uid(), 'BTC/USD', 'BTCUSD')
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. PERMISSION GRANTS (for service role if needed)
-- ============================================================================

-- Grant permissions to authenticated users (already handled by RLS)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON journals TO authenticated;
-- GRANT SELECT ON trading_stats TO authenticated;
-- GRANT SELECT ON symbol_stats TO authenticated;
-- GRANT SELECT ON setup_stats TO authenticated;

-- ============================================================================
-- 8. MIGRATION: Add new columns to existing table
-- ============================================================================

-- Example: If you need to add a confidence_level column
-- ALTER TABLE journals 
-- ADD COLUMN IF NOT EXISTS confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10);

-- Example: If you need to add a R_R_ratio column (Risk Reward Ratio)
-- ALTER TABLE journals 
-- ADD COLUMN IF NOT EXISTS rr_ratio DECIMAL(10, 2);

-- ============================================================================
-- 9. USEFUL QUERIES FOR ANALYSIS
-- ============================================================================

-- Get consecutive wins
-- SELECT 
--   j.id, j.symbol, j.created_at, j.realized_amount,
--   COUNT(*) OVER (ORDER BY j.created_at) - ROW_NUMBER() OVER (ORDER BY j.created_at) as streak
-- FROM journals j
-- WHERE j.user_id = auth.uid() AND j.win = TRUE
-- ORDER BY j.created_at DESC;

-- Get max drawdown
-- WITH cumulative_pnl AS (
--   SELECT 
--     j.created_at,
--     SUM(j.realized_amount) OVER (ORDER BY j.created_at) as running_total,
--     MAX(SUM(j.realized_amount)) OVER (ORDER BY j.created_at) as max_so_far
--   FROM journals j
--   WHERE j.user_id = auth.uid()
-- )
-- SELECT 
--   MAX(max_so_far - running_total) as max_drawdown
-- FROM cumulative_pnl;

-- Get Profit Factor (sum of wins / sum of losses)
-- SELECT
--   COALESCE(SUM(CASE WHEN j.win = TRUE THEN j.realized_amount ELSE 0 END) / 
--   NULLIF(ABS(SUM(CASE WHEN j.win = FALSE THEN j.realized_amount ELSE 0 END)), 0), 0) as profit_factor
-- FROM journals j
-- WHERE j.user_id = auth.uid();
