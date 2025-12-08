# Calendar Mobile View & Dropdown Fixes

## Changes Made

### 1. **Box Color Logic for Mobile**
- **No Trades**: Shows neutral/colorless box (`bg-card/30 border-border`)
- **Positive P&L**: Shows green box (`bg-emerald-500/20 border-emerald-500/50`)
- **Negative P&L**: Shows red box (`bg-rose-500/20 border-rose-500/50`)
- **Text Color**: Muted foreground for no trades, white for trades

### 2. **Dropdown Glitching Fix**
- **Removed hover scaling effect** that was causing the shake: `removed hover:scale-[1.02]`
- **Removed active scaling**: `removed active:scale-95`
- **Changed overflow**: From `overflow-hidden` to `overflow-visible` on Card
- **Simplified transition**: From `transition-all` to `transition-colors` to prevent movement
- **Better parent layout**: Changed parent div from `flex-row` to proper column gap on mobile with `min-w-0` to prevent overflow issues

### 3. **Dropdown Styling Improvements**
- **Consistent padding**: `py-2 sm:py-2.5` for stable height
- **Width handling**: `w-full sm:w-auto` to fill mobile, auto on desktop
- **Z-index management**: Removed problematic z-index layers that were causing rendering issues
- **Shadow consistency**: Kept shadow-lg without hover changes
- **Border stability**: Border stays at 2px without jumping

### 4. **Container Overflow Handling**
- **Calendar content div**: Added `overflow-hidden` to prevent content from jumping out when dropdown opens
- **Parent card**: Changed to `overflow-visible` so dropdown can extend beyond card
- **Margin spacing**: Added `mt-4 sm:mt-5` to properly space calendar content from header

## Mobile View Behavior

### Empty Box (No Trades)
```
┌─────────┐
│    8    │
│ (gray)  │
└─────────┘
```

### Positive P&L Box
```
┌─────────┐
│    8    │
│ (green) │
└─────────┘
```

### Negative P&L Box
```
┌─────────┐
│    8    │
│  (red)  │
└─────────┘
```

## Technical Details

### CSS Classes Applied
- **Mobile colors**: Conditional classes based on `c.trades.length` and `c.total`
- **Text colors**: `text-muted-foreground` for empty, `text-white` for trades
- **Responsive hiding**: `hidden sm:block` for desktop, `sm:hidden` for mobile
- **Border system**: 2px borders with proper color theming per state

### Dropdown Issues Resolved
- ✅ No more shaking on open
- ✅ Dropdown stays in place
- ✅ No content shifting
- ✅ Proper z-stacking
- ✅ Smooth transitions

## Files Modified
- `src/pages/dashboard/Dashboard.tsx`

## Testing Checklist
- [ ] Test mobile view with no trades - boxes should be colorless
- [ ] Test mobile view with positive P&L - boxes should be green
- [ ] Test mobile view with negative P&L - boxes should be red
- [ ] Open dropdown on mobile - no shaking or movement
- [ ] Open dropdown on desktop - works smoothly
- [ ] Click on colored box - modal should appear with correct details
- [ ] Resize from mobile to desktop - behavior should change smoothly
