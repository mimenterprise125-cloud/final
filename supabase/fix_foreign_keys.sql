-- Migration: Fix foreign key constraints to use auth.users directly
-- This solves the "insert or update on table 'setups' violate foreign key constraint setups_user_id_fkey" error

-- Step 1: Update all references from profiles(id) to auth.users(id)
-- This ensures users don't need a profile entry to create data

-- Fix trading_accounts table
ALTER TABLE trading_accounts DROP CONSTRAINT IF EXISTS trading_accounts_user_id_fkey;
ALTER TABLE trading_accounts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE trading_accounts ADD CONSTRAINT trading_accounts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix journals table
ALTER TABLE journals DROP CONSTRAINT IF EXISTS journals_user_id_fkey;
ALTER TABLE journals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE journals ADD CONSTRAINT journals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix symbols table
ALTER TABLE symbols DROP CONSTRAINT IF EXISTS symbols_user_id_fkey;
ALTER TABLE symbols ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE symbols ADD CONSTRAINT symbols_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- setups already fixed (was done in schema.sql update)

-- Fix payouts table
ALTER TABLE payouts DROP CONSTRAINT IF EXISTS payouts_user_id_fkey;
ALTER TABLE payouts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE payouts ADD CONSTRAINT payouts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix saved_servers table
ALTER TABLE saved_servers DROP CONSTRAINT IF EXISTS saved_servers_user_id_fkey;
ALTER TABLE saved_servers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE saved_servers ADD CONSTRAINT saved_servers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Keep profiles table for user profile data, but make it optional
-- (Users can still have a profile without being required to insert data)

-- Step 2: Fix RLS policies to use auth.uid() directly (already correct in schema)

-- Step 3: Verify all constraints
SELECT constraint_name, table_name, column_name
FROM information_schema.constraint_column_usage
WHERE table_name IN ('trading_accounts', 'journals', 'symbols', 'setups', 'payouts', 'saved_servers')
ORDER BY table_name;

-- Done! Now users can insert into any table using auth.uid() without needing a profiles entry
