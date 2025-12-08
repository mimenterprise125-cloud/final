-- Migration: Add missing RLS policies for symbols, setups, and saved_servers
-- This fixes the "insert or update on table setups violate foreign key constraint" error

-- Enable RLS and create policies for SYMBOLS table
alter table symbols enable row level security;

-- Drop existing policies if they exist
drop policy if exists symbols_select_owner on symbols;
drop policy if exists symbols_insert_owner on symbols;
drop policy if exists symbols_update_owner on symbols;
drop policy if exists symbols_delete_owner on symbols;

-- Create new policies
create policy symbols_select_owner on symbols
  for select using (user_id = auth.uid() or user_id is null);

create policy symbols_insert_owner on symbols
  for insert with check (user_id = auth.uid());

create policy symbols_update_owner on symbols
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy symbols_delete_owner on symbols
  for delete using (user_id = auth.uid());

-- Enable RLS and create policies for SETUPS table
alter table setups enable row level security;

-- Drop existing policies if they exist
drop policy if exists setups_select_owner on setups;
drop policy if exists setups_insert_owner on setups;
drop policy if exists setups_update_owner on setups;
drop policy if exists setups_delete_owner on setups;

-- Create new policies
create policy setups_select_owner on setups
  for select using (user_id = auth.uid());

create policy setups_insert_owner on setups
  for insert with check (user_id = auth.uid());

create policy setups_update_owner on setups
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy setups_delete_owner on setups
  for delete using (user_id = auth.uid());

-- Enable RLS and create policies for SAVED_SERVERS table
alter table saved_servers enable row level security;

-- Drop existing policies if they exist
drop policy if exists saved_servers_select_owner on saved_servers;
drop policy if exists saved_servers_insert_owner on saved_servers;
drop policy if exists saved_servers_update_owner on saved_servers;
drop policy if exists saved_servers_delete_owner on saved_servers;

-- Create new policies
create policy saved_servers_select_owner on saved_servers
  for select using (user_id = auth.uid() or user_id is null);

create policy saved_servers_insert_owner on saved_servers
  for insert with check (user_id = auth.uid());

create policy saved_servers_update_owner on saved_servers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy saved_servers_delete_owner on saved_servers
  for delete using (user_id = auth.uid());

-- Verify RLS is enabled
SELECT tablename, 
       CASE WHEN rowsecurity = true THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('symbols', 'setups', 'saved_servers');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('symbols', 'setups', 'saved_servers')
ORDER BY tablename, policyname;
