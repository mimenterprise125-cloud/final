-- Supabase schema for prop-dashboard-pro
-- Run this SQL in the Supabase SQL editor or via migration tooling.

-- Enable uuid generation (pgcrypto)
create extension if not exists "pgcrypto";

-- Profiles: lightweight user profile that references auth.users
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Trading accounts (linked to a profile)
create table if not exists trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  account_identifier text not null,
  name text,
  balance numeric,
  currency text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Trades executed on accounts
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references trading_accounts(id) on delete cascade,
  symbol text,
  side text,
  size numeric,
  price numeric,
  status text,
  executed_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  -- core trade/journal fields
  symbol text,
  entry_price numeric,
  exit_price numeric,
  entry_at timestamptz,
  exit_at timestamptz,
  session text,
  setup text,
  setup_rating text,
  execution_type text,
  stop_loss_price numeric,
  target_price numeric,
  -- stop/target in "points" units (user-entered points)
  stop_loss_points numeric,
  target_points numeric,
  -- realized in points (positive for profit, negative for loss)
  realized_points numeric,
  -- optional link to a trading account
  account_id uuid references trading_accounts(id),
  -- trade quality tagging
  rule_followed boolean,
  confirmation boolean,
  -- reason for loss (optional free text or enum)
  loss_reason text,
  direction text,
  result text,
  -- realized amount in account currency (positive for profit, negative for loss)
  realized_amount numeric,
  win boolean,
  duration_minutes integer,
  notes text,
  -- multiple screenshot URLs stored as text array
  screenshot_urls text[],
  tags text[],
  trade_id uuid references trades(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Saved symbols (user can add symbols to dropdown)
create table if not exists symbols (
  id uuid primary key default gen_random_uuid(),
  -- user-visible canonical name (e.g. EUR/USD)
  name text not null,
  -- normalized form used for deduplication (e.g. EURUSD)
  normalized_name text not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(normalized_name, user_id)
);

-- Saved setups (user-defined setups)
create table if not exists setups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(name, user_id)
);

-- Copy rules / copier configuration between master and follower accounts
create table if not exists copy_rules (
  id uuid primary key default gen_random_uuid(),
  master_account_id uuid references trading_accounts(id) on delete cascade,
  follower_account_id uuid references trading_accounts(id) on delete cascade,
  ratio numeric default 1,
  enabled boolean default true,
  filters jsonb,
  created_at timestamptz default now()
);

-- Payouts (for accounting/withdrawals)
create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric,
  status text,
  processed_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Store encrypted account credentials (service-only access)
create table if not exists account_credentials (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references trading_accounts(id) on delete cascade,
  encrypted_payload text not null,
  created_at timestamptz default now()
);

-- List of known prop firms and their available servers (shared across users)
create table if not exists prop_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  servers jsonb default '[]',
  created_at timestamptz default now()
);

-- Per-user saved servers (and optional association to a prop_firm). Used to cache servers discovered from live MT5 queries.
create table if not exists saved_servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prop_firm_id uuid references prop_firms(id),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Notes: create a bucket called 'journal-screenshots' in Supabase Storage for screenshots.

-- -------------------------------
-- Row Level Security (RLS) policies
-- -------------------------------

-- Profiles: allow users to read/update their own profile and insert when id == auth.uid()
alter table profiles enable row level security;

create policy profiles_select_owner on profiles
  for select using (id = auth.uid());

create policy profiles_update_owner on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_insert_authenticated on profiles
  for insert with check (id = auth.uid());

-- Trading accounts: users can only manage their own accounts
alter table trading_accounts enable row level security;

create policy accounts_select_owner on trading_accounts
  for select using (user_id = auth.uid());

create policy accounts_insert_authenticated on trading_accounts
  for insert with check (user_id = auth.uid());

create policy accounts_update_owner on trading_accounts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy accounts_delete_owner on trading_accounts
  for delete using (user_id = auth.uid());

-- Journals: users can only CRUD their own journal entries
alter table journals enable row level security;

create policy journals_select_owner on journals
  for select using (user_id = auth.uid());

create policy journals_insert_owner on journals
  for insert with check (user_id = auth.uid());

create policy journals_update_owner on journals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy journals_delete_owner on journals
  for delete using (user_id = auth.uid());

-- Trades: allow access only if the trade's account belongs to the authenticated user
alter table trades enable row level security;

create policy trades_select_account_owner on trades
  for select using (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = trades.account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

create policy trades_insert_account_owner on trades
  for insert with check (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

create policy trades_update_account_owner on trades
  for update using (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = trades.account_id
        and trading_accounts.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

create policy trades_delete_account_owner on trades
  for delete using (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = trades.account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

-- Copy rules: allow users to view rules where they are master or follower; inserts allowed when follower account belongs to user
alter table copy_rules enable row level security;

create policy copy_rules_select_owner on copy_rules
  for select using (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = copy_rules.master_account_id
        and trading_accounts.user_id = auth.uid()
    )
    or
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = copy_rules.follower_account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

create policy copy_rules_insert_follower_owner on copy_rules
  for insert with check (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = follower_account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

create policy copy_rules_update_owner on copy_rules
  for update using (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = copy_rules.follower_account_id
        and trading_accounts.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = follower_account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

create policy copy_rules_delete_owner on copy_rules
  for delete using (
    exists (
      select 1 from trading_accounts
      where trading_accounts.id = copy_rules.follower_account_id
        and trading_accounts.user_id = auth.uid()
    )
  );

-- Payouts: users can only see and manage their own payouts
alter table payouts enable row level security;

create policy payouts_select_owner on payouts
  for select using (user_id = auth.uid());

create policy payouts_insert_owner on payouts
  for insert with check (user_id = auth.uid());

create policy payouts_update_owner on payouts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy payouts_delete_owner on payouts
  for delete using (user_id = auth.uid());

-- Symbols: users can only manage their own symbols
alter table symbols enable row level security;

create policy symbols_select_owner on symbols
  for select using (user_id = auth.uid() or user_id is null);

create policy symbols_insert_owner on symbols
  for insert with check (user_id = auth.uid());

create policy symbols_update_owner on symbols
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy symbols_delete_owner on symbols
  for delete using (user_id = auth.uid());

-- Setups: users can only manage their own setups
alter table setups enable row level security;

create policy setups_select_owner on setups
  for select using (user_id = auth.uid());

create policy setups_insert_owner on setups
  for insert with check (user_id = auth.uid());

create policy setups_update_owner on setups
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy setups_delete_owner on setups
  for delete using (user_id = auth.uid());

-- Saved servers: users can only manage their own servers
alter table saved_servers enable row level security;

create policy saved_servers_select_owner on saved_servers
  for select using (user_id = auth.uid() or user_id is null);

create policy saved_servers_insert_owner on saved_servers
  for insert with check (user_id = auth.uid());

create policy saved_servers_update_owner on saved_servers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy saved_servers_delete_owner on saved_servers
  for delete using (user_id = auth.uid());

-- Note: The Supabase service_role key bypasses RLS. Use it only in trusted server code.

-- FxBook integration tables
create table if not exists fxbook_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists fxbook_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fxbook_account_id int not null,
  account_name text,
  broker text,
  server text,
  gain numeric,
  drawdown numeric,
  last_synced timestamptz
);

create table if not exists fxbook_trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fxbook_account_id int,
  symbol text,
  type text,
  lot numeric,
  open_price numeric,
  close_price numeric,
  open_time timestamptz,
  close_time timestamptz,
  profit numeric,
  magic text,
  comment text
);

create table if not exists fxbook_equity_curve (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fxbook_account_id int,
  timestamp timestamptz,
  balance numeric,
  equity numeric,
  gain numeric,
  dd numeric
);

-- Enable RLS for fxbook tables and restrict access to owning users
alter table fxbook_sessions enable row level security;
create policy fxbook_sessions_select_owner on fxbook_sessions
  for select using (user_id = auth.uid());
create policy fxbook_sessions_insert_owner on fxbook_sessions
  for insert with check (user_id = auth.uid());
create policy fxbook_sessions_update_owner on fxbook_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy fxbook_sessions_delete_owner on fxbook_sessions
  for delete using (user_id = auth.uid());

alter table fxbook_accounts enable row level security;
create policy fxbook_accounts_select_owner on fxbook_accounts
  for select using (user_id = auth.uid());
create policy fxbook_accounts_insert_owner on fxbook_accounts
  for insert with check (user_id = auth.uid());
create policy fxbook_accounts_update_owner on fxbook_accounts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy fxbook_accounts_delete_owner on fxbook_accounts
  for delete using (user_id = auth.uid());

alter table fxbook_trades enable row level security;
create policy fxbook_trades_select_owner on fxbook_trades
  for select using (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_trades.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );
create policy fxbook_trades_insert_owner on fxbook_trades
  for insert with check (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_trades.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );
create policy fxbook_trades_update_owner on fxbook_trades
  for update using (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_trades.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_trades.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );
create policy fxbook_trades_delete_owner on fxbook_trades
  for delete using (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_trades.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );

alter table fxbook_equity_curve enable row level security;
create policy fxbook_equity_select_owner on fxbook_equity_curve
  for select using (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_equity_curve.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );
create policy fxbook_equity_insert_owner on fxbook_equity_curve
  for insert with check (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_equity_curve.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );
create policy fxbook_equity_update_owner on fxbook_equity_curve
  for update using (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_equity_curve.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_equity_curve.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );
create policy fxbook_equity_delete_owner on fxbook_equity_curve
  for delete using (
    exists (
      select 1 from fxbook_accounts
      where fxbook_accounts.fxbook_account_id = fxbook_equity_curve.fxbook_account_id
        and fxbook_accounts.user_id = auth.uid()
    )
  );

-- ============================================================================
-- AUTO-UPDATE TIMESTAMPS FUNCTION AND TRIGGERS
-- ============================================================================

-- Create function to automatically update updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;

-- Create triggers for tables with updated_at column
create trigger setups_updated_at before update on setups
  for each row execute function update_updated_at_column();

create trigger journals_updated_at before update on journals
  for each row execute function update_updated_at_column();

create trigger trading_accounts_updated_at before update on trading_accounts
  for each row execute function update_updated_at_column();
