-- Add settings columns to profiles table
alter table profiles
add column if not exists notifications_enabled boolean default true,
add column if not exists dark_mode boolean default true,
add column if not exists updated_at timestamptz default now();

-- Create or replace function to update updated_at timestamp
create or replace function update_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop trigger if it exists
drop trigger if exists update_profiles_updated_at_trigger on profiles;

-- Create trigger to automatically update updated_at
create trigger update_profiles_updated_at_trigger
before update on profiles
for each row
execute function update_profiles_updated_at();
