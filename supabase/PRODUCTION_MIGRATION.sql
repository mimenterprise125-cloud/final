-- ============================================================================
-- PRODUCTION-READY ADMIN SYSTEM MIGRATION
-- Run this in Supabase SQL Editor to set up the complete admin system
-- ============================================================================

-- 1. ADD MISSING COLUMN TO admin_settings IF NOT EXISTS
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS performance_analytics_locked BOOLEAN DEFAULT FALSE;

-- 2. ENSURE TABLES EXIST WITH PROPER STRUCTURE

-- admin_settings table - all configuration in one place
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  pricing_enabled BOOLEAN DEFAULT FALSE,
  pricing_tiers JSONB DEFAULT '[]',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  propfirm_locked BOOLEAN DEFAULT FALSE,
  journal_locked BOOLEAN DEFAULT FALSE,
  performance_analytics_locked BOOLEAN DEFAULT FALSE,
  lock_type TEXT DEFAULT 'development' CHECK (lock_type IN ('development', 'premium')),
  active_user_count INTEGER DEFAULT 0,
  total_user_count INTEGER DEFAULT 0,
  error_logs JSONB DEFAULT '[]',
  locked_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- pricing_tiers table - backup for tiers (admin_settings.pricing_tiers is primary)
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]',
  locked_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- error_logs table - for error tracking
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

-- 3. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES (SAFE - won't error if they don't exist)
DROP POLICY IF EXISTS "Anyone can view admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated users can update admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON pricing_tiers;
DROP POLICY IF EXISTS "Anyone can view error logs" ON error_logs;
DROP POLICY IF EXISTS "Users can insert error logs" ON error_logs;

-- 5. CREATE RLS POLICIES

-- Admin Settings: Anyone can read, authenticated users can update
CREATE POLICY "Anyone can view admin settings"
ON admin_settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update admin settings"
ON admin_settings FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Pricing Tiers: Anyone can read
CREATE POLICY "Anyone can view pricing tiers"
ON pricing_tiers FOR SELECT
USING (true);

-- Error Logs: Anyone can read, authenticated users can insert
CREATE POLICY "Anyone can view error logs"
ON error_logs FOR SELECT
USING (true);

CREATE POLICY "Users can insert error logs"
ON error_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS admin_settings_id_idx ON admin_settings(id);
CREATE INDEX IF NOT EXISTS pricing_tiers_name_idx ON pricing_tiers(name);
CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs(user_id);

-- 7. INSERT DEFAULT ADMIN SETTINGS IF NOT EXISTS
INSERT INTO admin_settings (id) 
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 8. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON pricing_tiers;
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. CREATE TRIGGER FOR USER SIGNUP (NO-OP - just tracks in auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- User data is tracked in auth.users automatically
  -- No need to insert into separate table
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. VERIFY EVERYTHING IS SET UP
SELECT 
  'admin_settings' as table_name,
  COUNT(*) as row_count
FROM admin_settings
UNION ALL
SELECT 
  'pricing_tiers' as table_name,
  COUNT(*) as row_count
FROM pricing_tiers
UNION ALL
SELECT 
  'error_logs' as table_name,
  COUNT(*) as row_count
FROM error_logs;

-- SUCCESS! Your admin system is ready for production.
