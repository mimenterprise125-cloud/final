# Symbols Table - Shared + Private Setup

## How It Works

### **Global Symbols** (Pre-defined - Available to EVERYONE)
- Examples: EUR/USD, BTC/USD, AAPL, etc.
- Created once by admin
- `is_global = true` in database
- `user_id = NULL`
- All users can see and use them
- No one can delete them

### **Custom Symbols** (User-added - Only Visible to That User)
- Examples: User A adds "CUSTOM_SETUP_1"
- Created by individual users
- `is_global = false` in database
- `user_id = that user's ID`
- Only that user can see it
- Only that user can delete it

## Setup Instructions

### Step 1: Add is_global Column

1. Go to Supabase SQL Editor
2. Run this SQL:

```sql
ALTER TABLE symbols ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT false;
```

### Step 2: Update RLS Policies

Copy & paste the RLS section from `SYMBOLS_SHARED_AND_PRIVATE.sql`:

```sql
DROP POLICY IF EXISTS "symbols_select" ON symbols;
DROP POLICY IF EXISTS "symbols_select_all" ON symbols;

CREATE POLICY "symbols_select_shared_or_own" ON symbols FOR SELECT
  USING (
    is_global = true
    OR
    user_id = auth.uid()
  );

CREATE POLICY "symbols_insert_custom" ON symbols FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_global = false);

CREATE POLICY "symbols_delete_custom" ON symbols FOR DELETE
  USING (user_id = auth.uid() AND is_global = false);
```

### Step 3: Insert Global Symbols

Run this SQL to add pre-defined symbols:

```sql
INSERT INTO symbols (id, name, normalized_name, user_id, is_global, created_at)
VALUES
  (gen_random_uuid(), 'EUR/USD', 'EURUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'GBP/USD', 'GBPUSD', NULL, true, NOW()),
  (gen_random_uuid(), 'BTC/USD', 'BTCUSD', NULL, true, NOW()),
  -- ... add more symbols
ON CONFLICT (normalized_name, user_id) DO NOTHING;
```

## Data Model

```
SYMBOLS TABLE:
┌─────────────┬──────────────┬───────────┬──────────┐
│ id          │ name         │ user_id   │ is_global│
├─────────────┼──────────────┼───────────┼──────────┤
│ uuid-1      │ EUR/USD      │ NULL      │ true     │ ← Global
│ uuid-2      │ BTC/USD      │ NULL      │ true     │ ← Global
│ uuid-3      │ AAPL         │ NULL      │ true     │ ← Global
│ uuid-4      │ My Custom    │ user-A-id │ false    │ ← User A only
│ uuid-5      │ My Custom 2  │ user-B-id │ false    │ ← User B only
└─────────────┴──────────────┴───────────┴──────────┘
```

## RLS Logic

**When User A queries symbols:**

```sql
WHERE is_global = true           -- Gets all global symbols
  OR user_id = auth.uid()        -- Gets only their own custom symbols
```

Result: User A sees
- ✅ EUR/USD (global)
- ✅ BTC/USD (global)
- ✅ AAPL (global)
- ✅ My Custom (their own)
- ❌ My Custom 2 (User B's - hidden)

## Frontend Changes

### Load Symbols for Dropdown

```typescript
// Load all available symbols (global + user's custom)
const { data: symbols } = await supabase
  .from('symbols')
  .select('name, normalized_name')
  .or('is_global.eq.true,user_id.eq.' + userId);

// symbols will be: [EUR/USD, BTC/USD, AAPL, ..., My Custom]
```

### Add Custom Symbol

```typescript
// User adds their own symbol - only they see it
await supabase
  .from('symbols')
  .insert({
    name: 'CUSTOM_SYMBOL',
    normalized_name: 'CUSTOMSYMBOL',
    user_id: userId,
    is_global: false  // Important!
  });
```

## Summary

| Aspect | Global Symbols | Custom Symbols |
|--------|---|---|
| Created by | Admin/System | Individual users |
| is_global | true | false |
| user_id | NULL | user's ID |
| Visible to | Everyone | Only that user |
| Can delete | No | Yes (only your own) |
| Examples | EUR/USD, BTC/USD, AAPL | "My Setup 1", "Test Symbol" |

## Verification Query

```sql
-- Check what symbols exist
SELECT name, is_global, 
  CASE WHEN user_id IS NULL THEN 'Global' 
       ELSE 'Custom' END as type
FROM symbols
ORDER BY is_global DESC, name ASC;
```

Expected output:
```
name      │ is_global │ type
──────────┼───────────┼────────
EUR/USD   │ true      │ Global
BTC/USD   │ true      │ Global
AAPL      │ true      │ Global
My Custom │ false     │ Custom
```

This setup gives you the best of both worlds:
- ✅ Curated global symbols for everyone
- ✅ Custom symbols for power users
- ✅ Simple RLS logic
- ✅ Easy to maintain
