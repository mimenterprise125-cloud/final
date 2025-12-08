# Trading Journal Database Setup

## 📁 Files Overview

### 1. **schema.sql** ⭐ MAIN FILE
Complete database schema with all tables, views, RLS policies, and triggers.
**Run this first to initialize your database.**

### 2. **migrations.sql** 
Database migrations for updating existing databases with new features.
**Run this if you have an existing database that needs updates.**

### 3. **DATABASE_SETUP.md** (This file)
Quick setup guide and reference documentation.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Run Main Schema
1. Open your Supabase project → **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `schema.sql`
4. Paste into Supabase SQL Editor
5. Click **Run**

### Step 2: (Optional) Run Migrations
If you get errors about missing columns:
1. Open **SQL Editor** → **New Query**
2. Copy contents of `migrations.sql`
3. Paste and click **Run**

### Step 3: Add Environment Variables
Create `.env.local` in project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Step 4: Test Connection
```typescript
import supabase from '@/lib/supabase'

const { data } = await supabase.from('setups').select('*')
console.log(data) // Should show setups
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `symbols` | Trading pairs (EUR/USD, BTC/USD, etc) |
| `setups` | Trading patterns with descriptions |
| `trading_accounts` | User's broker accounts |
| `journals` | Main trade log |
| `loss_reasons` | Loss categorization |

---

## 📈 Analytics Views

- **trading_stats** - Overall trading performance
- **symbol_stats** - Per-symbol statistics
- **setup_stats** - Per-setup statistics

---

## 🔐 Security

✅ Row Level Security (RLS) - Users can only see their own data
✅ Automatic user isolation via `auth.uid()`
✅ Complete per-user data protection

---

## 🛠️ Migrations

If updating an existing database, run `migrations.sql` to add new features like:
- Description column for setups
- Additional helper functions
- Performance optimizations

---

## 📋 Useful Queries

### Get User Statistics
```sql
SELECT * FROM trading_stats WHERE user_id = auth.uid();
```

### Get Symbol Performance
```sql
SELECT * FROM symbol_stats WHERE user_id = auth.uid();
```

### Get Recent Trades
```sql
SELECT * FROM journals 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

---

## ❌ Common Issues

### Error: "Could not find description column"
**Solution:** Run `migrations.sql` to add the missing column

### Error: "Permission denied"
**Solution:** 
- Use the `anon` key, not `service_role` key
- Verify RLS policies are enabled

### Error: "Bad Request 400"
**Solution:** Run migrations.sql to sync schema with database

---

## 📝 Database Schema Structure

```
auth.users (Supabase Auth)
    ├── symbols (Trading pairs)
    ├── setups (Trading patterns)
    ├── trading_accounts (Broker accounts)
    ├── journals (Trade log)
    └── loss_reasons (Loss categories)

VIEWS (Analytics):
    ├── trading_stats (Overall performance)
    ├── symbol_stats (Per-symbol stats)
    └── setup_stats (Per-setup stats)
```

---

## ✅ Setup Checklist

- [ ] Create Supabase project
- [ ] Get API credentials (URL + Key)
- [ ] Run `trading_schema.sql`
- [ ] Run `migrations.sql` (if updating)
- [ ] Set `.env.local` variables
- [ ] Test connection from React
- [ ] Start logging trades!

---

## 📚 Column Reference

### journals Table (Main Trade Log)
```
- symbol: Trading pair (EUR/USD, BTC/USD)
- direction: Buy or Sell
- entry_at, exit_at: Trade timing
- duration_minutes: Trade duration
- setup: Trading pattern name
- setup_rating: Quality rating (A+, A, A-, B+, B)
- execution_type: Market, Limit, Stop
- stop_loss_price/points: SL level
- target_price/points: TP level
- result: TP, SL, BREAKEVEN, MANUAL
- realized_amount: P&L in currency
- realized_points: P&L in points/pips
- win: TRUE if profitable
- rule_followed: Followed trading rules?
- notes: Trade notes
- screenshot_urls: Array of image URLs
```

---

## 🔧 Stored Procedures (Optional)

Available in `migrations.sql`:
- `get_user_stats(user_uuid)` - User statistics
- `get_monthly_performance(user_uuid)` - Monthly stats
- `get_best_symbols(user_uuid)` - Best performing symbols
- `get_best_setups(user_uuid)` - Best performing setups

---

## 💡 Tips

1. **Enable Backups** in Supabase Settings → Backups
2. **Use Indexes** for faster queries (already included)
3. **Archive Old Trades** after 1-2 years for better performance
4. **Regular Backups**: `supabase db download`

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Database Version: 1.0 | Created: December 8, 2025**
