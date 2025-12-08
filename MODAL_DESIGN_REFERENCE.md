# Add Trade Entry Modal - Quick Reference

## Modal Structure

```
┌─────────────────────────────────────────────┐
│  📊 Add Trade Entry                         │
│  Log your trade details to build...journal  │
├─────────────────────────────────────────────┤
│                                             │
│  📈 TRADE SETUP                             │
│  ┌──────────┬──────────┬──────────┐         │
│  │ Symbol   │ Entry    │ Exit     │         │
│  │ [select] │ [picker] │ [picker] │         │
│  └──────────┴──────────┴──────────┘         │
│  ┌──────────┬──────────┐                    │
│  │Direction │ Duration │                    │
│  │[Buy/Sell]│ 2h 15m   │                    │
│  └──────────┴──────────┘                    │
│                                             │
│  ⚙️ TRADE PARAMETERS                        │
│  ┌──────────┬────────┬──────────┐           │
│  │Session   │Execute │Result ✅ │          │
│  │[dropdown]│[dropdown][TP/SL]  │           │
│  └──────────┴────────┴──────────┘           │
│  ┌─────────────────────────────┐            │
│  │Setup Pattern                │            │
│  │[Tag] [Tag] [Add more...]    │            │
│  └─────────────────────────────┘            │
│  [B] [B+] [A-] [A] [A+]                     │
│                                             │
│  💰 P&L & RISK                              │
│  ┌──────────────┬──────────────┐            │
│  │Stop Loss $$  │Target $$ ✓   │            │
│  │[red input]   │[green input]  │           │
│  └──────────────┴──────────────┘            │
│  ┌──────────────┬──────────────┐            │
│  │Stop Loss pts │Target pts ✓  │            │
│  │[red input]   │[green input]  │           │
│  └──────────────┴──────────────┘            │
│                                             │
│  ✅ TRADE QUALITY                           │
│  ┌──────────────────────┬───────────────┐   │
│  │☑ Followed rules      │☑ Had confirm  │   │
│  └──────────────────────┴───────────────┘   │
│  ┌─────────────────────────────────────┐    │
│  │Loss Reason (if SL)                  │    │
│  │[dropdown/input]                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📝 NOTES & EVIDENCE                        │
│  ┌─────────────────────────────────────┐    │
│  │Trade Notes                          │    │
│  │[Textarea - 6 lines]                 │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │📷 Screenshots - Click to upload      │    │
│  │[Preview Grid - 4 columns]           │    │
│  │[Thumb] [Thumb] [Thumb] [Thumb]     │    │
│  │  (hover to delete)                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│ [Cancel]                       [Add Entry]  │
└─────────────────────────────────────────────┘
```

## Color Scheme

### Primary Actions
```
Gradient: blue-400 → teal-400
Hover: darker gradient with shadow
Example: "Add Entry" button
```

### Risk Indicators (P&L Section)
```
Stop Loss:
  Text: text-rose-400
  Border: border-rose-400/30
  Focus: focus:ring-rose-400/50
Target:
  Text: text-emerald-400
  Border: border-emerald-400/30
  Focus: focus:ring-emerald-400/50
```

### Section Headers
```
Emoji + Text + Color (Accent)
Examples:
  📈 Trade Setup
  ⚙️ Trade Parameters
  💰 P&L & Risk
  ✅ Trade Quality
  📝 Notes & Evidence
```

### Interactive Elements
```
Inputs: bg-background/50, border-border/50
Sections: bg-background/40, border-border/30
Hover: border → accent/50, transitions smooth
Focus: ring-2 ring-accent focus:border-accent
```

## Input Styling Pattern

```jsx
<div className="flex flex-col space-y-2">
  <Label className="text-xs font-semibold text-muted-foreground">
    Label Text
  </Label>
  <input 
    className="h-10 px-3 text-sm 
      bg-background/50 
      border border-border/50 
      rounded-lg 
      focus:outline-none 
      focus:ring-2 focus:ring-accent 
      focus:border-accent"
    placeholder="Placeholder..."
  />
</div>
```

## Form Flow

1. **Trade Identification** → Symbol, Time (Entry/Exit), Direction
2. **Trade Context** → Session, Execution Type, Result
3. **Setup Details** → Pattern, Rating
4. **Risk Parameters** → Stop Loss, Target (both $$ and points)
5. **Trade Quality** → Rules, Confirmation, Reason (if loss)
6. **Documentation** → Notes, Screenshots

## Key Design Principles

✅ **Symmetry**: Consistent grid layouts (3-col, 2-col, 1-col per section)
✅ **Visual Hierarchy**: Section headers with emojis and accents
✅ **Color Coding**: Red for risk, Green for profit, Teal for accents
✅ **Spacing**: Consistent gaps (gap-4), padding (p-5), space (space-y-4)
✅ **Feedback**: Hover effects, focus rings, smooth transitions
✅ **Accessibility**: Labels connected to inputs, clear focus states
✅ **Responsive**: Max-width 2xl, proper mobile spacing
✅ **Modern**: Glass effects, rounded corners, subtle shadows

## Component Dependencies

```
AddJournalDialog
├── Dialog (shadcn)
├── DialogContent (glass-strong)
├── DialogHeader
├── DialogTitle (gradient text)
├── DialogDescription
├── Label (shadcn)
├── Input (shadcn)
├── Textarea (shadcn)
├── Button (shadcn)
├── Popover (for symbol add)
│   ├── PopoverTrigger
│   └── PopoverContent
└── DialogFooter
    ├── Cancel Button
    └── Submit Button
```

## Animation & Transitions

```
Fade-in on Load:
  - Header: initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  - Delay staggering for depth

Hover Effects:
  - All inputs: transition-colors
  - All buttons: hover:bg-accent/20
  - Delete buttons: opacity-0 group-hover:opacity-100

Focus States:
  - Ring color: focus:ring-accent
  - Border color: focus:border-accent
  - Duration: 200ms smooth
```

