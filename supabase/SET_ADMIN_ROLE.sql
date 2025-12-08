-- SQL Script to set a user as admin by UID
-- Replace 'YOUR_USER_UID_HERE' with the actual user ID

-- Method 1: Using the Supabase Admin API (Recommended for production)
-- This requires the supabase-js client with admin privileges
-- See the TypeScript version below for implementation

-- Method 2: Direct SQL Update (if you have direct database access)
-- Note: This won't work via Supabase SQL Editor as auth schema is not exposed
-- But if you're using a backend with direct DB access, you can use:

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'ff57a6aa-6661-417b-a59f-5949fec6fc70';

-- Verify the update was successful
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = 'YOUR_USER_UID_HERE';
