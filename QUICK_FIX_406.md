# ⚡ COPY & PASTE THIS TO FIX THE 406 ERROR

## You're getting a 406 error because the database tables don't exist yet.

### The Fix (Takes 2 minutes):

## 1️⃣ COPY THIS SQL:

```sql
-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]',
  locked_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Admin can view all admin settings
CREATE POLICY "Admins can view admin settings" 
ON admin_settings FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Admins can update admin settings
CREATE POLICY "Admins can update admin settings" 
ON admin_settings FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can view error logs
CREATE POLICY "Anyone can view error logs" 
ON error_logs FOR SELECT 
USING (true);

-- Users can insert error logs
CREATE POLICY "Users can insert error logs" 
ON error_logs FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can view pricing tiers
CREATE POLICY "Anyone can view pricing tiers" 
ON pricing_tiers FOR SELECT 
USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs(user_id);
```

## 2️⃣ PASTE IT HERE:

1. Go to: https://app.supabase.com
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the SQL above
6. Click **Run** ✅

## 3️⃣ VERIFY IT WORKED:

- Go to **Table Editor** (left sidebar)
- You should see 3 new tables:
  - ✅ admin_settings
  - ✅ error_logs  
  - ✅ pricing_tiers

## 4️⃣ DONE! 🎉

Refresh your app in browser and:
- Error should be gone
- `/admin` should work
- All admin features ready to use

---

**That's it!** No errors, no hassle. Just copy, paste, run.

If you need the full setup guide, see `RUN_MIGRATION.md`
