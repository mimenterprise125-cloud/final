# Fix: Feature Lock Persistence Issue

## Problem
When you lock a feature from the admin dashboard and reload the page, the lock gets reset (unlocked).

## Root Causes
1. **Missing database columns** - The database schema was missing the individual lock type columns
2. **Improper database updates** - The update function was using `upsert` with spread operator instead of targeted `update`
3. **Missing real-time sync** - No real-time listener for database changes (already fixed in previous update)

## Solution Applied

### 1. Updated Database Schema (`supabase/admin_setup.sql`)
Added missing columns to `admin_settings` table:
- `performance_analytics_locked` (BOOLEAN)
- `propfirm_lock_type` (TEXT)
- `journal_lock_type` (TEXT)
- `performance_lock_type` (TEXT)

Also added migration commands to add these columns to existing databases.

### 2. Fixed Update Function (`src/lib/AdminContext.tsx`)
Changed from `upsert` to targeted `update`:
- **Before**: Used `upsert` with spread operator (overwrites entire row)
- **After**: Uses `update` with only changed fields (preserves other data)
- Properly maps all update fields to database columns
- Better error handling with console logs

### 3. Real-Time Synchronization (Already Fixed)
Added Supabase realtime channel to listen for database changes:
- When admin locks/unlocks features, all users see the change instantly
- Proper subscription cleanup on unmount

## What You Need To Do

### Step 1: Run Database Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `supabase/admin_setup.sql`
5. Execute the query
6. Wait for "Query completed" message

### Step 2: Test the Fix
1. **Refresh your browser** to load the updated code
2. Go to `/admin` → Features tab
3. Lock a feature (e.g., PropFirm)
4. Open browser DevTools → Console (F12)
5. You should see: `"Admin settings updated successfully"`
6. **Reload the page** (Ctrl+R or Cmd+R)
7. The lock should **persist** (feature still locked)
8. Check another user's account - lock should be visible there too

### Step 3: Verify With Multiple Users
1. **User A**: Lock a feature from `/admin`
2. **User B** (another browser/incognito): Visit `/dashboard/propfirm` (or locked feature)
3. User B should **immediately** see the locked feature
4. Reload User B's page - lock still persists

## How It Works Now

```
Admin locks feature
    ↓
Call updateSettings() with propfirm_locked: true
    ↓
Maps to database: UPDATE admin_settings SET propfirm_locked = true WHERE id = 'default'
    ↓
Database updated successfully ✓
    ↓
Realtime channel broadcasts change to all connected clients
    ↓
Other users' AdminContext receives update via onAuthStateChange
    ↓
FeatureGuard checks updated lock status
    ↓
Users see locked feature immediately without refresh ✓
```

## Files Changed
1. `supabase/admin_setup.sql` - Updated schema with missing columns
2. `src/lib/AdminContext.tsx` - Fixed updateSettings function

## Troubleshooting

### Lock still resets after reload?
1. Check browser console (F12) for errors
2. Verify database migration ran successfully
3. Check that the column `propfirm_lock_type` exists in your `admin_settings` table

### Run this in Supabase SQL Editor to verify:
```sql
SELECT * FROM admin_settings WHERE id = 'default';
```

You should see the lock columns with values like `true` or `false`.

### Still not working?
Check that RLS policies allow updates:
```sql
-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'admin_settings';
```

Should show "Authenticated users can update admin settings" policy.

## Performance Impact
✅ No performance impact
- Single targeted update instead of full row upsert
- Same realtime channel usage
- Slightly more efficient database operations

## Security
✅ No security changes
- RLS policies unchanged
- Admin role check still done in frontend (should be done in backend for production)
- Updates only affect admin_settings table

---

**Status**: ✅ Ready for testing
**Estimated Fix Time**: 2 minutes (migration) + 2 minutes (testing)
