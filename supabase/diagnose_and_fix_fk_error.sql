-- DIAGNOSTIC & FIX SCRIPT FOR: "insert or update on table setups violate foreign key constraint setups_user_id_fkey"
-- Run this entire script in Supabase SQL Editor to diagnose and fix the issue

-- ============================================================================
-- SECTION 1: DIAGNOSTICS - Identify the root cause
-- ============================================================================

-- Step 1: Check if setups table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'setups'
ORDER BY ordinal_position;

-- Step 2: Check foreign key constraint details
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'setups';

-- Step 3: Count total users in auth.users (should be > 0)
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Step 4: Check if there are any orphaned setups (setups with user_id not in auth.users)
SELECT 
    s.id,
    s.name,
    s.user_id,
    CASE WHEN au.id IS NULL THEN 'ORPHANED - user does not exist' ELSE 'OK' END as status
FROM setups s
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE au.id IS NULL;

-- Step 5: Check RLS status on setups table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'setups';

-- Step 6: Check RLS policies on setups
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'setups'
ORDER BY policyname;

-- ============================================================================
-- SECTION 2: COMMON FIXES - Choose the appropriate fix based on diagnostics
-- ============================================================================

-- FIX A: If foreign key references wrong table (should reference auth.users, not profiles)
-- Uncomment and run if constraint references profiles(id) instead of auth.users(id)

-- ALTER TABLE setups DROP CONSTRAINT IF EXISTS setups_user_id_fkey;
-- ALTER TABLE setups ADD CONSTRAINT setups_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- FIX B: Delete orphaned setups (setups with user_id not in auth.users)
-- Uncomment and run if Step 4 above shows orphaned records

-- DELETE FROM setups 
-- WHERE user_id NOT IN (SELECT id FROM auth.users);

-- FIX C: If RLS policies are missing or incorrect
-- Uncomment and run if Step 6 shows no policies or incorrect policies

-- Enable RLS on setups
-- ALTER TABLE setups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
-- DROP POLICY IF EXISTS setups_select_owner ON setups;
-- DROP POLICY IF EXISTS setups_insert_owner ON setups;
-- DROP POLICY IF EXISTS setups_update_owner ON setups;
-- DROP POLICY IF EXISTS setups_delete_owner ON setups;

-- Create correct policies
-- CREATE POLICY setups_select_owner ON setups
--   FOR SELECT USING (user_id = auth.uid());
-- 
-- CREATE POLICY setups_insert_owner ON setups
--   FOR INSERT WITH CHECK (user_id = auth.uid());
-- 
-- CREATE POLICY setups_update_owner ON setups
--   FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- 
-- CREATE POLICY setups_delete_owner ON setups
--   FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: TEST INSERT - Verify the fix works
-- ============================================================================

-- Before running this, you need a valid user_id from auth.users
-- Get your user_id by running in browser console:
-- (await supabase.auth.getUser()).data.user.id

-- Then replace <YOUR_USER_ID> below and uncomment to test:

-- INSERT INTO setups (name, description, user_id)
-- VALUES ('TEST_SETUP', 'Testing FK constraint', '<YOUR_USER_ID>');

-- If successful, clean up the test:
-- DELETE FROM setups WHERE name = 'TEST_SETUP';

-- ============================================================================
-- SECTION 4: FINAL VERIFICATION
-- ============================================================================

-- Verify all constraints are correct
SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'setups'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check for duplicate setups (in case unique constraint also causing issues)
SELECT name, user_id, COUNT(*) as count
FROM setups
GROUP BY name, user_id
HAVING COUNT(*) > 1;
