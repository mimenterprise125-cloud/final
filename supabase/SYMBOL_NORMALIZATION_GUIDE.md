# Symbol Normalization Guide

## Overview

This guide explains how symbols are stored and queried in the database to ensure case-insensitive, format-insensitive matching. For example, `EUR/USD`, `eurusd`, `EURUSD`, and `Eurusd` should all match the same database entry.

## Database Schema

### Symbols Table Structure

```sql
CREATE TABLE symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- Display format: "EUR/USD", "XAU/USD", "SPX500", etc.
  normalized_name TEXT NOT NULL UNIQUE, -- Normalized format: "EURUSD", "XAUUSD", "SPX500", etc.
  category TEXT, -- Optional: 'FOREX', 'METALS', 'COMMODITIES', 'FUTURES', 'INDICES', 'CRYPTO'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sample Data

```sql
-- FOREX Pairs
INSERT INTO symbols (name, normalized_name, category) VALUES
  ('EUR/USD', 'EURUSD', 'FOREX'),
  ('GBP/USD', 'GBPUSD', 'FOREX'),
  ('USD/JPY', 'USDJPY', 'FOREX'),
  ('AUD/USD', 'AUDUSD', 'FOREX');

-- METALS
INSERT INTO symbols (name, normalized_name, category) VALUES
  ('XAU/USD', 'XAUUSD', 'METALS'),  -- Gold
  ('XAG/USD', 'XAGUSD', 'METALS'),  -- Silver
  ('XPT/USD', 'XPTUSD', 'METALS'),  -- Platinum
  ('XPD/USD', 'XPDUSD', 'METALS');  -- Palladium

-- COMMODITIES
INSERT INTO symbols (name, normalized_name, category) VALUES
  ('WTI/USD', 'WTIUSD', 'COMMODITIES'),      -- Crude Oil
  ('BRENT/USD', 'BRENTUSD', 'COMMODITIES'), -- Brent Oil
  ('GAS/USD', 'GASUSD', 'COMMODITIES'),      -- Natural Gas
  ('CORN/USD', 'CORNUSD', 'COMMODITIES');

-- INDICES
INSERT INTO symbols (name, normalized_name, category) VALUES
  ('SPX500', 'SPX500', 'INDICES'),       -- S&P 500
  ('NASDAQ100', 'NASDAQ100', 'INDICES'), -- NASDAQ-100
  ('DJIA30', 'DJIA30', 'INDICES'),       -- Dow Jones
  ('DAX', 'DAX', 'INDICES');

-- FUTURES
INSERT INTO symbols (name, normalized_name, category) VALUES
  ('ES', 'ES', 'FUTURES'),     -- E-mini S&P 500
  ('NQ', 'NQ', 'FUTURES'),     -- E-mini NASDAQ-100
  ('GC', 'GC', 'FUTURES'),     -- Gold Futures
  ('CL', 'CL', 'FUTURES');     -- Crude Oil Futures

-- CRYPTOCURRENCIES
INSERT INTO symbols (name, normalized_name, category) VALUES
  ('BTC/USD', 'BTCUSD', 'CRYPTO'),
  ('ETH/USD', 'ETHUSD', 'CRYPTO'),
  ('XRP/USD', 'XRPUSD', 'CRYPTO');
```

## Normalization Rules

### How Normalization Works

The `normalizeSymbolKey()` function in `src/lib/symbol-utils.ts`:

1. **Trim whitespace** from input
2. **Remove all non-alphanumeric characters** (removes `/`, `-`, `^`, etc.)
3. **Convert to UPPERCASE**

Examples:
- `"EUR/USD"` → `"EURUSD"`
- `"eurusd"` → `"EURUSD"`
- `"Eur/usd"` → `"EURUSD"`
- `"XAU/USD"` → `"XAUUSD"`
- `"gold"` → `"GOLD"` → maps to `"XAUUSD"`
- `"SPX500"` → `"SPX500"`

### Display Format Mapping

The `formatSymbolDisplay()` function uses the `INSTRUMENT_PATTERNS` map to convert normalized keys to standard display formats:

- `"EURUSD"` → `"EUR/USD"`
- `"XAUUSD"` → `"XAU/USD"`
- `"SPX500"` → `"SPX500"`
- `"BTCUSD"` → `"BTC/USD"`

## Querying Symbols

### Finding a Symbol (Case-Insensitive)

When a user enters a symbol, you should:

1. **Normalize the input**: `normalizeSymbolKey("EUR/USD")` → `"EURUSD"`
2. **Query by normalized_name**:

```sql
SELECT name, normalized_name, category 
FROM symbols 
WHERE normalized_name = 'EURUSD'
LIMIT 1;
```

This returns: `{ name: "EUR/USD", normalized_name: "EURUSD", category: "FOREX" }`

### Filtering Symbols (Search)

When filtering symbols from a dropdown:

```sql
SELECT name, normalized_name 
FROM symbols 
WHERE normalized_name LIKE 'EUR%'  -- User typed "EUR"
  OR name ILIKE '%EUR%'             -- Or matching the display format
ORDER BY created_at DESC;
```

## Inserting New Symbols

When a user creates a new symbol (e.g., "SPY"):

```typescript
import { normalizeSymbolKey, formatSymbolDisplay } from "@/lib/symbol-utils";

const input = "SPY";
const normalized = normalizeSymbolKey(input);    // "SPY"
const display = formatSymbolDisplay(input);      // "SPY" (not a known pattern)

const payload = {
  name: display,        // "SPY"
  normalized_name: normalized  // "SPY"
};

const { data, error } = await supabase
  .from('symbols')
  .insert([payload])
  .select('*');
```

## Avoiding Duplicates

The database constraints ensure duplicates are prevented:

```sql
-- These constraints prevent duplicate entries:
UNIQUE(name)              -- Can't have duplicate display names
UNIQUE(normalized_name)   -- Can't have duplicate normalized names
```

**Example**: If someone tries to save "eurusd" when "EUR/USD" already exists:

1. Input: `"eurusd"`
2. Normalize: `"EURUSD"`
3. Query check: `SELECT FROM symbols WHERE normalized_name = 'EURUSD'` → **Found!**
4. Instead of inserting, return existing: `{ name: "EUR/USD", normalized_name: "EURUSD" }`

## Code Implementation Reference

### In AddJournalDialog.tsx

```typescript
const handleAddSymbol = async (customInput?: string) => {
  const raw = (customInput || addSymInput)?.trim();
  const input = raw.replace(/\s+/g, ' ');
  const nInput = normalizeSymbolKey(input);      // "EURUSD"
  const display = formatSymbolDisplay(input);    // "EUR/USD"

  // Check if symbol already exists
  const found = all.find((r:any) => 
    String(r.normalized_name).toUpperCase() === nInput
  );
  
  if (found) {
    // Symbol exists, use existing name
    setFormData((f) => ({ ...f, symbol: found.name }));
    return;
  }

  // Insert new symbol
  const { error } = await supabase
    .from('symbols')
    .insert([{ name: display, normalized_name: nInput }]);
};
```

## Supported Instrument Types

The system supports:

- ✅ **Forex Pairs**: EUR/USD, GBP/USD, etc.
- ✅ **Precious Metals**: XAU/USD, XAG/USD, XPT/USD, XPD/USD
- ✅ **Commodities**: WTI/USD, BRENT/USD, CORN/USD, SUGAR/USD, etc.
- ✅ **Crude Oil**: WTI/USD, BRENT/USD, CL (Futures)
- ✅ **Natural Gas**: GAS/USD, NG (Futures)
- ✅ **Agricultural**: CORN/USD, SOYBEAN/USD, WHEAT/USD, COFFEE/USD, COCOA/USD
- ✅ **Indices**: SPX500, NASDAQ100, DJIA30, DAX, FTSE100, etc.
- ✅ **Futures**: ES, NQ, YM, RTY, GC, SI, CL, NG, ZC, ZW, etc.
- ✅ **Cryptocurrencies**: BTC/USD, ETH/USD, XRP/USD, LTC/USD

## Migration Script (If Upgrading Existing Data)

If you have existing symbols without normalized_name, run this:

```sql
UPDATE symbols 
SET normalized_name = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, '/', ''), '-', ''), '^', ''), ' ', ''), '.', ''))
WHERE normalized_name IS NULL;

-- Verify
SELECT COUNT(*) FROM symbols WHERE normalized_name IS NULL;
```

## Testing Normalization

You can test the normalization in the browser console:

```javascript
import { normalizeSymbolKey, formatSymbolDisplay, symbolMatches } from "@/lib/symbol-utils";

// Test normalization
normalizeSymbolKey("EUR/USD")     // "EURUSD"
normalizeSymbolKey("eurusd")       // "EURUSD"
normalizeSymbolKey("Eur/usd")      // "EURUSD"

// Test display formatting
formatSymbolDisplay("EURUSD")      // "EUR/USD"
formatSymbolDisplay("eurusd")       // "EUR/USD"

// Test symbol matching
symbolMatches("EUR/USD", "eurusd") // true
symbolMatches("EUR/USD", "eur")    // true
symbolMatches("GBP/USD", "eurusd") // false
```

## Best Practices

1. **Always normalize user input** before querying or comparing symbols
2. **Store both `name` and `normalized_name`** in the database for display and lookup
3. **Use normalized_name for UNIQUE constraints** to prevent case-insensitive duplicates
4. **Query by normalized_name** for lookups, not by display name
5. **Display using `name` field** to show standard formatting to users
6. **Check for existing symbols** before inserting new ones using the normalized name

## FAQ

**Q: Why store both `name` and `normalized_name`?**
A: `name` is for user display (nice formatting), `normalized_name` is for case-insensitive database lookups.

**Q: What if a user enters "GOLD" instead of "XAU/USD"?**
A: The pattern matcher recognizes "GOLD" as an alias and normalizes to "XAUUSD", which maps to display format "XAU/USD".

**Q: Can users create custom symbols?**
A: Yes! Any input that doesn't match known patterns becomes a custom symbol. It's stored with normalized format (uppercase, no special chars) and displayed as entered (or auto-formatted if it matches a pattern).

**Q: What if two users save slightly different formats of the same symbol?**
A: They'll automatically deduplicate because the normalized name is UNIQUE. User 1 saves "EUR/USD", User 2 saves "eurusd" → both get stored as normalized "EURUSD" with display name "EUR/USD".
