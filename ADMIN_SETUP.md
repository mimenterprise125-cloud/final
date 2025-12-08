# Admin System Setup Guide

## Quick Start

### Step 1: Run Database Setup
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **+ New Query**
5. Copy & paste the contents of `supabase/admin_setup.sql`
6. Click **Run**

### Step 2: Access Admin Panel
- Navigate to `http://yoursite.com/#/admin`
- You must be logged in (uses AuthGuard)
- You'll see the admin dashboard

### Step 3: Configure Your Settings

#### Enable Maintenance Mode
```
Admin → Maintenance → "Enable Maintenance Mode"
```
All users will now see the maintenance page.

#### Lock Features
```
Admin → Features → Lock PropFirm / Lock Journal
```
Users visiting locked sections see "Under Development" message.

#### Configure Pricing
```
Admin → Pricing → "Enable Pricing"
```
Define pricing tiers and locked sections per tier.

#### Monitor Errors
```
Admin → Errors
```
View all logged errors with severity levels and stack traces.

#### Manage Users
```
Admin → Users
```
See user statistics and analytics.

## Integration Checklist

- [ ] Run database migration (admin_setup.sql)
- [ ] Verify AdminProvider wraps App in App.tsx
- [ ] Test /admin route loads successfully
- [ ] Wrap PropFirm in FeatureGuard
- [ ] Wrap Journal in FeatureGuard
- [ ] Add error reporting to catch blocks
- [ ] Test maintenance mode toggle
- [ ] Test feature locks

## File Checklist

✅ Created Files:
- `src/lib/AdminContext.tsx` - Admin state & API
- `src/hooks/useErrorReporting.ts` - Error reporting hook
- `src/components/UnderDevelopment.tsx` - Locked section UI
- `src/components/FeatureGuard.tsx` - Feature access wrapper
- `src/pages/Admin.tsx` - Admin dashboard
- `src/pages/UnderMaintenance.tsx` - Maintenance page
- `supabase/admin_setup.sql` - Database schema
- `ADMIN_SYSTEM.md` - Full documentation

✅ Modified Files:
- `src/App.tsx` - Added routes & AdminProvider

## Usage Example

### Wrap a Protected Feature
```tsx
import FeatureGuard from '@/components/FeatureGuard';
import TradingJournal from './pages/dashboard/TradingJournal';

export default function JournalRoute() {
  return (
    <FeatureGuard feature="journal">
      <TradingJournal />
    </FeatureGuard>
  );
}
```

### Report Errors
```tsx
import { useErrorReporting } from '@/hooks/useErrorReporting';

export function MyComponent() {
  const { reportError } = useErrorReporting();
  
  const handleAction = async () => {
    try {
      // Do something
    } catch (error) {
      await reportError(
        'Failed to process',
        'high',
        '/my-page',
        error?.stack
      );
    }
  };
  
  return <button onClick={handleAction}>Do Action</button>;
}
```

## Admin Panel Tabs

### 📊 Overview
Quick stats: total users, errors, maintenance status, pricing status

### 🚨 Errors
View all error logs filtered by severity, timestamp, page, user

### 👥 Users
User analytics: total, premium, free, inactive user counts

### 💰 Pricing
Enable/disable pricing system, manage pricing tiers

### 🔒 Features
Lock/unlock PropFirm and Journal sections

### ⚡ Maintenance
Enable/disable website-wide maintenance mode

## Troubleshooting

**Admin page shows loading forever?**
- Check browser console for errors
- Verify Supabase tables were created
- Check that AdminProvider is wrapping App

**Maintenance page not showing?**
- Verify maintenance_mode is toggled in admin
- Clear browser cache
- Check routing setup in App.tsx

**Error logs empty?**
- Verify error_logs table exists in Supabase
- Check RLS policies allow inserts
- Use useErrorReporting hook to log errors

**Features not locking?**
- Ensure FeatureGuard wraps the component
- Verify toggle was clicked in admin
- Check adminSettings.propfirm_locked value

## Support

For detailed information, see `ADMIN_SYSTEM.md`

---

**Last Updated**: December 2025
**Status**: ✅ Complete
