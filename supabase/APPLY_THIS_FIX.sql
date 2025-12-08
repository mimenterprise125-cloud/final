-- FIX: Change setups FK constraint from profiles(id) to auth.users(id)
-- This resolves: "insert or update on table setups violate foreign key constraint setups_user_id_fkey"

-- Step 1: Drop the incorrect FK constraint
ALTER TABLE setups DROP CONSTRAINT IF EXISTS setups_user_id_fkey;

-- Step 2: Add the correct FK constraint pointing to auth.users
ALTER TABLE setups ADD CONSTRAINT setups_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Verify the fix
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'setups';

-- Expected output should show:
-- setups_user_id_fkey | FOREIGN KEY | user_id | users | id
-- (references_table should be "users" in auth schema, not "profiles")
