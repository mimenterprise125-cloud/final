-- ============================================================================
-- UPGRADE: Individual Lock Types for Each Feature
-- Add separate lock_type setting for PropFirm, Journal, and Performance Analytics
-- ============================================================================

-- 1. ADD NEW COLUMNS FOR INDIVIDUAL LOCK TYPES
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS propfirm_lock_type TEXT DEFAULT 'development' CHECK (propfirm_lock_type IN ('development', 'premium')),
ADD COLUMN IF NOT EXISTS journal_lock_type TEXT DEFAULT 'development' CHECK (journal_lock_type IN ('development', 'premium')),
ADD COLUMN IF NOT EXISTS performance_lock_type TEXT DEFAULT 'development' CHECK (performance_lock_type IN ('development', 'premium'));

-- 2. KEEP LEGACY lock_type FOR BACKWARD COMPATIBILITY (deprecated)
-- This will no longer be used but kept for safety

-- 3. VERIFY THE UPDATE
SELECT 
  propfirm_lock_type,
  journal_lock_type,
  performance_lock_type
FROM admin_settings
WHERE id = 'default';

-- SUCCESS! Each feature now has its own lock type.
