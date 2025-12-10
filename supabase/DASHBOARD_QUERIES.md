# Dashboard Query Reference

Quick reference for common dashboard queries based on the fresh schema.

## 1. Overview Stats (Last 30 Days)

```sql
SELECT 
  COUNT(*) as total_trades,
  COUNT(CASE WHEN win THEN 1 END) as winning_trades,
  COUNT(CASE WHEN win = false THEN 1 END) as losing_trades,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  MAX(realized_amount) as best_trade,
  MIN(realized_amount) as worst_trade,
  AVG(CASE WHEN realized_amount > 0 THEN realized_amount END) as avg_win,
  AVG(CASE WHEN realized_amount < 0 THEN realized_amount END) as avg_loss,
  ROUND(SUM(CASE WHEN realized_amount > 0 THEN realized_amount END) / 
        NULLIF(ABS(SUM(CASE WHEN realized_amount < 0 THEN realized_amount END)), 0), 2) as profit_factor
FROM journals
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '30 days';
```

## 2. All Time Stats

```sql
SELECT 
  COUNT(*) as total_trades,
  COUNT(CASE WHEN win THEN 1 END) as winning_trades,
  COUNT(CASE WHEN win = false THEN 1 END) as losing_trades,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / NULLIF(COUNT(*), 0), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  MAX(realized_amount) as best_trade,
  MIN(realized_amount) as worst_trade
FROM journals
WHERE user_id = $1;
```

## 3. Monthly P&L Breakdown

```sql
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as month,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as pnl,
  ROUND(100.0 * SUM(realized_amount) / NULLIF(
    (SELECT SUM(realized_amount) FROM journals WHERE user_id = $1), 0), 2) as pnl_percentage
FROM journals
WHERE user_id = $1
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC
LIMIT 12;
```

## 4. Daily P&L Breakdown

```sql
SELECT 
  DATE(created_at) as trading_date,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  COUNT(CASE WHEN win = false THEN 1 END) as losses,
  SUM(realized_amount) as pnl,
  MAX(realized_amount) as best_trade,
  MIN(realized_amount) as worst_trade
FROM journals
WHERE user_id = $1
GROUP BY DATE(created_at)
ORDER BY trading_date DESC
LIMIT 30;
```

## 5. Session Breakdown

```sql
SELECT 
  session,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl,
  MAX(realized_amount) as best_trade,
  MIN(realized_amount) as worst_trade
FROM journals
WHERE user_id = $1
GROUP BY session
ORDER BY COUNT(*) DESC;
```

## 6. Setup Analysis

```sql
SELECT 
  setup,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl,
  MAX(realized_amount) as best_trade,
  MIN(realized_amount) as worst_trade
FROM journals
WHERE user_id = $1
GROUP BY setup
ORDER BY SUM(realized_amount) DESC;
```

## 7. Symbol Analysis

```sql
SELECT 
  symbol,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY symbol
ORDER BY COUNT(*) DESC;
```

## 8. Direction Breakdown (Buy vs Sell)

```sql
SELECT 
  direction,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY direction;
```

## 9. Result Type Distribution

```sql
SELECT 
  result,
  COUNT(*) as count,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  SUM(realized_amount) as pnl
FROM journals
WHERE user_id = $1
GROUP BY result;
```

## 10. Account Performance

```sql
SELECT 
  a.name as account_name,
  a.provider,
  COUNT(j.id) as trades,
  COUNT(CASE WHEN j.win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN j.win THEN 1 END) / NULLIF(COUNT(j.id), 0), 2) as win_rate,
  SUM(j.realized_amount) as total_pnl,
  AVG(j.realized_amount) as avg_pnl
FROM trading_accounts a
LEFT JOIN journals j ON a.id = j.account_id
WHERE a.user_id = $1
GROUP BY a.id, a.name, a.provider
ORDER BY COUNT(j.id) DESC;
```

## 11. Execution Type Distribution

```sql
SELECT 
  execution_type,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY execution_type;
```

## 12. Rule Following Impact

```sql
SELECT 
  rule_followed,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY rule_followed
ORDER BY rule_followed DESC;
```

## 13. Setup Rating Performance

```sql
SELECT 
  setup_rating,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY setup_rating
ORDER BY setup_rating;
```

## 14. Trade Duration Analysis

```sql
SELECT 
  CASE 
    WHEN duration_minutes IS NULL THEN 'Unknown'
    WHEN duration_minutes < 15 THEN '< 15 min'
    WHEN duration_minutes < 60 THEN '15-60 min'
    WHEN duration_minutes < 240 THEN '1-4 hours'
    WHEN duration_minutes < 1440 THEN '4 hours - 1 day'
    ELSE '> 1 day'
  END as duration_bucket,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY duration_bucket
ORDER BY 
  CASE 
    WHEN duration_bucket = '< 15 min' THEN 1
    WHEN duration_bucket = '15-60 min' THEN 2
    WHEN duration_bucket = '1-4 hours' THEN 3
    WHEN duration_bucket = '4 hours - 1 day' THEN 4
    WHEN duration_bucket = '> 1 day' THEN 5
    ELSE 6
  END;
```

## 15. Recent Trades (Last 10)

```sql
SELECT 
  id,
  symbol,
  direction,
  entry_price,
  target_price,
  stop_loss_price,
  result,
  realized_amount,
  realized_points,
  win,
  created_at
FROM journals
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10;
```

## 16. Consecutive Wins/Losses

```sql
WITH ranked_trades AS (
  SELECT 
    win,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) - 
      ROW_NUMBER() OVER (PARTITION BY win ORDER BY created_at) as streak_group
  FROM journals
  WHERE user_id = $1
  ORDER BY created_at
)
SELECT 
  CASE WHEN win THEN 'Win' ELSE 'Loss' END as streak_type,
  COUNT(*) as streak_length
FROM ranked_trades
GROUP BY streak_group, win
ORDER BY streak_length DESC
LIMIT 1;
```

## 17. Profitable Days vs Losing Days

```sql
SELECT 
  DATE(created_at) as trading_date,
  CASE 
    WHEN SUM(realized_amount) > 0 THEN 'Profitable'
    WHEN SUM(realized_amount) < 0 THEN 'Loss'
    ELSE 'Breakeven'
  END as day_result,
  COUNT(*) as trades
FROM journals
WHERE user_id = $1
GROUP BY DATE(created_at)
ORDER BY trading_date DESC;
```

## 18. Best Performing Setup + Session Combo

```sql
SELECT 
  setup,
  session,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl,
  AVG(realized_amount) as avg_pnl
FROM journals
WHERE user_id = $1
GROUP BY setup, session
HAVING COUNT(*) >= 5  -- At least 5 trades
ORDER BY SUM(realized_amount) DESC
LIMIT 10;
```

## 19. Point Distribution (Risk vs Reward)

```sql
SELECT 
  ROUND(AVG(stop_loss_points), 1) as avg_stop_loss_pts,
  ROUND(AVG(target_points), 1) as avg_target_pts,
  ROUND(AVG(target_points) / NULLIF(AVG(stop_loss_points), 0), 2) as avg_reward_risk_ratio,
  COUNT(*) as trades
FROM journals
WHERE user_id = $1
  AND stop_loss_points IS NOT NULL
  AND target_points IS NOT NULL;
```

## 20. Money Management Efficiency

```sql
SELECT 
  ROUND(AVG(risk_amount), 2) as avg_risk_amt,
  ROUND(AVG(profit_target), 2) as avg_profit_target,
  ROUND(AVG(profit_target) / NULLIF(AVG(risk_amount), 0), 2) as avg_reward_risk_ratio,
  ROUND(SUM(realized_amount), 2) as total_realized,
  COUNT(*) as trades
FROM journals
WHERE user_id = $1
  AND risk_amount IS NOT NULL
  AND profit_target IS NOT NULL;
```

## Notes

- Replace `$1` with actual `user_id` value
- For account-specific queries, add: `AND account_id = $2`
- All percentages calculated as 0-100 range
- Profit factor = Total Wins / |Total Losses|
- Win rate = Winning Trades / Total Trades

## Performance Tips

1. Always filter by `user_id` for security and speed
2. Use `performance_metrics` table for dashboard overview
3. Use indexes on: user_id, created_at, symbol, result, win
4. Consider materialized views for complex queries
5. For very large datasets, query by date range to avoid timeout
