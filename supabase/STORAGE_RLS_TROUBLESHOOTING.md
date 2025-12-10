-- QUICK FIX: Storage RLS Issue for journal-screenshots bucket

-- If you get "new row violated row level security" when uploading screenshots,
-- you need to either:
-- 1. Apply the RLS policies in setup_storage_rls.sql, OR
-- 2. Temporarily disable RLS on storage.objects (development only)

-- OPTION 1: For Production - Keep RLS Enabled but fix policies
-- Run the setup_storage_rls.sql file in Supabase SQL Editor

-- OPTION 2: For Development - Disable RLS temporarily
-- WARNING: Only do this in development! Never disable RLS in production!
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- OPTION 3: Use Supabase Dashboard
-- 1. Go to Authentication > Policies in Supabase Dashboard
-- 2. Find the storage.objects table
-- 3. Add these policies:
--    - INSERT: bucket_id = 'journal-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text
--    - SELECT: bucket_id = 'journal-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text
--    - DELETE: bucket_id = 'journal-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text

-- Check current RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
