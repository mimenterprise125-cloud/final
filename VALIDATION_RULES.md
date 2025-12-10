# AddJournalDialog Validation Rules (December 10, 2025)

## Complete Validation Logic

### 1. REQUIRED FIELDS (All except entry_at, exit_at)

These fields MUST be filled:

| Field | Error Message |
|-------|---------------|
| **symbol** | Symbol is required * |
| **entry_price** | Entry price is required * |
| **direction** | Direction (Buy/Sell) is required * |
| **session** | Session is required * |
| **setup_name** | Setup name is required * |
| **setup_rating** | Setup rating (A-F) is required * |
| **execution_type** | Execution type is required * |
| **result** | Result type is required * |

**OPTIONAL Fields:**
- entry_at (Entry time) - Optional
- exit_at (Exit time) - Optional

---

## 2. DIRECTION-BASED PRICE VALIDATION

### BUY TRADE RULES

```
Entry Price: 4650
├─ Stop Loss must be BELOW 4650 (e.g., 4640, 4630)
├─ Target must be ABOVE 4650 (e.g., 4660, 4670)
└─ Risk/Reward: SL < Entry < TP
```

#### Examples:
```
BUY at 4650:
✅ SL = 4640, TP = 4670  → Valid (4640 < 4650 < 4670)
❌ SL = 4660, TP = 4670  → INVALID (SL must be BELOW 4650)
❌ SL = 4640, TP = 4640  → INVALID (TP must be ABOVE 4650)
```

#### Validation Messages:
- SL too high: `"Stop loss (4660) must be BELOW entry price (4650) for Buy trades"`
- TP too low: `"Target (4650) must be ABOVE entry price (4650) for Buy trades"`

---

### SELL TRADE RULES

```
Entry Price: 4650
├─ Stop Loss must be ABOVE 4650 (e.g., 4660, 4670)
├─ Target must be BELOW 4650 (e.g., 4640, 4630)
└─ Risk/Reward: TP < Entry < SL
```

#### Examples:
```
SELL at 4650:
✅ SL = 4660, TP = 4630  → Valid (4630 < 4650 < 4660)
❌ SL = 4640, TP = 4630  → INVALID (SL must be ABOVE 4650)
❌ SL = 4660, TP = 4660  → INVALID (TP must be BELOW 4650)
```

#### Validation Messages:
- SL too low: `"Stop loss (4640) must be ABOVE entry price (4650) for Sell trades"`
- TP too high: `"Target (4660) must be BELOW entry price (4650) for Sell trades"`

---

## 3. POINTS-BASED VALIDATION

### BUY TRADE (Points-Based)

```
Entry Price: 4650
SL Points: 10
TP Points: 20

Calculation:
SL Price = Entry - SL Points = 4650 - 10 = 4640 ✓ (Below entry)
TP Price = Entry + TP Points = 4650 + 20 = 4670 ✓ (Above entry)
```

**Validation:**
- SL Points cannot exceed Entry Price
- If SL Points = 15 and Entry = 10 → Error: `"Stop loss points (15) cannot exceed entry price (10) for Buy trades"`

---

### SELL TRADE (Points-Based)

```
Entry Price: 4650
SL Points: 15
TP Points: 25

Calculation:
SL Price = Entry + SL Points = 4650 + 15 = 4665 ✓ (Above entry)
TP Price = Entry - TP Points = 4650 - 25 = 4625 ✓ (Below entry)
```

**Validation:**
- TP Points cannot exceed Entry Price
- If TP Points = 30 and Entry = 10 → Error: `"Target points (30) cannot exceed entry price (10) for Sell trades"`

---

## 4. RESULT-DEPENDENT VALIDATION

### Result = TP (Take Profit Hit)

**Required Fields:**
- ✓ symbol
- ✓ entry_price
- ✓ direction
- ✓ session
- ✓ setup_name
- ✓ setup_rating
- ✓ execution_type
- ✓ **target_price** ← Must be filled for TP result

**Error:** `"Target price is required *"`

---

### Result = SL (Stop Loss Hit)

**Required Fields:**
- ✓ symbol
- ✓ entry_price
- ✓ direction
- ✓ session
- ✓ setup_name
- ✓ setup_rating
- ✓ execution_type
- ✓ **stop_loss_price** ← Must be filled for SL result

**Error:** `"Stop loss price is required *"`

---

### Result = MANUAL (Manual Exit)

**Required Fields:**
- ✓ symbol
- ✓ entry_price
- ✓ direction
- ✓ session
- ✓ setup_name
- ✓ setup_rating
- ✓ execution_type
- ✓ **manual_amount** ← Must be filled
- ✓ **manual_outcome** ← Must be "Profit" or "Loss"

**Errors:**
- `"Manual P&L amount is required *"`
- `"Manual outcome (Profit/Loss) is required *"`

---

### Result = BREAKEVEN

**Required Fields:**
- ✓ symbol
- ✓ entry_price
- ✓ direction
- ✓ session
- ✓ setup_name
- ✓ setup_rating
- ✓ execution_type

**Note:** No additional fields required (trade exited at entry price)

---

## 5. TIMESTAMP VALIDATION

**Rule:** Exit time must be AFTER entry time (if both provided)

**Validation:**
```javascript
if (exit_at <= entry_at) {
  error: "Exit time must be after entry time"
}
```

**Example:**
- Entry: 2024-12-10 08:15
- Exit: 2024-12-10 10:45
- ✅ Valid (10:45 is after 08:15)

---

## 6. COMPLETE VALIDATION FLOW DIAGRAM

```
Form Submit
    ↓
[1] Check Required Fields
    ├─ symbol ✓
    ├─ entry_price ✓
    ├─ direction ✓
    ├─ session ✓
    ├─ setup_name ✓
    ├─ setup_rating ✓
    ├─ execution_type ✓
    └─ result ✓
    ↓ ALL REQUIRED? Continue
[2] Check Timestamps (if both provided)
    ├─ exit_at > entry_at ✓
    ↓ VALID? Continue
[3] Check Result-Dependent Fields
    ├─ IF result=TP → target_price required ✓
    ├─ IF result=SL → stop_loss_price required ✓
    ├─ IF result=MANUAL → manual_amount & manual_outcome required ✓
    ├─ IF result=BREAKEVEN → no additional fields ✓
    ↓ VALID? Continue
[4] Check Direction-Based Price Rules
    ├─ IF direction=BUY
    │  ├─ stop_loss_price < entry_price ✓
    │  └─ target_price > entry_price ✓
    ├─ IF direction=SELL
    │  ├─ stop_loss_price > entry_price ✓
    │  └─ target_price < entry_price ✓
    ↓ VALID? Continue
[5] Check Points Validation (if points provided)
    ├─ entry_price required for points ✓
    ├─ IF direction=BUY: SL points ≤ entry_price ✓
    ├─ IF direction=SELL: TP points ≤ entry_price ✓
    ↓ VALID? Continue
[6] ✅ ALL VALIDATIONS PASSED
    → Enable Save Button
    → Allow Form Submit
```

---

## 7. VALIDATION REFERENCE TABLE

| Scenario | Entry | Direction | SL Price | TP Price | Status |
|----------|-------|-----------|----------|----------|--------|
| **BUY 4650** | 4650 | Buy | 4640 | 4670 | ✅ Valid |
| **BUY 4650** | 4650 | Buy | 4660 | 4670 | ❌ SL too high |
| **BUY 4650** | 4650 | Buy | 4640 | 4640 | ❌ TP not above |
| **SELL 4650** | 4650 | Sell | 4660 | 4630 | ✅ Valid |
| **SELL 4650** | 4650 | Sell | 4640 | 4630 | ❌ SL too low |
| **SELL 4650** | 4650 | Sell | 4660 | 4660 | ❌ TP not below |
| **BUY Points** | 4650 | Buy | -10pts | +20pts | ✅ Valid (4640, 4670) |
| **SELL Points** | 4650 | Sell | +15pts | -25pts | ✅ Valid (4665, 4625) |

---

## 8. ERROR MESSAGES REFERENCE

### Required Field Errors
```
Symbol is required *
Entry price is required *
Direction (Buy/Sell) is required *
Session is required *
Setup name is required *
Setup rating (A-F) is required *
Execution type is required *
Result type is required *
Manual P&L amount is required *
Manual outcome (Profit/Loss) is required *
Target price is required *
Stop loss price is required *
```

### Direction-Based Price Errors
```
BUY TRADES:
"Stop loss (4660) must be BELOW entry price (4650) for Buy trades"
"Target (4640) must be ABOVE entry price (4650) for Buy trades"

SELL TRADES:
"Stop loss (4640) must be ABOVE entry price (4650) for Sell trades"
"Target (4660) must be BELOW entry price (4650) for Sell trades"
```

### Points-Based Errors
```
BUY TRADES:
"Stop loss points (15) cannot exceed entry price (10) for Buy trades"

SELL TRADES:
"Target points (30) cannot exceed entry price (10) for Sell trades"

BOTH:
"Entry price is required when using points-based SL/TP"
"Stop loss points must be positive"
"Target points must be positive"
```

### Timestamp Errors
```
"Exit time must be after entry time"
```

---

## 9. TESTING EXAMPLES

### Test Case 1: BUY Trade with Valid Prices
```
Symbol: EUR/USD
Direction: Buy
Entry Price: 1.0865
Stop Loss Price: 1.0855 (BELOW entry ✓)
Target Price: 1.0885 (ABOVE entry ✓)

Result: ✅ VALID - All validations pass
```

### Test Case 2: BUY Trade with Invalid SL
```
Symbol: EUR/USD
Direction: Buy
Entry Price: 1.0865
Stop Loss Price: 1.0875 (ABOVE entry ❌)
Target Price: 1.0885

Result: ❌ INVALID
Error: "Stop loss (1.0875) must be BELOW entry price (1.0865) for Buy trades"
```

### Test Case 3: SELL Trade with Points
```
Symbol: GBP/USD
Direction: Sell
Entry Price: 1.2750
SL Points: 15 (→ 1.2765, ABOVE entry ✓)
TP Points: 30 (→ 1.2720, BELOW entry ✓)

Result: ✅ VALID - Points-based calculation is correct
```

### Test Case 4: Manual Exit
```
Symbol: XAUUSD
Direction: Buy
Entry Price: 2500.00
Result: MANUAL
Manual Amount: 500.00
Manual Outcome: Profit

Result: ✅ VALID - No price validations needed for manual
```

---

**Last Updated:** December 10, 2025  
**Status:** All validations implemented and tested  
**Component:** AddJournalDialog.tsx (Lines 139-300+)
