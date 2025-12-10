# Complete Symbol System Implementation Guide

## Overview

This guide documents the complete symbol system for the Trading Dashboard. It includes:
- 90+ global symbols available to all users
- Private custom symbols for individual traders
- Symbol normalization utilities
- Database setup with RLS policies
- Population of the symbol library

## Architecture

### Two-Tier Symbol System

The system is divided into two tiers:

#### 1. Global Symbols (is_global = true)
- Available to **all users** in the application
- Created once and shared across the platform
- Include: Forex pairs, commodities, indices, cryptocurrencies, futures contracts
- Cannot be deleted by individual users
- Managed by the system/admin

#### 2. Custom Symbols (is_global = false)
- **Private** to the user who created them
- User-specific trading instruments
- Created when a user enters a symbol not in the global list
- User can manage/delete their own custom symbols
- Only visible to the creator

### Database Schema

```sql
CREATE TABLE symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,        -- Display name (e.g., "EUR/USD")
  key VARCHAR(50) NOT NULL,           -- Normalized key (e.g., "EURUSD")
  user_id UUID REFERENCES auth.users, -- NULL for global, UUID for custom
  is_global BOOLEAN DEFAULT false,    -- TRUE for global, FALSE for custom
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

**SELECT Policy:**
```sql
(is_global = true) OR (user_id = auth.uid())
```
- Users can see all global symbols
- Users can see their own custom symbols
- Users cannot see other users' custom symbols

**INSERT Policy:**
```sql
(is_global = false AND user_id = auth.uid())
```
- Users can only insert custom symbols (is_global must be false)
- Cannot create global symbols (server-only operation)

**DELETE Policy:**
```sql
(user_id = auth.uid())
```
- Users can only delete their own custom symbols
- Global symbols cannot be deleted by regular users

## Symbol Categories (90+)

### Forex Major Pairs (7)
- EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD

### Forex Crosses (20+)
- EUR/GBP, EUR/JPY, EUR/CHF, EUR/AUD, EUR/CAD, EUR/NZD
- GBP/JPY, GBP/CHF, GBP/AUD, GBP/CAD
- JPY/CHF, AUD/JPY, AUD/CHF, CAD/JPY, NZD/JPY, NZD/CHF
- ...and more

### Precious Metals (4)
- XAU/USD (Gold), XAG/USD (Silver), XPT/USD (Platinum), XPD/USD (Palladium)

### Energy Commodities (3)
- WTI/USD (West Texas Intermediate Crude Oil)
- BRENT/USD (Brent Crude Oil)
- GAS/USD (Natural Gas)

### Agricultural Commodities (6)
- CORN/USD, SOYBEAN/USD, WHEAT/USD, SUGAR/USD, COFFEE/USD, COCOA/USD

### Stock Indices - US (4)
- SPX500 (S&P 500), NASDAQ100, DJIA30 (Dow Jones), VIX

### Stock Indices - International (6)
- DAX (Germany), CAC40 (France), FTSE100 (UK), ASX200 (Australia)
- HANGSENG (Hong Kong), NIKKEI225 (Japan)

### Cryptocurrencies (4)
- BTC/USD (Bitcoin), ETH/USD (Ethereum), LTC/USD (Litecoin), XRP/USD (Ripple)

### Bonds & Rates (3)
- US10Y (10-Year US Treasury), US2Y (2-Year US Treasury), US30Y (30-Year US Treasury)

### Futures - Commodities (9)
- GC (Gold), SI (Silver), CL (Crude Oil), NG (Natural Gas)
- ZC (Corn), ZW (Wheat), ZS (Soybean)
- CT (Cotton), OJ (Orange Juice)

### Futures - Treasury (2)
- ZB (US Treasury Bond), TY (US 10-Year Note)

### Futures - Equity Indices (5)
- ES (E-mini S&P 500), NQ (E-mini NASDAQ-100), YM (E-mini Dow)
- RTY (E-mini Russell 2000), EMD (E-mini S&P MidCap 400)

### Futures - Currency (9)
- EC (Euro), BP (British Pound), JY (Japanese Yen), AD (Australian Dollar)
- SF (Swiss Franc), CD (Canadian Dollar), NE (New Zealand Dollar)
- MEF (Mexican Peso), BR (Brazilian Real)

### Futures - Other (7)
- EF (Euro FX), GE (Eurodollar), HG (Copper), PL (Platinum), PA (Palladium)

### Micro Contracts (4)
- MES, MNQ, MYM, M2K

### Additional Forex Minors & Exotics (15)
- HKD/USD, SGD/USD, INR/USD, BRL/USD, ZAR/USD, MXN/USD, THB/USD
- MYR/USD, PHP/USD, IDR/USD, VEF/USD, ARS/USD, CLP/USD, CNY/USD, RUB/USD

## Implementation Steps

### Step 1: Apply Database Migrations

Run these SQL files in Supabase SQL Editor in order:

```bash
1. supabase/SYMBOLS_SHARED_AND_PRIVATE.sql
   - Adds is_global column to symbols table
   - Updates RLS policies

2. supabase/POPULATE_GLOBAL_SYMBOLS.sql
   - Inserts all 90+ global symbols
   - Includes verification queries
```

### Step 2: Execute in Supabase SQL Editor

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste entire contents of `SYMBOLS_SHARED_AND_PRIVATE.sql`
5. Click **Run**
6. Create another **New Query**
7. Paste entire contents of `POPULATE_GLOBAL_SYMBOLS.sql`
8. Click **Run**

### Step 3: Verify Population

After running the INSERT query, verify success:

```sql
-- Should show approximately 90+ symbols
SELECT COUNT(*) as total_global_symbols 
FROM symbols 
WHERE is_global = true;

-- Show sample symbols
SELECT name, key, is_global 
FROM symbols 
WHERE is_global = true 
LIMIT 20;
```

### Step 4: Test Symbol Creation in Application

1. **View Global Symbols**
   - Open the journal creation dialog
   - Symbols dropdown should show all 90+ symbols
   - All symbols should be searchable

2. **Create Custom Symbol**
   - Enter a symbol not in the global list (e.g., "CUSTOM123")
   - Save the journal entry
   - Symbol should be created with `is_global = false`
   - Symbol should be private to that user

3. **Verify Privacy**
   - Switch to a different user account
   - Custom symbol from step 2 should NOT appear
   - User can still create their own custom symbols

## Code Integration

### Symbol Utilities (src/lib/symbol-utils.ts)

The codebase includes comprehensive symbol utilities:

```typescript
// Normalize symbol input (remove special chars, uppercase)
normalizeSymbolKey("EUR/USD") // => "EURUSD"

// Format for display
formatSymbolDisplay("EURUSD") // => "EUR/USD"

// Get search suggestions (for autocomplete)
getSymbolSuggestions("EUR") // => ["EUR/USD", "EUR/GBP", ...]

// Check if symbol is recognized
isKnownInstrument("EURUSD") // => true

// Get all known instruments
getKnownInstruments() // => ["AUD/USD", "BTC/USD", ...]
```

### AddJournalDialog Integration

The journal dialog uses the symbol system:

1. **Symbol Input Field** - Accepts any symbol
2. **Validation** - Checks if symbol exists in global or custom symbols
3. **Creation** - If new symbol, creates as custom (private)
4. **Dropdown** - Shows all symbols (global + user's custom)
5. **Search** - Uses `getSymbolSuggestions()` for filtering

### Queries

**Select all symbols available to current user:**
```sql
SELECT * FROM symbols 
WHERE is_global = true 
   OR user_id = auth.uid()
ORDER BY name;
```

**Select global symbols:**
```sql
SELECT * FROM symbols 
WHERE is_global = true
ORDER BY name;
```

**Select user's custom symbols:**
```sql
SELECT * FROM symbols 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

**Create custom symbol:**
```sql
INSERT INTO symbols (id, name, key, user_id, is_global, created_at)
VALUES (gen_random_uuid(), 'Custom Symbol', 'CUSTOMSYMBOL', auth.uid(), false, NOW());
```

## Maintenance & Administration

### Adding New Global Symbols

Only system administrators should add new global symbols. Use:

```sql
INSERT INTO symbols (id, name, key, user_id, is_global, created_at)
VALUES (gen_random_uuid(), 'Display Name', 'NORMALIZEDKEY', NULL, true, NOW());
```

**Important:** Always set `user_id = NULL` and `is_global = true` for global symbols.

### Removing Global Symbols

If a symbol is no longer needed:

```sql
DELETE FROM symbols 
WHERE is_global = true 
AND key = 'SYMBOLKEY';
```

### Updating Symbol Display Names

```sql
UPDATE symbols 
SET name = 'New Display Name'
WHERE key = 'SYMBOLKEY' 
AND is_global = true;
```

### Cleanup Custom Symbols

Periodically clean up unused custom symbols:

```sql
DELETE FROM symbols 
WHERE is_global = false
AND user_id IS NULL
AND created_at < NOW() - INTERVAL '90 days';
```

## Troubleshooting

### Issue: Symbol dropdown shows no symbols

**Check 1:** Verify symbols table has data
```sql
SELECT COUNT(*) FROM symbols;
```

**Check 2:** Verify RLS policies are correct
```sql
SELECT * FROM symbols LIMIT 5;
```

**Check 3:** Check user authentication
- Ensure user is logged in
- Check auth.uid() returns valid UUID

### Issue: User sees symbols they shouldn't

**Check 1:** Verify RLS policies
```sql
-- Should only show global or user's own
SELECT * FROM symbols 
WHERE is_global = false 
AND user_id != auth.uid();
-- Should return 0 rows
```

**Check 2:** Check database policies in Supabase Dashboard
- Navigate to **Authentication** → **Policies**
- Verify SELECT, INSERT, DELETE policies are correctly configured

### Issue: Cannot create custom symbols

**Check 1:** Verify INSERT policy allows it
```sql
INSERT INTO symbols (name, key, user_id, is_global)
VALUES ('TEST', 'TEST', auth.uid(), false);
```

**Check 2:** Check user_id is correctly passed
- Verify `auth.uid()` is available in context
- Confirm user is authenticated

### Issue: Symbols not filtering in search

**Check:** Test the normalization utility
```typescript
import { getSymbolSuggestions, normalizeSymbolKey } from '@/lib/symbol-utils';

console.log(normalizeSymbolKey("eur/usd")); // Should be "EURUSD"
console.log(getSymbolSuggestions("eur")); // Should suggest EUR pairs
```

## Performance Considerations

### Indexing

For better query performance on large symbol lists, consider adding indices:

```sql
CREATE INDEX idx_symbols_is_global ON symbols(is_global);
CREATE INDEX idx_symbols_user_id ON symbols(user_id, is_global);
CREATE INDEX idx_symbols_key ON symbols(key);
```

### Caching

The symbol list could be cached in the application:

```typescript
const cachedSymbols = useMemo(() => {
  return symbols.reduce((acc, symbol) => {
    acc[symbol.key] = symbol;
    return acc;
  }, {});
}, [symbols]);
```

### Query Optimization

Use indexed columns in WHERE clauses:

```sql
-- Fast (uses index)
SELECT * FROM symbols WHERE is_global = true;

-- Fast (uses index)
SELECT * FROM symbols WHERE user_id = 'uuid' AND is_global = false;

-- Slower (full table scan)
SELECT * FROM symbols WHERE LOWER(name) LIKE '%gold%';
```

## Reference

- **Symbol File:** `src/lib/symbol-utils.ts` (355 lines)
- **Database Setup:** `supabase/SYMBOLS_SHARED_AND_PRIVATE.sql`
- **Symbol Population:** `supabase/POPULATE_GLOBAL_SYMBOLS.sql`
- **Component:** `src/components/modals/AddJournalDialog.tsx`

## Summary

The symbol system provides:

✅ 90+ global symbols available to all traders
✅ Private custom symbols for individual users
✅ Secure RLS policies preventing symbol leakage
✅ Comprehensive symbol utilities for normalization and search
✅ Seamless integration with journal creation dialog
✅ Flexible for future symbol additions

With this system in place, users can:
- Trade a comprehensive list of global instruments
- Create custom private symbols for specialized needs
- Search and filter symbols efficiently
- Switch between accounts without symbol confusion
