-- CREATE ADMIN USER - Use Supabase Dashboard
-- 
-- HOW TO:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the user you want to make admin
-- 3. Click the user to open details
-- 4. Scroll to "User Metadata" section
-- 5. Click "Edit" button
-- 6. Add this JSON:
-- {
--   "role": "admin"
-- }
-- 7. Click "Save"
--
-- That's it! The user is now an admin and can access /admin page
--
-- ALTERNATIVE: If you can't edit in dashboard, use this SQL:
-- Run this query in Supabase SQL Editor with your actual user UUID

UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE id = 'YOUR_USER_UUID_HERE';

-- Replace YOUR_USER_UUID_HERE with the actual user ID from Authentication > Users
-- Example: '550e8400-e29b-41d4-a716-446655440000'

-- To remove admin role:
-- UPDATE auth.users 
-- SET user_metadata = user_metadata - 'role'
-- WHERE id = 'YOUR_USER_UUID_HERE';
