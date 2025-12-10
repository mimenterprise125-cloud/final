# Complete Journals Table Migration Guide

## Overview
Your existing `journals` table is missing several columns. This migration adds **ALL** required columns to make your database schema match the application code.

## Missing Columns Being Added

### Core Trade Fields
- `title` - Trade title/name
- `symbol` - Trading symbol (EUR/USD, etc)
- `entry_price` - Entry price of the trade
- `exit_price` - Exit price of the trade
- `entry_at` - Entry timestamp
- `exit_at` - Exit timestamp

### Session & Setup
- `session` - Trading session (Asia, Europe, US, etc)
- `setup` - Setup name/type
- `setup_rating` - Setup rating (A+, A, B, etc)

### Execution Details
- `execution_type` - Market, Limit, Stop
- `stop_loss_price` - SL price (user-entered)
- `target_price` - TP price (user-entered)
- `stop_loss_points` - SL points (user-entered)
- `target_points` - TP points (user-entered)

### Results & Amounts
- `realized_points` - Actual profit/loss in points
- `realized_amount` - Actual profit/loss in account currency
- `result` - TP/SL/Breakeven/Manual Exit
- `win` - Boolean: true if profitable

### Quality & Rules
- `rule_followed` - Boolean: true if rule was followed
- **`confirmation`** - Boolean: trade confirmation flag (THIS WAS MISSING)
- `loss_reason` - Reason for loss (optional text)

### Trade Direction & Duration
- `direction` - Buy or Sell
- `duration_minutes` - How long the trade was open

### Notes & Media
- `notes` - Trade notes/observations
- `screenshot_urls` - Array of screenshot URLs
- `tags` - Array of tags

### References
- `account_id` - Optional reference to trading_accounts (NEW)
- `trade_id` - Optional reference to trades table

### Timestamps
- `updated_at` - Last update timestamp

## How to Apply the Migration

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**

### Step 2: Create New Query
1. Click **+ New Query**
2. Copy the entire contents of `supabase/ADD_ACCOUNT_ID_TO_JOURNALS.sql`
3. Paste into the editor

### Step 3: Execute Migration
1. Click **Run** button (green play icon)
2. Wait for success message
3. You should see: "Rows affected: 0" (since we're using IF NOT EXISTS)

### Step 4: Verify Success
Run this verification query in a new SQL Editor tab:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'journals'
ORDER BY ordinal_position;
```

You should see all columns including:
- `confirmation` (boolean)
- `account_id` (uuid)
- All others listed above

## What Gets Added

### 44 Columns Total in journals table:
1. id (uuid) - Primary Key
2. user_id (uuid) - Foreign Key to auth.users
3. title (text)
4. symbol (text)
5. entry_price (numeric)
6. exit_price (numeric)
7. entry_at (timestamptz)
8. exit_at (timestamptz)
9. session (text)
10. setup (text)
11. setup_rating (text)
12. execution_type (text)
13. stop_loss_price (numeric)
14. target_price (numeric)
15. stop_loss_points (numeric)
16. target_points (numeric)
17. realized_points (numeric)
18. realized_amount (numeric)
19. account_id (uuid) - Foreign Key to trading_accounts
20. rule_followed (boolean)
21. **confirmation (boolean)** ← THE ONE THAT WAS MISSING
22. loss_reason (text)
23. direction (text)
24. result (text)
25. win (boolean)
26. duration_minutes (integer)
27. notes (text)
28. screenshot_urls (text[])
29. tags (text[])
30. trade_id (uuid)
31. created_at (timestamptz)
32. updated_at (timestamptz)

### 6 Indexes Added for Performance:
- `idx_journals_user_id` - Fast user lookups
- `idx_journals_account_id` - Fast account lookups
- `idx_journals_created_at` - Fast date range queries
- `idx_journals_symbol` - Fast symbol lookups
- `idx_journals_result` - Fast result filtering
- `idx_journals_win` - Fast win/loss filtering

## After Migration

Your application will now work correctly because:

✅ **Form submission** - All fields can be saved
✅ **Account selection** - account_id column exists
✅ **Trade confirmation** - confirmation column exists
✅ **Screenshots** - screenshot_urls array exists
✅ **Queries** - Indexes speed up reads
✅ **Schema matching** - Database matches code expectations

## Troubleshooting

### Error: "Column already exists"
This is safe! The `IF NOT EXISTS` clause prevents re-creating columns.

### Error: "Invalid column reference"
This means the trading_accounts table doesn't exist. Run `schema.sql` first to create all base tables.

### Verification Query Returns Different Columns
This is OK - your database might have different custom columns. As long as the columns listed above exist, the form will work.

## Rollback (If Needed)

If you need to remove the new columns (not recommended):

```sql
ALTER TABLE journals DROP COLUMN IF EXISTS account_id CASCADE;
ALTER TABLE journals DROP COLUMN IF EXISTS confirmation CASCADE;
-- etc. for each column
```

But it's better to keep them - they enable future features!

## Next Steps

After running this migration:
1. ✅ Database schema is complete
2. Test adding a journal entry with screenshots
3. Test selecting an account
4. Test the confirmation checkbox
5. All form fields should now work correctly

Questions? Check the error message in Supabase SQL Editor - it will tell you exactly what went wrong.
