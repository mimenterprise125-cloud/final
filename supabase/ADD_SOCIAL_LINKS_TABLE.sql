-- Create admin_social_links table for managing community and footer social media links
CREATE TABLE IF NOT EXISTS admin_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_type TEXT NOT NULL CHECK (link_type IN ('community', 'footer')),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by link_type
CREATE INDEX IF NOT EXISTS admin_social_links_link_type_idx ON admin_social_links(link_type);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS admin_social_links_order_idx ON admin_social_links("order");

-- Enable Row Level Security
ALTER TABLE admin_social_links ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all social links
CREATE POLICY "Allow authenticated users to read social links"
  ON admin_social_links
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow only admins to insert social links
CREATE POLICY "Allow admins to insert social links"
  ON admin_social_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'user_metadata' ILIKE '%"role"%admin%'
    OR auth.jwt() ->> 'app_metadata' ILIKE '%"role"%admin%'
  );

-- RLS Policy: Allow only admins to update social links
CREATE POLICY "Allow admins to update social links"
  ON admin_social_links
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'user_metadata' ILIKE '%"role"%admin%'
    OR auth.jwt() ->> 'app_metadata' ILIKE '%"role"%admin%'
  )
  WITH CHECK (
    auth.jwt() ->> 'user_metadata' ILIKE '%"role"%admin%'
    OR auth.jwt() ->> 'app_metadata' ILIKE '%"role"%admin%'
  );

-- RLS Policy: Allow only admins to delete social links
CREATE POLICY "Allow admins to delete social links"
  ON admin_social_links
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'user_metadata' ILIKE '%"role"%admin%'
    OR auth.jwt() ->> 'app_metadata' ILIKE '%"role"%admin%'
  );

-- Allow public (unauthenticated) users to read social links for display on public pages
CREATE POLICY "Allow public to read social links"
  ON admin_social_links
  FOR SELECT
  TO anon
  USING (true);
