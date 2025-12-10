# Stop Loss & Target Points System - Explanation

## Overview
The AddJournalDialog supports **two ways** to define Stop Loss (SL) and Take Profit (TP) levels:
1. **Price-based**: Direct price levels (e.g., SL at 4864, TP at 4870)
2. **Points-based**: Relative points from entry price (e.g., SL -2 points, TP +4 points)

---

## How Points Work

### Formula
```
Actual Price = Entry Price ± Points

For LONG trades:
- Stop Loss Price = Entry Price - SL Points
- Target Price = Entry Price + TP Points

For SHORT trades:
- Stop Loss Price = Entry Price + SL Points
- Target Price = Entry Price - TP Points
```

### Example 1: LONG Trade
**Entry Price: 4866**

Option A - Using Points:
- SL Points: 2 → SL Price = 4866 - 2 = **4864**
- TP Points: 4 → TP Price = 4866 + 4 = **4870**
- Risk/Reward = 2 points risk, 4 points reward (1:2 ratio)

Option B - Using Direct Prices:
- SL Price: 4864 (directly entered)
- TP Price: 4870 (directly entered)

### Example 2: SHORT Trade
**Entry Price: 5000**

Using Points:
- SL Points: 3 → SL Price = 5000 + 3 = **5003** (above entry for short)
- TP Points: 6 → TP Price = 5000 - 6 = **4994** (below entry for short)

---

## Field Relationships

### Entry Price (Required for Points-Based SL/TP)
- **When to use**: Always calculate actual SL/TP prices
- **Validation**: Required if you enter SL Points or TP Points
- **Error**: "Entry price is required when using points-based SL/TP"

### Stop Loss Price vs Stop Loss Points
- **SL Price**: Direct price level where position is closed
- **SL Points**: Points to deduct from entry price
- **Note**: Enter EITHER price OR points, not both

### Target Price vs Target Points
- **TP Price**: Direct price level for profit target
- **TP Points**: Points to add to entry price
- **Note**: Enter EITHER price OR points, not both

---

## Validation Rules

### Required Fields
- ✅ Symbol (required)
- ✅ Entry Time (required)
- ✅ Exit Time (required)
- ✅ Exit Time > Entry Time (validated)

### Result-Dependent Validation
When you select a result type:

**Manual Exit**
- Required: Manual Amount (P&L in currency)

**Take Profit (TP)**
- Required: Target Price (direct price level)

**Stop Loss (SL)**
- Required: Stop Loss Price (direct price level)

### Points-Based Validation
When you enter SL Points or TP Points:
- Required: Entry Price
- SL Points must be positive
- TP Points must be positive

---

## Example Trade Entry

### Scenario: EUR/USD Long Trade

```
Symbol:           EUR/USD
Entry Time:       2024-12-10 08:00
Exit Time:        2024-12-10 16:30
Direction:        Buy
Entry Price:      1.0865
Result:           TP

Option 1 - Price Based:
  Stop Loss Price:  1.0855 (10 pips)
  Target Price:     1.0885 (20 pips)
  Risk/Reward:      1:2

Option 2 - Points Based:
  Stop Loss Points: 10
  Target Points:    20
  (Same as above - 1.0865 - 0.0010 = 1.0855, etc)
```

---

## Complete AddJournalDialog Calculation Examples

### DETAILED EXAMPLE 1: Long Trade with Points-Based SL/TP

#### Input Form Data:
```
Symbol:                EUR/USD              ← Symbol field
Entry Time:            2024-12-10 08:00:00  ← Entry Time picker
Exit Time:             2024-12-10 16:30:00  ← Exit Time picker
Direction:             Buy                  ← Direction dropdown
Session:               London               ← Session selection

Entry Price:           1.0865               ← Price field (decimal)
Stop Loss Points:      10                   ← SL Points field
Target Points:         20                   ← TP Points field
(Leave SL Price and TP Price empty)

Result:                TP                   ← Result dropdown
Setup Name:            Breakout             ← Setup selection
Setup Rating:          A                    ← Rating buttons (A-F)
Execution Type:        Market               ← Execution dropdown

Rule Followed:         ✓ (checked)          ← Checkbox
Confirmation:          ✓ (checked)          ← Checkbox
```

#### Calculations Performed:
```
1. DURATION CALCULATION:
   Entry: 2024-12-10 08:00:00
   Exit:  2024-12-10 16:30:00
   Duration = 8 hours 30 minutes (510 minutes)

2. POINTS → PRICE CONVERSION:
   Entry Price = 1.0865
   Direction = Buy (Long)
   
   For Long Trades:
   SL Price = Entry Price - SL Points
   SL Price = 1.0865 - 0.0010 = 1.0855
   (10 points = 0.0010 in EUR/USD, depends on currency pair)
   
   TP Price = Entry Price + TP Points
   TP Price = 1.0865 + 0.0020 = 1.0885
   (20 points = 0.0020 in EUR/USD)

3. RISK/REWARD RATIO:
   Risk = Entry - SL = 1.0865 - 1.0855 = 10 pips
   Reward = TP - Entry = 1.0885 - 1.0865 = 20 pips
   R:R Ratio = 20/10 = 2:1 (good risk/reward)

4. VALIDATION RESULTS:
   ✓ Symbol required: ✓ EUR/USD provided
   ✓ Entry Time required: ✓ 08:00 provided
   ✓ Exit Time required: ✓ 16:30 provided
   ✓ Exit > Entry: ✓ 16:30 > 08:00
   ✓ Result = TP: ✓ Target Price required
   ✓ Entry Price required for points: ✓ 1.0865 provided
   ✓ SL Points > 0: ✓ 10 > 0
   ✓ TP Points > 0: ✓ 20 > 0
```

#### Stored in Database:
```sql
INSERT INTO journal_entries (
  user_id,
  symbol,
  entry_at,
  exit_at,
  duration_minutes,
  direction,
  entry_price,
  stop_loss_price,
  stop_loss_points,
  target_price,
  target_points,
  result,
  setup_name,
  setup_rating,
  rule_followed,
  confirmation
) VALUES (
  'user_123',
  'EUR/USD',
  '2024-12-10T08:00:00',
  '2024-12-10T16:30:00',
  510,
  'Buy',
  1.0865,
  1.0855,        ← Calculated from entry - SL points
  10,
  1.0885,        ← Calculated from entry + TP points
  20,
  'TP',
  'Breakout',
  'A',
  true,
  true
);
```

---

### DETAILED EXAMPLE 2: Short Trade with Points-Based SL/TP

#### Input Form Data:
```
Symbol:                GBPUSD               ← Symbol field
Entry Time:            2024-12-10 14:00:00  ← Entry Time picker
Exit Time:             2024-12-10 14:45:00  ← Exit Time picker
Direction:             Sell                 ← Direction dropdown (SHORT)
Entry Price:           1.2750               ← Price field

Stop Loss Points:      15                   ← SL Points field
Target Points:         30                   ← TP Points field

Result:                TP                   ← Result dropdown
```

#### Calculations for SHORT Trade:
```
1. DURATION:
   Entry: 2024-12-10 14:00:00
   Exit:  2024-12-10 14:45:00
   Duration = 45 minutes

2. POINTS → PRICE CONVERSION (SHORT):
   Entry Price = 1.2750
   Direction = Sell (Short)
   
   For Short Trades:
   SL Price = Entry Price + SL Points
   SL Price = 1.2750 + 0.0015 = 1.2765
   (SL is ABOVE entry for shorts - protective buy level)
   
   TP Price = Entry Price - TP Points
   TP Price = 1.2750 - 0.0030 = 1.2720
   (TP is BELOW entry for shorts - profit taking level)

3. RISK/REWARD:
   Risk = SL - Entry = 1.2765 - 1.2750 = 15 pips
   Reward = Entry - TP = 1.2750 - 1.2720 = 30 pips
   R:R Ratio = 30/15 = 2:1 (same 2:1 ratio, opposite direction)

4. VALIDATION:
   ✓ Exit > Entry (time): ✓ 14:45 > 14:00
   ✓ Entry Price for SL/TP points: ✓ 1.2750
   ✓ SL Points positive: ✓ 15 > 0
   ✓ TP Points positive: ✓ 30 > 0
```

---

### DETAILED EXAMPLE 3: Price-Based SL/TP (No Points)

#### Input Form Data:
```
Symbol:                XAUUSD               ← Gold
Entry Time:            2024-12-10 09:30:00
Exit Time:             2024-12-10 11:15:00
Direction:             Buy
Entry Price:           2050.50              ← Awareness only (not required)

Stop Loss Price:       2045.25              ← Direct price level
Target Price:          2060.75              ← Direct price level
(Leave SL Points and TP Points empty)

Result:                TP
```

#### Calculations:
```
1. DURATION:
   Entry: 2024-12-10 09:30:00
   Exit:  2024-12-10 11:15:00
   Duration = 1 hour 45 minutes (105 minutes)

2. NO POINT CONVERSION NEEDED:
   SL Price = 2045.25 (direct entry)
   TP Price = 2060.75 (direct entry)
   
   Implied Points (for reference):
   SL Points = Entry - SL = 2050.50 - 2045.25 = 5.25 points
   TP Points = TP - Entry = 2060.75 - 2050.50 = 10.25 points

3. RISK/REWARD:
   Risk = 5.25 points
   Reward = 10.25 points
   R:R Ratio = 10.25/5.25 ≈ 1.95:1

4. VALIDATION:
   ✓ Symbol: ✓ XAUUSD
   ✓ Times: ✓ Valid
   ✓ Result = TP: ✓ Target Price required: 2060.75 ✓
   ✗ Entry Price for points: Not required (no points entered)
```

#### Storage:
```sql
INSERT INTO journal_entries (...) VALUES (
  'user_123',
  'XAUUSD',
  '2024-12-10T09:30:00',
  '2024-12-10T11:15:00',
  105,
  'Buy',
  2050.50,
  2045.25,        ← Direct price
  NULL,           ← No points used
  2060.75,        ← Direct price
  NULL,           ← No points used
  'TP',
  ...
);
```

---

### DETAILED EXAMPLE 4: Manual Exit (Different Validation Path)

#### Input Form Data:
```
Symbol:                EURUSD
Entry Time:            2024-12-10 10:00:00
Exit Time:             2024-12-10 12:30:00
Direction:             Buy
Entry Price:           1.0870

Stop Loss Points:      8                    ← Optional for reference
Target Points:         12                   ← Optional for reference

Result:                MANUAL               ← Different result type!
Manual Outcome:        Profit               ← Profit or Loss
Manual Amount:         150.50               ← P&L amount in USD
```

#### Calculations:
```
1. DURATION:
   Entry: 2024-12-10 10:00:00
   Exit:  2024-12-10 12:30:00
   Duration = 2 hours 30 minutes (150 minutes)

2. POINT CALCULATIONS (For reference/tracking):
   Entry Price = 1.0870
   If using points (optional):
   Implied SL = 1.0870 - 0.0008 = 1.0862
   Implied TP = 1.0870 + 0.0012 = 1.0882

3. MANUAL OUTCOME:
   Result = MANUAL (not automatic TP/SL)
   Outcome = Profit
   P&L Amount = $150.50
   
   No price-based validation needed!
   Manual amount is the actual profit/loss recorded

4. VALIDATION CHANGES:
   ✗ Target Price NOT required (Result = MANUAL)
   ✓ Manual Amount required: ✓ 150.50 provided
   ✓ Manual Outcome required: ✓ Profit selected
   Points optional (not validated for requirements)
```

#### Storage:
```sql
INSERT INTO journal_entries (...) VALUES (
  'user_123',
  'EURUSD',
  '2024-12-10T10:00:00',
  '2024-12-10T12:30:00',
  150,
  'Buy',
  1.0870,
  1.0862,        ← Calculated for reference
  8,
  1.0882,        ← Calculated for reference
  12,
  'MANUAL',      ← Different result type
  'Scalp',
  'B',
  true,
  true,
  'Profit',      ← Manual outcome
  150.50         ← Manual P&L amount
);
```

---

### DETAILED EXAMPLE 5: Stop Loss Hit (Different Validation)

#### Input Form Data:
```
Symbol:                GBPJPY
Entry Time:            2024-12-10 16:00:00
Exit Time:             2024-12-10 16:15:00
Direction:             Sell
Entry Price:           190.50

Stop Loss Points:      25                   ← Important for SL result

Result:                SL                   ← Result is Stop Loss
(Manual fields hidden - not applicable)
```

#### Calculations:
```
1. DURATION:
   Entry: 2024-12-10 16:00:00
   Exit:  2024-12-10 16:15:00
   Duration = 15 minutes

2. SL CALCULATION:
   Entry Price = 190.50
   Direction = Sell (Short)
   
   SL Price = Entry + SL Points (for short)
   SL Price = 190.50 + 0.25 = 190.75
   (Price level where stop loss was hit)

3. NO TARGET NEEDED:
   Result = SL (trade exited at stop loss)
   Target Price = Not required
   Target Points = Not used

4. VALIDATION (Result = SL):
   ✓ Entry Price: ✓ 190.50
   ✓ SL Price required: ✓ Calculated to 190.75
   ✓ SL Points: ✓ 25 provided
   ✗ Target Price NOT required
   ✗ Target Points NOT required
   ✗ Manual Amount NOT required
```

#### Storage:
```sql
INSERT INTO journal_entries (...) VALUES (
  'user_123',
  'GBPJPY',
  '2024-12-10T16:00:00',
  '2024-12-10T16:15:00',
  15,
  'Sell',
  190.50,
  190.75,        ← Where SL was hit
  25,
  NULL,          ← No target
  NULL,
  'SL',          ← Result is Stop Loss
  'Mean Reversion',
  'C',
  false,         ← Rule not followed (hit SL)
  true
);
```

---

## Input Field Dependencies Matrix

### Which Fields Are Required?

| Result Type | Entry Price | SL Price/Points | TP Price/Points | Manual Amount |
|-------------|------------|-----------------|-----------------|---------------|
| **TP** | Optional* | Optional | ✓ Required | ✗ Not used |
| **SL** | Optional* | ✓ Required | ✗ Not used | ✗ Not used |
| **BREAKEVEN** | Optional* | Optional | ✗ Not used | ✗ Not used |
| **MANUAL** | Optional* | Optional | Optional | ✓ Required |

*Entry Price is required if using points-based SL/TP

---

## Real-Time Validation Flow

### When User Changes Form Data:

```
1. User enters/changes Symbol
   → Validates: Symbol not empty
   → Shows error: "Symbol is required" if empty

2. User enters/changes Entry Time
   → Validates: Entry time not empty AND format valid
   → Shows error: "Entry time is required" if empty

3. User enters/changes Exit Time
   → Validates: Exit > Entry, both valid times
   → Shows error: "Exit time must be after entry time" if invalid

4. User enters Stop Loss Points (e.g., 10)
   → Detects points-based SL/TP in use
   → Triggers Entry Price requirement
   → Shows error: "Entry price is required when using points-based SL/TP"
   → If SL Points < 0: shows error "Stop loss points must be positive"

5. User selects Result = "TP"
   → Requires Target Price
   → If target empty: shows error "Enter target price"
   → Enables Target Point field

6. User selects Result = "SL"
   → Requires Stop Loss Price
   → If SL empty: shows error "Enter stop loss price"
   → Disables Target fields

7. User selects Result = "MANUAL"
   → Hides price fields
   → Requires Manual Amount (currency)
   → Shows Manual Outcome dropdown (Profit/Loss)

8. User clicks Submit
   → Validates ALL required fields
   → Calculates points from prices if needed
   → Compresses/uploads images if provided
   → On success: Creates journal entry, shows toast
   → On error: Shows validation errors, highlights problem fields
```

---

## Database Calculations

### What Gets Calculated and Stored:

```sql
-- Calculated by System:
duration_minutes = EXTRACT(MINUTE FROM (exit_at - entry_at))
pnl_points = CASE direction
              WHEN 'Buy' THEN target_price - entry_price
              WHEN 'Sell' THEN entry_price - target_price
            END

-- If using points-based (entry_price + points):
stop_loss_price = CASE direction
                   WHEN 'Buy' THEN entry_price - stop_loss_points
                   WHEN 'Sell' THEN entry_price + stop_loss_points
                  END

target_price = CASE direction
                WHEN 'Buy' THEN entry_price + target_points
                WHEN 'Sell' THEN entry_price - target_points
               END

-- If result = MANUAL:
pnl_amount = manual_amount
pnl_outcome = manual_outcome (Profit/Loss)

-- If result = TP or SL (price-based):
pnl_amount = entry_quantity * (exit_price - entry_price) [approx]
pnl_outcome = CASE result
               WHEN 'TP' THEN 'Profit'
               WHEN 'SL' THEN 'Loss'
              END
```

---

## Validation Error Messages (Complete List)

```
Symbol Field:
  → "Symbol is required" (when empty)

Entry/Exit Time:
  → "Entry time is required" (when empty)
  → "Exit time is required" (when empty)
  → "Exit time must be after entry time" (if exit ≤ entry)

Stop Loss/Target Points:
  → "Entry price is required when using points-based SL/TP"
  → "Stop loss points must be positive" (if < 0)
  → "Target points must be positive" (if < 0)

Result-Dependent:
  → "Enter target price" (if Result = TP and target_price empty)
  → "Enter stop loss price" (if Result = SL and stop_loss_price empty)
  → "Enter manual P&L amount" (if Result = MANUAL and amount = 0)
```

---

## Useful


### Input Fields in Dialog
```
┌─────────────────────────────────────┐
│ Entry Price: [______1.0865_______]  │
│                                       │
│ Stop Loss Price: [____1.0855____]    │
│ OR                                    │
│ Stop Loss Points: [_____10_____]     │
│                                       │
│ Target Price: [_____1.0885_____]     │
│ OR                                    │
│ Target Points: [_____20_____]        │
└─────────────────────────────────────┘
```

---

## Calculation & Storage

### On Submit
1. If using points-based SL/TP and entry price exists:
   - Calculate actual prices from entry + points
   - Store both price and points in database
   - Database fields: `stop_loss_price`, `stop_loss_points`, `target_price`, `target_points`

2. If using price-based SL/TP:
   - Store prices directly
   - Points calculated as reference (price - entry = points)

3. Result field determines which values are required:
   - Manual: manualAmount
   - TP: target_price
   - SL: stop_loss_price

---

## Common Use Cases

### Day Trader - Quick Risk/Reward Setup
```
Entry: 100
Risk: 2 points (SL = 98)
Reward: 5 points (TP = 105)
Risk/Reward: 1:2.5
```
**Enter as**: SL Points: 2, TP Points: 5

### Swing Trader - Specific Price Levels
```
Entry: $50.25
Key Resistance: $52.10 (TP)
Key Support: $48.75 (SL)
```
**Enter as**: SL Price: 48.75, TP Price: 52.10

### Scalper - Minimal Points
```
Entry: 1.0900
Quick exit: +1 point TP, -0.5 point SL
```
**Enter as**: SL Points: 0.5, TP Points: 1.0

---

## Best Practices

✅ **DO**
- Use points for consistent risk management (e.g., always 2:1 ratio)
- Use prices when targeting specific support/resistance levels
- Enter entry price when using points-based SL/TP
- Be consistent within your trading strategy

❌ **DON'T**
- Mix and match points and prices for the same trade
- Enter SL/TP prices that contradict entry price for your trade direction
- Leave entry price empty if using points-based SL/TP
- Use negative points (system validates for positivity)

---

## Database Schema

```sql
-- Journal entries table includes:
stop_loss_price    DECIMAL(10,2)    -- Direct SL price if using price-based
stop_loss_points   DECIMAL(10,2)    -- SL offset from entry if using points-based
target_price       DECIMAL(10,2)    -- Direct TP price if using price-based
target_points      DECIMAL(10,2)    -- TP offset from entry if using points-based
entry_price        DECIMAL(10,2)    -- Entry price (required for points calculation)
result             VARCHAR(20)      -- 'TP', 'SL', 'BREAKEVEN', 'MANUAL'
```

---

**Last Updated**: December 10, 2025
**Component**: AddJournalDialog.tsx
**Status**: Points validation implemented with entry price dependency

---

## Integration: How AddJournal Data Flows to Dashboard & Performance

### Data Flow Architecture

```
AddJournalDialog (Form Input)
        ↓
   Validation & Calculation
        ↓
   Database Storage (Supabase)
        ↓
   ┌─────────────────────────────────┐
   │                                   │
   ↓                                   ↓
Dashboard Analytics            Performance Analytics
(JournalDashboard.tsx)        (Performance.tsx)
   ↓                                   ↓
Aggregate Statistics            Win Rate, Equity Curve
Win/Loss Count                  P&L by Setup, Time
Average P&L                     Risk Management Stats
```

---

## Dashboard Calculations (From AddJournal Data)

### 1. **Win/Loss Statistics**

#### How It's Calculated:

```
WINS = COUNT(journal_entries WHERE result = 'TP')
LOSSES = COUNT(journal_entries WHERE result = 'SL')
BREAKEVEN = COUNT(journal_entries WHERE result = 'BREAKEVEN')
MANUAL_PROFIT = COUNT(journal_entries WHERE result = 'MANUAL' AND manual_outcome = 'Profit')
MANUAL_LOSS = COUNT(journal_entries WHERE result = 'MANUAL' AND manual_outcome = 'Loss')

WIN_RATE = WINS / (WINS + LOSSES) * 100%

Example:
- User logged 50 trades
- 35 hit TP (result = 'TP')
- 12 hit SL (result = 'SL')
- 3 manual exits with profit
- 2 breakeven
- Win Rate = 35 / (35 + 12) = 35/47 = 74.5%
```

#### AddJournal Fields Used:
```
✓ result (TP/SL/BREAKEVEN/MANUAL)  - determines win or loss
✓ manual_outcome (Profit/Loss)     - for manual result classification
✓ symbol                           - for filtering by instrument
✓ entry_at, exit_at                - for date range filtering
```

---

### 2. **P&L Summary & Averages**

#### How It's Calculated:

```
-- For TP/SL/BREAKEVEN trades (price-based):
TRADE_PNL = entry_quantity * (exit_price - entry_price)
           OR APPROXIMATED FROM:
           = ROUND(target_points - stop_loss_points, 2)

-- For MANUAL trades:
TRADE_PNL = manual_amount (directly from form)

-- Aggregate Metrics:
TOTAL_PNL = SUM(all TRADE_PNL where result != 'BREAKEVEN')
AVERAGE_WIN = AVG(TRADE_PNL WHERE TRADE_PNL > 0)
AVERAGE_LOSS = AVG(TRADE_PNL WHERE TRADE_PNL < 0)
PROFIT_FACTOR = SUM(positive_pnl) / ABS(SUM(negative_pnl))

Example:
- Trade 1: TP with 50 points profit = +$500
- Trade 2: SL with 20 points loss = -$200
- Trade 3: MANUAL profit = +$150
- Trade 4: TP with 75 points = +$750
- Total P&L = $500 - $200 + $150 + $750 = $1,200
- Avg Win = ($500 + $150 + $750) / 3 = $466.67
- Avg Loss = -$200 / 1 = -$200
- Profit Factor = $1,400 / $200 = 7.0
```

#### AddJournal Fields Used:
```
✓ target_points, stop_loss_points   - for points-based P&L
✓ target_price, stop_loss_price     - for price-based P&L
✓ manual_amount                      - for manual P&L
✓ entry_quantity (if stored)         - for position sizing
✓ result                             - to filter trades
✓ entry_at, exit_at                  - for time filtering
```

---

### 3. **Daily/Weekly/Monthly Breakdown**

#### How It's Calculated:

```
GROUP BY DATE(entry_at) → Daily breakdown
GROUP BY DATE_TRUNC('week', entry_at) → Weekly breakdown
GROUP BY DATE_TRUNC('month', entry_at) → Monthly breakdown

For each time period:
  - Trade count
  - Win count & rate
  - Total P&L
  - Average P&L per trade
  - Largest win & loss
  - Equity change

Example Daily:
Date: 2024-12-10
├─ Trades: 5
├─ Wins: 3, Losses: 2
├─ Win Rate: 60%
├─ Total P&L: +$450
├─ Avg P&L: +$90
├─ Largest Win: +$250 (EUR/USD TP)
└─ Largest Loss: -$150 (GBPUSD SL)
```

#### AddJournal Fields Used:
```
✓ entry_at                  - date grouping
✓ symbol                    - trade details
✓ result                    - win/loss classification
✓ target_points, manual_amount - P&L calculation
```

---

### 4. **By Setup Analysis**

#### How It's Calculated:

```
GROUP BY setup_name → Analyze each trading setup separately

For each setup:
  - Setup name
  - Trade count for this setup
  - Win rate on this setup
  - Avg P&L on this setup
  - Best & worst trade
  - Total P&L from this setup

SQL Example:
SELECT 
  setup_name,
  COUNT(*) as trade_count,
  COUNT(CASE WHEN result = 'TP' THEN 1 END) as wins,
  AVG(pnl) as avg_pnl,
  SUM(pnl) as total_pnl
FROM journal_entries
GROUP BY setup_name
ORDER BY total_pnl DESC;

Results:
Setup: Breakout
├─ Trades: 25
├─ Wins: 18
├─ Win Rate: 72%
├─ Avg P&L: +$85
└─ Total P&L: +$2,125

Setup: Mean Reversion
├─ Trades: 15
├─ Wins: 9
├─ Win Rate: 60%
├─ Avg P&L: +$45
└─ Total P&L: +$675
```

#### AddJournal Fields Used:
```
✓ setup_name                - grouping trades by strategy
✓ setup_rating              - evaluate setup quality
✓ result                    - win/loss
✓ target_points, manual_amount - P&L
✓ rule_followed             - setup adherence tracking
```

---

### 5. **By Symbol/Instrument**

#### How It's Calculated:

```
GROUP BY symbol → Performance by currency pair, commodity, etc.

For each symbol:
  - Symbol name
  - Trade count
  - Win rate
  - Total P&L
  - Avg points per trade
  - Best timeframe for this symbol

Example:
Symbol: EUR/USD
├─ Trades: 45
├─ Wins: 32
├─ Win Rate: 71.1%
├─ Avg P&L: +$125
├─ Total P&L: +$5,625
├─ Avg Duration: 2.5 hours
└─ Best Time: 08:00-12:00 (London session)

Symbol: GBP/USD
├─ Trades: 20
├─ Wins: 12
├─ Win Rate: 60%
├─ Avg P&L: +$65
└─ Total P&L: +$1,300
```

#### AddJournal Fields Used:
```
✓ symbol                    - grouping trades
✓ session                   - trading session (London, NY, etc.)
✓ entry_at, exit_at         - duration & time analysis
✓ result, manual_amount     - P&L per symbol
✓ execution_type            - market/limit performance
```

---

## Performance Analytics Calculations

### 1. **Win Rate Tracking Over Time**

#### How It's Calculated:

```
For each time period (daily/weekly/monthly):
  Win Rate = Wins / (Wins + Losses) * 100%
  
Plot on chart:
  X-axis: Date/Week/Month
  Y-axis: Win Rate %
  
Shows: Is win rate improving, staying stable, or declining?

Example:
Week 1: 70% (21 wins, 9 losses)
Week 2: 65% (19 wins, 11 losses)
Week 3: 72% (23 wins, 9 losses)
Week 4: 68% (20 wins, 10 losses)

Trend: Stable around 68-72%, good consistency
```

#### AddJournal Fields Used:
```
✓ result (TP/SL/MANUAL)     - win/loss determination
✓ entry_at                  - time grouping
```

---

### 2. **Equity Curve (Account Growth)**

#### How It's Calculated:

```
Starting Balance = Account starting amount
For each trade chronologically (order by entry_at):
  Running Balance = Previous Balance + Trade P&L
  
Plot on chart:
  X-axis: Date/Trade Number
  Y-axis: Account Balance ($)
  
Shows: Account growth trajectory

Example (Starting: $10,000):
Trade 1 (+$500): Balance = $10,500
Trade 2 (-$200): Balance = $10,300
Trade 3 (+$750): Balance = $11,050
Trade 4 (+$150): Balance = $11,200
Trade 5 (-$400): Balance = $10,800

Equity Curve Line Graph:
$11,200 |     ╱╲    ╱
$11,050 |    ╱  ╲  ╱
$10,800 |   ╱    ╲╱
$10,500 | ╱
$10,000 |_

Key Metrics from Curve:
- Peak: $11,200 (best balance)
- Drawdown: $400 (from peak to lowest)
- Max Drawdown %: 3.6%
- Total Gain: +$800 (+8%)
- Volatility: measure of balance swings
```

#### AddJournal Fields Used:
```
✓ manual_amount OR         - direct P&L from manual trades
✓ target_points, stop_loss_points - calculated P&L
✓ entry_at, exit_at         - chronological ordering
✓ result                    - trade outcome
```

---

### 3. **P&L by Setup Type (Pie/Bar Chart)**

#### How It's Calculated:

```
GROUP BY setup_name, SUM(pnl)

For each setup:
  - Total P&L contributed
  - % of total P&L
  - Trade count
  - Win rate on setup

Example:
Total Account P&L: +$5,000

Breakout Setup:    +$3,200 (64%)  → 25 trades, 72% win rate
Mean Reversion:    +$1,500 (30%)  → 15 trades, 60% win rate
Scalp Setup:       +$200 (4%)     → 20 trades, 55% win rate
Reversal Setup:    -$900 (-18%)   → 10 trades, 40% win rate

Pie Chart:
┌─────────────────┐
│      ■ 64%      │ Breakout - Best performer
│    ■ 30%        │ Mean Reversion
│  ■ 4%  ■ -18%   │ Scalp, Reversal - Loss maker
└─────────────────┘
```

#### AddJournal Fields Used:
```
✓ setup_name                - grouping by strategy
✓ setup_rating              - quality of each setup
✓ manual_amount             - P&L tracking
✓ target_points, etc.       - calculated P&L
✓ rule_followed             - adherence to setup rules
```

---

### 4. **Risk/Reward Analysis**

#### How It's Calculated:

```
For profitable trades:
  Avg Win = Average P&L of winning trades
  
For losing trades:
  Avg Loss = Average P&L of losing trades
  
Risk/Reward Ratio = Avg Win / ABS(Avg Loss)

Profit Factor = Total Winning P&L / Total Losing P&L

Example:
50 Trades Total:
- 35 Wins averaging +$120 each = +$4,200 total
- 15 Losses averaging -$80 each = -$1,200 total

Metrics:
├─ Avg Win: $120
├─ Avg Loss: -$80
├─ R/R Ratio: 120 / 80 = 1.5:1
├─ Profit Factor: $4,200 / $1,200 = 3.5
└─ Expectancy: (35/50 × $120) - (15/50 × $80) = $84 - $24 = $60 per trade

Interpretation:
- 1.5:1 R/R ratio = winning $1.50 for every $1 risked (good)
- 3.5 profit factor = earning $3.50 for every $1 lost (excellent)
- $60 expectancy = expected profit per trade
```

#### AddJournal Fields Used:
```
✓ stop_loss_price, stop_loss_points - risk amount
✓ target_price, target_points       - reward amount
✓ manual_amount                     - actual P&L
✓ result                            - win/loss determination
✓ entry_price                       - position sizing context
```

---

### 5. **Time-Based Performance Heatmap**

#### How It's Calculated:

```
GROUP BY HOUR(entry_at), DAY(entry_at)

Create 2D grid:
  X-axis: Hour of Day (0-23 or AM/PM)
  Y-axis: Day of Week (Mon-Sun)
  Cell Value: Win Rate % for that hour/day combo

Heat colors:
  Green (70%+): Best trading times
  Yellow (50-70%): Average
  Red (<50%): Worst trading times

Example Grid:
       Mon  Tue  Wed  Thu  Fri
8am    ■75% ■72% ■80% ■68% ■76%    (London Open - Good)
9am    ■71% ■69% ■74% ■65% ■72%
10am   ■68% ■70% ■72% ■67% ■71%
...
12pm   ■62% ■64% ■66% ■60% ■68%
...
3pm    ■58% ■55% ■62% ■54% ■65%    (Slower period)
...
7pm    ■72% ■75% ■71% ■73% ■77%    (US Open - Good)

Insights:
✓ Best: Mon-Fri mornings (London open)
✓ Best: Wed evenings (US open)
✗ Worst: Tuesday-Thursday afternoons
→ Action: Trade more during peak hours
```

#### AddJournal Fields Used:
```
✓ entry_at                  - time extraction
✓ result                    - win/loss for heatmap
✓ symbol, session           - context on trading times
```

---

### 6. **Drawdown & Recovery Analysis**

#### How It's Calculated:

```
Drawdown = Peak Balance - Current Balance
Drawdown % = (Peak Balance - Current Balance) / Peak Balance × 100%

For equity curve:
  Peak = Highest balance reached
  Trough = Lowest balance after peak
  Recovery = Return from trough back to peak

Example:
Peak Balance: $12,000 (achieved on day 10)
Current: $10,500 (day 25)
Trough: $9,800 (day 18)

Drawdown: $12,000 - $10,500 = -$1,500
Drawdown %: -1,500 / 12,000 = -12.5%
Recovery: Days from $9,800 back to $12,000 = 7 days

Metrics Used for Risk Assessment:
├─ Max Drawdown: Largest peak-to-trough decline
├─ Current Drawdown: From highest to current
├─ Recovery Time: Days to recover from max drawdown
└─ Calmar Ratio: Annual Return / Max Drawdown
    (Higher is better - more return with less drawdown)
```

#### AddJournal Fields Used:
```
✓ manual_amount, calculated P&L - balance tracking
✓ entry_at, exit_at             - chronological order
✓ result                        - trade outcome
```

---

## Complete Data Flow Example

### Scenario: User Trades EUR/USD with Breakout Setup

#### Step 1: User Fills AddJournal Form
```
Symbol: EUR/USD ✓
Entry Time: 2024-12-10 08:15 ✓
Exit Time: 2024-12-10 10:45 ✓
Duration: 2h 30m (calculated)

Direction: Buy
Entry Price: 1.0865
Stop Loss Points: 10
Target Points: 20

Result: TP ✓ (Hits target)
Setup Name: Breakout
Setup Rating: A
Rule Followed: ✓
Confirmation: ✓

→ Form Validated: ALL REQUIRED FIELDS OK
→ Calculations:
  - SL Price = 1.0865 - 0.0010 = 1.0855
  - TP Price = 1.0865 + 0.0020 = 1.0885
  - Risk: 10 pips
  - Reward: 20 pips
  - R/R: 2:1
```

#### Step 2: Data Stored in Database
```sql
INSERT INTO journal_entries (
  user_id, symbol, entry_at, exit_at, duration_minutes,
  direction, entry_price, stop_loss_price, stop_loss_points,
  target_price, target_points, result,
  setup_name, setup_rating, rule_followed, confirmation
) VALUES (
  'user_123', 'EUR/USD', '2024-12-10T08:15:00', '2024-12-10T10:45:00', 150,
  'Buy', 1.0865, 1.0855, 10,
  1.0885, 20, 'TP',
  'Breakout', 'A', true, true
);
```

#### Step 3: Dashboard Updates in Real-Time
```
Journal Dashboard Refresh:

Trade Statistics:
├─ Total Trades: 50 → 51 (+1)
├─ Wins: 35 → 36 (+1 new TP)
├─ Losses: 12 (unchanged)
├─ Breakeven: 3 (unchanged)
└─ Win Rate: 74.5% → 75.0% ✓ (improved)

Daily Breakdown (2024-12-10):
├─ Today's Trades: 4 → 5
├─ Today's Wins: 3 → 4
├─ Today's Win Rate: 75% → 80%
├─ Today's P&L: +$320 → +$570 ✓

By Setup (Breakout):
├─ Breakout Trades: 24 → 25
├─ Breakout Wins: 17 → 18
├─ Breakout Win Rate: 70.8% → 72% ✓
├─ Breakout Total P&L: +$1,950 → +$2,170 ✓

By Symbol (EUR/USD):
├─ EUR/USD Trades: 18 → 19
├─ EUR/USD Wins: 13 → 14
├─ EUR/USD Win Rate: 72.2% → 73.7%
├─ EUR/USD Total P&L: +$2,850 → +$3,050 ✓
```

#### Step 4: Performance Tab Updates
```
Equity Curve:
├─ Previous Balance: $12,850
├─ New Trade P&L: +$200 (approx from 20 pips × lot size)
├─ New Balance: $13,050 ✓
└─ Chart Line extends upward

P&L by Setup Pie Chart:
├─ Breakout portion: 64% → 65% (increased)
└─ Other setups: adjusted proportionally

Win Rate Trend Line:
├─ Last 7 days: [70%, 72%, 71%, 73%, 75%, 78%, 80%]
└─ Upward trend visible ✓

R/R Heatmap:
├─ EUR/USD 08:00-11:00 slot: marked in bright green
└─ This time/symbol combo showing strong results

Risk Analysis:
├─ Profit Factor: 3.2 → 3.25 (improved)
├─ Avg Win: $112 → $115 (improved)
└─ Current Drawdown: -8% → -6% (recovery in progress)
```

---

## Summary Table: AddJournal Fields → Dashboard/Performance Metrics

| AddJournal Field | Dashboard Use | Performance Use |
|------------------|---------------|-----------------|
| **symbol** | By-Symbol stats | Symbol heatmap, P&L breakdown |
| **entry_at** | Daily/Weekly grouping | Equity curve, Time heatmaps |
| **exit_at** | Duration calculation | Session analysis |
| **direction** | Trade type stats | Bias analysis (long vs short) |
| **entry_price** | Points calculation | Risk context, scaling |
| **stop_loss_price/points** | Risk tracking | Drawdown, R/R calculations |
| **target_price/points** | Reward tracking | Expected P&L, R/R ratio |
| **result** | Win/Loss counts | Win rate, metrics |
| **manual_amount** | P&L totals | Equity curve, P&L tracking |
| **setup_name** | By-Setup breakdown | Setup performance, ROI |
| **setup_rating** | Rating trends | Setup quality analysis |
| **rule_followed** | Discipline tracking | Rule adherence metrics |
| **confirmation** | Confidence analysis | High-confidence trade stats |
| **session** | Session performance | Time-of-day analysis |
| **execution_type** | Market/Limit stats | Slippage, execution quality |

---

**Integration Status**: ✅ Complete
**Last Updated**: December 10, 2025
**Documentation**: Comprehensive AddJournal → Dashboard → Performance Flow
