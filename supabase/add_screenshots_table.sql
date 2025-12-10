-- Migration: Add journal_screenshots table for managing trade screenshots

-- Create journal_screenshots table
CREATE TABLE IF NOT EXISTS journal_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,  -- Optional: for optimized mobile thumbnails
  file_name TEXT,
  file_size INTEGER,  -- Size in bytes
  mime_type TEXT,     -- e.g., image/jpeg, image/png
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,     -- Can store: camera_settings, device_info, annotations, etc.
  display_order INTEGER DEFAULT 0,  -- For ordering multiple screenshots
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_journal_screenshots_journal_id 
  ON journal_screenshots(journal_id);

CREATE INDEX IF NOT EXISTS idx_journal_screenshots_user_id 
  ON journal_screenshots(user_id);

CREATE INDEX IF NOT EXISTS idx_journal_screenshots_created_at 
  ON journal_screenshots(created_at DESC);

-- Add RLS Policies
ALTER TABLE journal_screenshots ENABLE ROW LEVEL SECURITY;

-- Users can only see their own screenshots
CREATE POLICY "Users can view their own screenshots"
  ON journal_screenshots
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own screenshots
CREATE POLICY "Users can insert their own screenshots"
  ON journal_screenshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own screenshots
CREATE POLICY "Users can update their own screenshots"
  ON journal_screenshots
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own screenshots
CREATE POLICY "Users can delete their own screenshots"
  ON journal_screenshots
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update journals table to mark screenshots as preferred field (optional)
-- This allows linking primary screenshot without storing array
ALTER TABLE journals ADD COLUMN IF NOT EXISTS primary_screenshot_id UUID 
  REFERENCES journal_screenshots(id) ON DELETE SET NULL;

-- Create index for primary screenshot lookups
CREATE INDEX IF NOT EXISTS idx_journals_primary_screenshot_id 
  ON journals(primary_screenshot_id);
