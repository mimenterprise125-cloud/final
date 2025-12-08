# Feature Lock Debugging Guide

## Step 1: Open Browser Developer Tools
1. Press **F12** to open Developer Tools
2. Click the **Console** tab at the top
3. Clear any existing logs with the trash icon

## Step 2: Verify Supabase Connection
1. In the console, type:
```javascript
supabase
```
2. You should see the Supabase client object. If you get an error, Supabase isn't loaded.

## Step 3: Check Admin Settings in Database
1. Go to your Supabase Dashboard
2. Click **Database** → **Tables** → **admin_settings**
3. Click the **admin_settings** table
4. You should see one row with `id = 'default'`
5. Check the values of:
   - `propfirm_locked` (should be true or false)
   - `journal_locked` (should be true or false)
   - `propfirm_lock_type` (should be 'development' or 'premium')

## Step 4: Test the Toggle

### Before Clicking:
1. In console, look for logs starting with:
   - `📥 Fetched admin settings from database:`
   - Should show current lock values

### Click the Lock Button:
1. Watch the console for:
   - `📝 Attempting to update settings with: { propfirm_locked: true }`
   - `✏️ Setting propfirm_locked to: true`
   - `🗄️ Sending to database: { propfirm_locked: true, ...}`
   - `✅ Database update successful:` or `❌ Failed to update`

### After Clicking:
1. Refresh the page (Ctrl+R)
2. Check console for `📥 Fetched admin settings from database:`
3. Verify the lock value persisted

## Step 5: Diagnose the Issue

### Problem A: Lock doesn't update in UI (button doesn't change)
- Check console for: `📝 Attempting to update settings...`
- If you DON'T see this, the button click isn't firing
- Solution: Check if button has `onClick={() => togglePropFirmLock()}`

### Problem B: Console shows `❌ Failed to update`
- Read the error message carefully
- Common errors:
  - `PGRST401` = Not authenticated
  - `PGRST403` = Permission denied (RLS policy)
  - `PGRST404` = Table not found

- Solution for `PGRST401`: Make sure you're logged in
- Solution for `PGRST403`: Check RLS policies allow authenticated users to UPDATE
- Solution for `PGRST404`: Run the migration script again

### Problem C: Database shows old value after refresh
- The update succeeded but didn't persist
- Likely cause: Database is not actually saving the value
- Solution: Check RLS policies in Supabase → Database → Policies

### Problem D: Other users don't see the lock
- The update works and persists, but other sessions don't see it
- Check console every 5 seconds for: `📥 Fetched admin settings from database:`
- Should show the updated lock value within 5 seconds
- If not, realtime subscription might not be working

## Step 6: Check RLS Policies

Go to Supabase Dashboard → **Database** → **Policies**:

Look for policies on `admin_settings` table. You should see:
```
"Anyone can view admin settings" - SELECT - USING (true)
"Authenticated users can update admin settings" - UPDATE - USING (auth.uid() IS NOT NULL)
```

If either is missing, run this in SQL Editor:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'admin_settings';

-- Check if table exists
SELECT * FROM admin_settings;
```

## Step 7: Verify Realtime is Enabled

In Supabase SQL Editor, run:
```sql
-- Check if realtime is enabled
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

You should see `admin_settings` in the results.

## Expected Behavior (After Fix)

1. **Click Lock Button** on `/admin`
   - ✅ Console shows: `✅ Database update successful`
   - ✅ Button text changes to "Unlock Now"
   - ✅ Badge shows "LOCKED"

2. **Refresh Admin Page**
   - ✅ Lock status persists
   - ✅ Console shows: `✓ Lock status - propfirm_locked: true`

3. **Visit `/dashboard/propfirm` (another user)**
   - ✅ Sees "Under Development" message
   - ✅ Console shows: `🔐 propfirm is LOCKED`
   - ✅ Within 5 seconds, if still unlocked, should auto-update to locked

## Common Solutions

### If button doesn't respond:
```tsx
// Make sure Admin.tsx has:
const { togglePropFirmLock } = useAdmin();

// Make sure button has:
<Button onClick={() => togglePropFirmLock()}>
  Lock This Section
</Button>
```

### If database update fails with permission error:
```sql
-- In Supabase SQL Editor, run:
DROP POLICY IF EXISTS "Authenticated users can update admin settings" ON admin_settings;

CREATE POLICY "Authenticated users can update admin settings"
ON admin_settings FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
```

### If realtime isn't working:
```sql
-- In Supabase SQL Editor, run:
ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;
```

## Advanced Debugging

### Check Supabase Realtime Events
1. Open browser DevTools → **Network** tab
2. Filter by "ws" (websocket)
3. Look for connection to `realtime-db.supabase.co`
4. When you update, you should see messages in the WebSocket

### Check Local State vs Database
In console, after updating:
```javascript
// Check what the app thinks the lock status is
// It should match the database value

// Fetch from database directly:
supabase.from('admin_settings').select('*').single().then(r => console.log(r))
```

---

## Next Steps

1. **Reproduce the issue**
2. **Open Console (F12)**
3. **Click the lock button**
4. **Read and copy ALL console messages**
5. **Share the console output**

This will help identify exactly where the issue is!
