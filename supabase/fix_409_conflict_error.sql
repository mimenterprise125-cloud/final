-- Migration: Fix setups table unique constraint issue causing 409 errors
-- The 409 Conflict error occurs when unique constraint is violated

-- Step 1: Drop the old unique constraint if it exists (with different name)
ALTER TABLE setups DROP CONSTRAINT IF EXISTS setups_name_user_id_key;

-- Step 2: Remove duplicate entries, keeping the most recent one per (name, user_id) pair
DELETE FROM setups s1
WHERE id NOT IN (
  SELECT DISTINCT ON (name, user_id) id
  FROM setups
  ORDER BY name, user_id, created_at DESC
);

-- Step 3: Ensure the correct unique constraint exists
-- First check if constraint already exists
DO $$
BEGIN
  -- Try to add the constraint
  ALTER TABLE setups ADD CONSTRAINT setups_name_user_id_key UNIQUE (name, user_id);
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, that's fine
  NULL;
END $$;

-- Step 4: Verify the table structure
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'setups'
ORDER BY constraint_type;

-- Step 5: Check for any remaining duplicates
SELECT name, user_id, COUNT(*) as count
FROM setups
GROUP BY name, user_id
HAVING COUNT(*) > 1;
-- If this returns rows, there are still duplicates - contact support

-- Step 6: Verify RLS policies are correct
SELECT policyname, schemaname, tablename, permissive
FROM pg_policies
WHERE tablename = 'setups'
ORDER BY policyname;
