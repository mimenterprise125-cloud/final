-- Migration to add performance_analytics_locked column to admin_settings
-- This allows locking all analytics sections below the Equity Curve on the Performance page

-- Add the new column if it doesn't exist
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS performance_analytics_locked BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'admin_settings' 
ORDER BY ordinal_position;

-- You can also manually update the existing row if needed:
-- UPDATE admin_settings 
-- SET performance_analytics_locked = FALSE 
-- WHERE id = 'default';
