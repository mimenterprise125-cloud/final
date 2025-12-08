# Mobile Calendar View Implementation

## Overview
The calendar now has responsive behavior that optimizes the display for mobile and desktop devices.

## Features

### Mobile View (< 768px / sm breakpoint)
- **Calendar displays only:**
  - Date number (top)
  - P&L value (bottom)
  
- **On click:** Shows a modal with:
  - Formatted date (e.g., "Mon, Dec 8")
  - Number of trades on that date
  - P&L for that date (with color coding)
  - "View Journal" button to navigate to the journal page for that date
  - "Close" button to dismiss modal

### Desktop View (≥ 768px / sm breakpoint)
- **Calendar displays:**
  - Date number
  - Number of trades
  - P&L value
  
- **On click:** Directly navigates to `/dashboard/journal?date=YYYY-MM-DD`

## Technical Implementation

### State Management
```typescript
const [mobileModalData, setMobileModalData] = useState<{ 
  date: string; 
  trades: number; 
  pnl: number 
} | null>(null);
```

### MonthlyView Component Changes
- Added `onMobileSelect` callback prop: `(date: string, trades: number, pnl: number) => void`
- Updated calendar cell rendering:
  - `hidden sm:block` - Desktop content (all info)
  - `sm:hidden` - Mobile content (date + P&L only)
  - Click handler checks `window.innerWidth < 768` to determine action

### Mobile Modal Dialog
- Uses `AlertDialog` component from UI library
- Displays date, trade count, and P&L
- Color-coded P&L: green for positive, red for negative
- Two action buttons:
  - "Close" - Dismisses modal
  - "View Journal" - Navigates to journal with date parameter

## UI/UX Benefits

✅ **Mobile-Optimized:** Cleaner, less cluttered mobile view
✅ **Contextual Information:** Users see detailed info before navigating
✅ **Touch-Friendly:** Larger, easier-to-tap calendar cells on mobile
✅ **Consistent Navigation:** Both paths lead to the same journal page
✅ **Responsive Breakdown:** Automatically adapts at 768px breakpoint

## Code Examples

### Calendar Cell Structure
```tsx
{/* Desktop view: Show all info */}
<div className="hidden sm:block">
  {/* Date, trades, P&L */}
</div>

{/* Mobile view: Show only date and P&L */}
<div className="sm:hidden flex flex-col justify-between h-full">
  {/* Date and P&L only */}
</div>
```

### Click Handler
```tsx
onClick={() => {
  if (window.innerWidth < 768 && onMobileSelect) {
    // Mobile: show modal with details
    onMobileSelect(c.date, c.trades.length, c.total);
  } else if (onOpenDay) {
    // Desktop: navigate directly
    onOpenDay(c.date);
  }
}}
```

## Files Modified
- `src/pages/dashboard/Dashboard.tsx`

## Browser Compatibility
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices and tablets
- Responsive breakpoint uses standard Tailwind `sm:` breakpoint (640px base, 768px with custom config)

## Testing Checklist
- [ ] Test calendar on mobile (< 768px)
  - [ ] Calendar cells show only date and P&L
  - [ ] Click on a cell opens modal
  - [ ] Modal shows date, trades, and P&L
  - [ ] "View Journal" button navigates correctly
  - [ ] "Close" button dismisses modal
  
- [ ] Test calendar on desktop (≥ 768px)
  - [ ] Calendar cells show date, trades, and P&L
  - [ ] Click on a cell navigates directly to journal
  - [ ] No modal appears

- [ ] Test responsive transition
  - [ ] Behavior changes at 768px breakpoint
  - [ ] Smooth transition between mobile and desktop
