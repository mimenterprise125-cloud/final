-- Create journal_share_links table for sharing journals with others
CREATE TABLE IF NOT EXISTS journal_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  
  -- Share permissions
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Access tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Share info
  title VARCHAR(255), -- e.g., "My Trading Journal - Jan 2026"
  description TEXT,
  
  -- Optional: limit which trades are visible (empty = all)
  visible_journals TEXT[] -- Array of journal IDs to share (NULL = all)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_journal_share_links_token ON journal_share_links(share_token);
CREATE INDEX IF NOT EXISTS idx_journal_share_links_user_id ON journal_share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_share_links_active ON journal_share_links(is_active);

-- RLS Policies for journal_share_links
ALTER TABLE journal_share_links ENABLE ROW LEVEL SECURITY;

-- Users can create and manage their own share links
CREATE POLICY "Users can create their own share links"
  ON journal_share_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own share links"
  ON journal_share_links
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own share links"
  ON journal_share_links
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share links"
  ON journal_share_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public policy: Anyone can view active share links to access shared journals
CREATE POLICY "Public can view active share links"
  ON journal_share_links
  FOR SELECT
  USING (
    is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  );
