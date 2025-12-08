-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  pricing_enabled BOOLEAN DEFAULT FALSE,
  pricing_tiers JSONB DEFAULT '[]',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  propfirm_locked BOOLEAN DEFAULT FALSE,
  journal_locked BOOLEAN DEFAULT FALSE,
  performance_analytics_locked BOOLEAN DEFAULT FALSE,
  lock_type TEXT DEFAULT 'development' CHECK (lock_type IN ('development', 'premium')),
  propfirm_lock_type TEXT DEFAULT 'development' CHECK (propfirm_lock_type IN ('development', 'premium')),
  journal_lock_type TEXT DEFAULT 'development' CHECK (journal_lock_type IN ('development', 'premium')),
  performance_lock_type TEXT DEFAULT 'development' CHECK (performance_lock_type IN ('development', 'premium')),
  active_user_count INTEGER DEFAULT 0,
  total_user_count INTEGER DEFAULT 0,
  error_logs JSONB DEFAULT '[]',
  locked_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable realtime for admin_settings table (required for real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;

-- INSERT default settings row if it doesn't exist
INSERT INTO admin_settings (id) 
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

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

-- Create RLS policies for other tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated users can update admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Admins can view admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Admins can update admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON admin_settings;
DROP POLICY IF EXISTS "Anyone can view error logs" ON error_logs;
DROP POLICY IF EXISTS "Users can insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON pricing_tiers;

-- Allow anyone to read admin_settings (for feature locks and maintenance mode)
CREATE POLICY "Anyone can view admin settings"
ON admin_settings FOR SELECT
USING (true);

-- Allow authenticated users to update admin_settings (admin check done in app)
CREATE POLICY "Authenticated users can update admin settings"
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

-- Insert default admin settings if not exists
INSERT INTO admin_settings (id) 
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Create or replace function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Just track the user in auth, no need to populate account_credentials
  -- account_credentials is only for storing encrypted credentials
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing columns if they don't exist (for existing databases)
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS performance_analytics_locked BOOLEAN DEFAULT FALSE;

ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS propfirm_lock_type TEXT DEFAULT 'development' CHECK (propfirm_lock_type IN ('development', 'premium'));

ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS journal_lock_type TEXT DEFAULT 'development' CHECK (journal_lock_type IN ('development', 'premium'));

ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS performance_lock_type TEXT DEFAULT 'development' CHECK (performance_lock_type IN ('development', 'premium'));
