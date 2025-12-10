# Complete Database Schema Setup Guide

## Overview

This guide walks you through setting up the complete trading journal database schema with all tables needed for dashboards, performance tracking, and analytics.

## Table Structure

### Core Tables (Required)

1. **trading_accounts** - User's trading accounts/brokers
2. **journals** - Main journal entries (trades)
3. **setups** - User-defined trading setups
4. **symbols** - Favorite/traded symbols

### Supporting Tables

5. **trades** - Imported trades from broker (optional)
6. **copy_rules** - Copy trading rules (optional)
7. **trading_goals** - User's trading goals

### Performance/Analytics Tables

8. **performance_metrics** - Pre-calculated performance statistics
9. **monthly_performance** - Monthly P&L breakdown
10. **daily_performance** - Daily P&L tracking

## Setup Instructions

### Step 1: Access Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**

### Step 2: Create All Tables

1. Click **+ New Query**
2. Copy entire contents of `supabase/COMPLETE_FRESH_SCHEMA.sql`
3. Paste into SQL editor
4. Click **Run** button
5. Wait for success - should see "Rows affected: 0"

### Step 3: Verify All Tables

Run this verification query:

```sql
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see 10 tables:
- ✅ copy_rules
- ✅ daily_performance
- ✅ journals
- ✅ monthly_performance
- ✅ performance_metrics
- ✅ setups
- ✅ symbols
- ✅ trades
- ✅ trading_accounts
- ✅ trading_goals

## Table Descriptions

### 1. TRADING_ACCOUNTS
Stores user's trading accounts (brokers, strategies, etc.)

```
id: UUID (primary key)
user_id: UUID (foreign key to auth.users)
provider: text (MetaTrader5, FTX, Bybit, etc.)
account_identifier: text (account number/login)
name: text (user-friendly name)
balance: numeric (current balance)
currency: text (USD, EUR, etc.)
metadata: jsonb (additional data)
created_at, updated_at: timestamps
```

### 2. JOURNALS (Main Table)
Core trading journal entries with P&L tracking

```
id: UUID
user_id: UUID (foreign key)
account_id: UUID (optional account reference)
symbol: text (EUR/USD, AAPL, etc.)
direction: text (Buy/Sell)
result: text (TP/SL/BREAKEVEN/MANUAL)
entry_price: numeric (where you entered) *REQUIRED
stop_loss_price: numeric (SL price level)
target_price: numeric (TP price level)
stop_loss_points: numeric (auto-calculated)
target_points: numeric (auto-calculated)
risk_amount: numeric ($ at risk)
profit_target: numeric ($ to profit)
realized_amount: numeric (actual P&L in $$)
realized_points: numeric (actual P&L in pts)
win: boolean (profitable?)
rule_followed: boolean
confirmation: boolean
session: text
setup: text
setup_rating: text
execution_type: text
notes: text
screenshot_urls: text[] (array of image URLs)
created_at, updated_at: timestamps
```

**Key P&L Logic:**
- If result = 'TP': `realized_amount = profit_target`
- If result = 'SL': `realized_amount = -risk_amount`
- If result = 'BREAKEVEN': `realized_amount = 0`
- If result = 'MANUAL': `realized_amount = manual_entry`

### 3. SETUPS
User-defined trading setups

```
id: UUID
user_id: UUID (foreign key)
name: text (e.g., "Breakout Setup")
description: text
tags: text[]
rules: jsonb (trade rules)
parameters: jsonb (setup parameters)
created_at, updated_at: timestamps
```

### 4. SYMBOLS
Favorite/traded symbols

```
id: UUID
name: text (display: EUR/USD)
normalized_name: text (storage: EURUSD)
user_id: UUID
created_at: timestamp
```

### 5. PERFORMANCE_METRICS
Pre-calculated stats for fast dashboard loading

```
id: UUID
user_id: UUID
account_id: UUID (optional)
metric_date: date
metric_type: text (daily/weekly/monthly/all_time)
total_trades: bigint
winning_trades: bigint
losing_trades: bigint
win_rate: numeric (0-100)
total_pnl: numeric
best_trade: numeric
worst_trade: numeric
profit_factor: numeric
session_breakdown: jsonb ({Asia: 5, Europe: 10...})
setup_breakdown: jsonb ({Setup1: {wins: 5, losses: 2}...})
calculated_at, updated_at: timestamps
```

### 6. MONTHLY_PERFORMANCE
Monthly P&L breakdown

```
id: UUID
user_id: UUID
account_id: UUID (optional)
year_month: text (YYYY-MM format)
trades_count: integer
winning_trades: integer
losing_trades: integer
pnl_amount: numeric
pnl_percentage: numeric
win_rate: numeric
asia_trades: integer
europe_trades: integer
us_trades: integer
created_at, updated_at: timestamps
```

### 7. DAILY_PERFORMANCE
Daily P&L tracking

```
id: UUID
user_id: UUID
account_id: UUID (optional)
trading_date: date
trades_count: integer
winning_trades: integer
losing_trades: integer
pnl_amount: numeric
best_trade: numeric
worst_trade: numeric
created_at, updated_at: timestamps
```

### 8. TRADES (Optional)
Imported trades from broker

```
id: UUID
account_id: UUID
symbol: text
side: text (buy/sell)
size: numeric
price: numeric
status: text
executed_at: timestamp
metadata: jsonb
created_at: timestamp
```

### 9. COPY_RULES (Optional)
Copy trading configuration

```
id: UUID
master_account_id: UUID
follower_account_id: UUID
enabled: boolean
lot_multiplier: numeric
max_loss_per_trade: numeric
notes: text
created_at, updated_at: timestamps
```

### 10. TRADING_GOALS
User's trading goals

```
id: UUID
user_id: UUID
account_id: UUID (optional)
title: text
description: text
goal_type: text (daily_pnl, monthly_pnl, win_rate, etc.)
target_value: numeric
period: text (daily, weekly, monthly)
current_value: numeric
progress_percentage: numeric
status: text (active, completed, failed)
start_date: date
end_date: date (optional)
created_at, updated_at: timestamps
```

## Database Relationships

```
auth.users (Supabase managed)
│
├─► trading_accounts
│   ├─► journals (main data)
│   ├─► trades (imported)
│   ├─► copy_rules (x2 relationships)
│   ├─► performance_metrics
│   ├─► monthly_performance
│   ├─► daily_performance
│   └─► trading_goals
│
├─► setups (user setups)
├─► symbols (user symbols)
└─► performance_metrics (user level)
```

## Indexes for Performance

All critical lookup paths are indexed:

- `user_id` - Fast user lookups
- `account_id` - Fast account filtering
- `created_at` - Fast date range queries
- `symbol` - Fast symbol lookups
- `result` - Fast result type filtering
- `win` - Fast win/loss filtering
- `session` - Fast session breakdown
- `setup` - Fast setup analysis

## Usage in Dashboard

### Dashboard Overview Widget
```sql
SELECT 
  COUNT(*) as total_trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as total_pnl
FROM journals
WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
```

### Monthly P&L Chart
```sql
SELECT 
  year_month,
  pnl_amount,
  trades_count,
  win_rate
FROM monthly_performance
WHERE user_id = $1
ORDER BY year_month DESC
LIMIT 12
```

### Session Breakdown
```sql
SELECT 
  session,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  ROUND(100.0 * COUNT(CASE WHEN win THEN 1 END) / COUNT(*), 2) as win_rate,
  SUM(realized_amount) as pnl
FROM journals
WHERE user_id = $1
GROUP BY session
```

### Setup Analysis
```sql
SELECT 
  setup,
  COUNT(*) as trades,
  COUNT(CASE WHEN win THEN 1 END) as wins,
  AVG(realized_amount) as avg_pnl,
  MAX(realized_amount) as best,
  MIN(realized_amount) as worst
FROM journals
WHERE user_id = $1
GROUP BY setup
```

## Next Steps

1. ✅ Run COMPLETE_FRESH_SCHEMA.sql in Supabase
2. ✅ Verify all 10 tables are created
3. ✅ Test adding a journal entry
4. ✅ Build dashboard queries for each chart
5. ✅ Set up automatic performance_metrics updates (via triggers or scheduled functions)
6. ✅ Create RLS policies for data security

## Row Level Security (RLS)

Recommended RLS policies:

```sql
-- journals: users can only see their own
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY journals_select ON journals FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY journals_insert ON journals FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- trading_accounts: users can only see their own
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_select ON trading_accounts FOR SELECT
  USING (user_id = auth.uid());

-- Similar for other tables...
```

## Performance Tips

1. **Denormalize** - Use performance_metrics table for dashboard queries instead of recalculating
2. **Index frequently filtered columns** - Already done for user_id, account_id, created_at
3. **Partition journals by date** - For very large datasets, consider monthly partitions
4. **Use materialized views** - For complex dashboard queries
5. **Archive old data** - Move completed trades to archive table after 1 year

## Testing Checklist

- [ ] All 10 tables created
- [ ] All indexes present
- [ ] Foreign key relationships valid
- [ ] Add sample trading_account
- [ ] Add sample journal entry
- [ ] Verify realized_amount calculated correctly
- [ ] Query performance_metrics table
- [ ] Check daily_performance data
- [ ] Verify monthly_performance aggregation
- [ ] Test all dashboard queries

## Troubleshooting

**Error: "Relation already exists"**
- Schema already has these tables, use fresh migration script

**Error: "FK constraint violation"**
- trading_accounts table doesn't exist, run complete schema script

**Query timeout on journals**
- Need to create indexes - they're already in the script
- Or use performance_metrics table instead of recalculating

**RLS errors when querying**
- Enable RLS policies for user authentication
- Check that user_id matches auth.uid()
