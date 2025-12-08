# Calendar Color Coding System

## Overview
The calendar now uses color coding to clearly distinguish between different trading states on each date.

## Color Legend

### Desktop View
| State | Color | Display |
|-------|-------|---------|
| **No Trades** | Gray (slate-500) | Gray box with "No trades" label |
| **Profitable (P&L > 0)** | Green (emerald-500) | Green box with amount (e.g., "+$150.25") |
| **Loss (P&L < 0)** | Red (rose-500) | Red box with amount (e.g., "-$50.75") |

### Mobile View
| State | Color | Display |
|-------|-------|---------|
| **No Trades** | Neutral Gray (bg-card/30) | Gray box with date only |
| **Profitable (P&L > 0)** | Green (bg-emerald-500/20) | Green box with white date number |
| **Loss (P&L < 0)** | Red (bg-rose-500/20) | Red box with white date number |

## Visual Examples

### Desktop Calendar Cell (768px and above)
```
┌─────────────┐
│ 15          │  ← Date number (top)
│ 3 trades    │  ← Number of trades
│ +$250.50    │  ← P&L (green for profit, red for loss, gray for no trades)
└─────────────┘
```

### Mobile Calendar Cell (below 768px)
```
┌─────────────┐
│ 15          │  ← Only date visible
│             │  ← Box color indicates result
│ (Color)     │  ← Green/Red/Gray background
└─────────────┘
```

## Interaction

### Desktop (≥ 768px)
- Click on cell → Navigate directly to `/dashboard/journal?date=YYYY-MM-DD`
- Hover effect: Shadow and border color changes

### Mobile (< 768px)
- Click on cell → Shows modal with details:
  - Formatted date
  - Number of trades
  - P&L value
  - "View Journal" button to navigate
  - "Close" button to dismiss

## Technical Details

### Color Classes

**No Trades:**
- Desktop: `text-slate-500` (text)
- Mobile: `bg-card/30` border-border` (background)
- Text shows: "No trades"

**Profitable:**
- Desktop: `text-emerald-500` (text)
- Mobile: `bg-emerald-500/20` border-emerald-500/50` (background)
- P&L displays with "+" prefix

**Loss:**
- Desktop: `text-rose-500` (text)
- Mobile: `bg-rose-500/20` border-rose-500/50` (background)
- P&L displays with "-" prefix

## Benefits

✅ **Quick Visual Scan** - Users can instantly see trading performance by color
✅ **Mobile Optimized** - Colored boxes reduce clutter on small screens
✅ **Accessible** - Color coding combined with text labels for clarity
✅ **Consistent** - Same logic applies to all view types (monthly, weekly, yearly)
✅ **Clear Distinction** - Gray color clearly shows inactive days with no trades

## Implementation Files
- `src/pages/dashboard/Dashboard.tsx` - MonthlyView component

## Browser Compatibility
- All modern browsers
- Mobile and desktop devices
- Responsive at 768px breakpoint (Tailwind `sm:` breakpoint)
