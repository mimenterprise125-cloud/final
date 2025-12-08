-- Migration: Handle NOT NULL constraints on user_id columns
-- This fixes the "column user_id contains null values" error

-- Step 1: For tables with NULL user_id values, we need to either:
--   a) Delete rows with NULL user_id (data cleanup)
--   b) Set them to a default/known user (if applicable)
--   c) Make user_id nullable temporarily

-- For symbols table: These are orphaned records without an owner
-- Safe approach: DELETE NULL records (they're not assigned to any user anyway)
DELETE FROM symbols WHERE user_id IS NULL;

-- Step 2: Now we can safely add the NOT NULL constraint
-- Since we already defined it in schema.sql, we may need to recreate constraints

-- For symbols table (if constraint exists, drop it first)
ALTER TABLE symbols DROP CONSTRAINT IF EXISTS symbols_user_id_fkey;
ALTER TABLE symbols ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE symbols ADD CONSTRAINT symbols_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Verify all constraints are correct
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.constraint_column_usage
WHERE table_name IN ('symbols', 'payouts', 'saved_servers')
ORDER BY table_name, constraint_name;

-- Step 4: Check for any remaining NULL user_id values
SELECT table_name, COUNT(*) as null_count
FROM (
  SELECT 'symbols' as table_name FROM symbols WHERE user_id IS NULL
  UNION ALL
  SELECT 'payouts' FROM payouts WHERE user_id IS NULL
  UNION ALL
  SELECT 'saved_servers' FROM saved_servers WHERE user_id IS NULL
) null_check
GROUP BY table_name;
