-- ============================================
-- Migration: Rename court.name to courtName
-- Date: 2026-04-08
-- Purpose: Align database column name with Sequelize model
-- Issue: Court model expected 'courtName' but database had 'name'
-- ============================================

-- Rename the column
ALTER TABLE court RENAME COLUMN name TO "courtName";

-- Update any views or functions that might reference the old column name
-- (Check if any exist first)

-- Verify the change
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'court' 
        AND column_name = 'courtName'
    ) THEN
        RAISE NOTICE '✅ Column successfully renamed to courtName';
    ELSE
        RAISE EXCEPTION '❌ Column rename failed';
    END IF;
END $$;

-- Display the current court table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'court'
ORDER BY ordinal_position;

-- Note: This migration is one-way only (rename)
-- To rollback: ALTER TABLE court RENAME COLUMN "courtName" TO name;