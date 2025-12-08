# Fix HTTP 409 Conflict Error on Setups Table

## Problem
When loading or saving setups, you get:
```
Failed to load resource: the server responded with a status of 409
GET /rest/v1/setups?columns=...
```

**HTTP 409 = Conflict** - usually means a unique constraint is violated.

## Root Causes

### 1. Duplicate Setups
The `setups` table has a unique constraint on `(name, user_id)`:
```sql
unique(name, user_id)
```

If there are duplicate setups with the same name for the same user, any query will fail with 409.

### 2. Constraint Mismatch
The schema was created with `if not exists`, so if the table was created earlier without the unique constraint, duplicates may exist.

### 3. RLS Policy Issues
If RLS policies are malformed, they can also cause 409 errors.

## Solution

### Step 1: Run the Cleanup Migration
Execute this in **Supabase SQL Editor**:

```sql
-- Copy entire contents of supabase/fix_409_conflict_error.sql
```

This will:
1. ✅ Remove duplicate constraint definitions
2. ✅ Delete duplicate (name, user_id) pairs
3. ✅ Ensure correct unique constraint exists
4. ✅ Verify RLS policies are valid

### Step 2: Verify the Fix
Run these verification queries:

```sql
-- Check for remaining duplicates (should return 0 rows)
SELECT name, user_id, COUNT(*) as count
FROM setups
GROUP BY name, user_id
HAVING COUNT(*) > 1;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'setups';

-- Check RLS policies
SELECT policyname, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'setups';
```

## Understanding the Unique Constraint

The `(name, user_id)` unique constraint means:
- A user **cannot have two setups with the same name**
- But **different users can have setups with the same name**

Example:
```
✅ Allowed:
  - User A: "Breakout Setup"
  - User B: "Breakout Setup"

❌ Not Allowed:
  - User A: "Breakout Setup" (created today)
  - User A: "Breakout Setup" (created yesterday) <- CONFLICT
```

## Why 409 Instead of Clearer Error?

Supabase/PostgreSQL returns 409 when:
1. INSERT violates unique constraint
2. UPDATE violates unique constraint
3. SELECT can't proceed due to constraint violations
4. RLS policy has constraint issues

It's a generic "conflict" response rather than a specific error message.

## Prevention Going Forward

To avoid 409 errors:
1. **Always check if setup exists before inserting**:
   ```typescript
   const existing = await supabase
     .from('setups')
     .select('id')
     .eq('name', setupName)
     .eq('user_id', user.id)
     .single();
   
   if (existing.error?.code === 'PGRST116') {
     // Doesn't exist, safe to insert
   } else if (existing.data) {
     // Already exists, skip or update
   }
   ```

2. **Use `upsert` instead of insert**:
   ```typescript
   await supabase.from('setups').upsert(
     { name: setupName, description, user_id },
     { onConflict: 'name,user_id' }
   );
   ```

## Files Created

- ✅ `supabase/fix_409_conflict_error.sql` - Migration script

## Application Code
**File**: `src/components/modals/AddJournalDialog.tsx`

**Query** (lines 93-99):
```typescript
const { data: stData, error: stErr } = await supabase
  .from("setups")
  .select("name, description")
  .order("created_at", { ascending: false })
  .limit(1000);
```

This query works fine if there are no constraint violations.

## Status: ✅ READY TO FIX

1. Run `fix_409_conflict_error.sql` in Supabase
2. Test adding/loading setups
3. Should work without 409 errors

---

## Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| 409 Conflict | Duplicate entries violating unique constraint | Run cleanup migration |
| 401 Unauthorized | RLS policy blocking access | Check RLS policies |
| 403 Forbidden | No permission for operation | Check user_id matches auth.uid() |
| 400 Bad Request | Invalid query syntax | Check column names and types |

