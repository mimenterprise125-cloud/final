# Form Entry Guide - P&L Section

## How the P&L Section Works

### Step 1: Enter Entry Price
- **Field:** Entry Price (in the form above the P&L section)
- **Example:** `4650`

### Step 2: Enter SL/TP PRICES (Not Points!)
The form expects ACTUAL PRICE LEVELS, not point values.

#### Stop Loss Price Field
- **What to enter:** The actual price level where you want to exit on loss
- **Example:** If entry is 4650 and you risk 10 points down → Enter `4640`
- ❌ DON'T enter: `10` (the points value)
- ✅ DO enter: `4640` (the actual price level)

#### Target Price Field  
- **What to enter:** The actual price level where you want to take profit
- **Example:** If entry is 4650 and you want 20 points profit → Enter `4670`
- ❌ DON'T enter: `20` (the points value)
- ✅ DO enter: `4670` (the actual price level)

### Step 3: Check Auto-Calculated Points
Once you enter the prices, the form automatically calculates:
- **SL Points:** `|Entry Price - SL Price|` = `|4650 - 4640|` = `10 pts`
- **TP Points:** `|Entry Price - TP Price|` = `|4650 - 4670|` = `20 pts`

### Step 4: Enter Money Management Amount
- **Risk Amount ($$):** How much $ you're risking = `$100`
- **Profit Target ($$):** How much $ you want to profit = `$200`

### Example Trade

```
Entry Price:        4650
Stop Loss Price:    4640  (risk 10 points)
Target Price:       4670  (gain 20 points)
Risk Amount:        $100  (willing to lose)
Profit Target:      $200  (want to gain)
```

When you select Result = "TP" (Take Profit):
- **Realized Amount saved to DB:** $200 (from Profit Target field)
- **Realized Points saved to DB:** 20 (calculated from prices)

When you select Result = "SL" (Stop Loss):
- **Realized Amount saved to DB:** -$100 (negative, from Risk Amount field)
- **Realized Points saved to DB:** -10 (negative, calculated from prices)

---

## Common Mistake

❌ **WRONG:** Entering point values in Price fields
```
Stop Loss Price: 10     ← This is a point value, not a price!
Target Price:    20     ← This is a point value, not a price!
```

✅ **CORRECT:** Entering actual price levels
```
Stop Loss Price: 4640   ← This is the actual price level
Target Price:    4670   ← This is the actual price level
```

The form will auto-calculate the points from these prices!
