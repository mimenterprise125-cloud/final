# Admin System Migration Guide

## Overview
The admin system has been fully implemented, but requires a one-time database migration to set up the required tables and security policies.

## Quick Start

### Step 1: Copy the Migration SQL
The migration script is located at: `supabase/admin_setup.sql`

### Step 2: Run in Supabase

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open the file `supabase/admin_setup.sql` and copy ALL the SQL code
6. Paste it into the SQL editor
7. Click **Run** button

#### Option B: Using Supabase CLI
```bash
supabase db push
```

## What Gets Created

The migration creates three main tables:

### 1. `admin_settings` - Global Admin Configuration
```sql
CREATE TABLE admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  pricing_enabled BOOLEAN DEFAULT FALSE,
  pricing_tiers JSONB DEFAULT '[]',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  propfirm_locked BOOLEAN DEFAULT FALSE,
  journal_locked BOOLEAN DEFAULT FALSE,
  lock_type TEXT DEFAULT 'development' CHECK (lock_type IN ('development', 'premium')),
  active_user_count INTEGER DEFAULT 0,
  total_user_count INTEGER DEFAULT 0,
  error_logs JSONB DEFAULT '[]',
  locked_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `error_logs` - Application Error Tracking
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id),
  page TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `pricing_tiers` - Pricing Configuration
```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]',
  locked_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Row-Level Security (RLS) Policies

The migration includes RLS policies for data security:

- **admin_settings**: Authenticated users can read, admins can update
- **error_logs**: Anyone can read, authenticated users can insert
- **pricing_tiers**: Anyone can read

## After Migration

### Access the Admin Panel
1. Log in with your admin account
2. Navigate to `/admin`
3. You should see the admin dashboard with all features enabled

### Admin Panel Features

#### Overview Tab
- Global statistics
- Quick status indicators
- Error count
- Active users

#### Errors Tab
- View application error logs
- Filter by severity
- Clear error logs
- See error details and stack traces

#### Users Tab
- View total user count
- See user distribution (premium vs free)
- Track inactive users

#### Pricing Tab
- Enable/disable pricing system
- Manage pricing tiers
- Configure features per tier

#### Features Tab
- Lock/unlock PropFirm section
- Lock/unlock Journal section
- Choose lock type:
  - **Development**: Shows "Coming Soon" message
  - **Premium**: Shows upgrade prompt with link to pricing

#### Maintenance Tab
- Toggle maintenance mode
- Put entire site in maintenance when needed
- Shows custom maintenance page to all users

## Troubleshooting

### Error: "Admin settings table may not exist"
**Solution**: Run the migration SQL using Supabase Dashboard

### Error: "User not allowed" on user count fetch
**Solution**: Normal - the app handles this gracefully and uses default values until migration runs

### Changes not persisting
**Solution**: Make sure the tables were created successfully in Supabase Dashboard > SQL Editor

## Next Steps

1. ✅ Run the migration
2. ✅ Verify tables in Supabase Dashboard
3. ✅ Access `/admin` in your app
4. ✅ Configure your settings (pricing, locks, etc.)
5. ✅ Test feature guards on PropFirm and Journal sections

## Support

If you encounter issues:
1. Check Supabase Dashboard for table creation errors
2. Verify RLS policies are in place
3. Check browser console for detailed error messages
4. Ensure you're logged in as an admin user
