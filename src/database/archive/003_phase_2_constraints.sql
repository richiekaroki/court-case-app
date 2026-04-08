-- ============================================
-- PHASE 2 MIGRATION: PRODUCTION GRADE (COMPLETE)
-- Based on your script + guide improvements
-- ============================================

-- ============================================
-- 1. UNIQUE CONSTRAINTS (Idempotent - can rerun safely)
-- ============================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_case_advocate') THEN
        ALTER TABLE case_advocate ADD CONSTRAINT unique_case_advocate UNIQUE (case_id, advocate_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_case_judge') THEN
        ALTER TABLE case_judge ADD CONSTRAINT unique_case_judge UNIQUE (case_id, judge_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_related_cases') THEN
        ALTER TABLE related_cases ADD CONSTRAINT unique_related_cases UNIQUE (parent_case_id, child_case_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_case_number') THEN
        ALTER TABLE court_case ADD CONSTRAINT unique_case_number UNIQUE (case_number);
    END IF;
END $$;

-- ============================================
-- 2. DATA CLEANUP (Prevents migration failures)
-- ============================================

-- Remove duplicates before adding constraints
DELETE FROM case_advocate a USING case_advocate b
WHERE a.id > b.id AND a.case_id = b.case_id AND a.advocate_id = b.advocate_id;

DELETE FROM case_judge a USING case_judge b
WHERE a.id > b.id AND a.case_id = b.case_id AND a.judge_id = b.judge_id;

DELETE FROM related_cases a USING related_cases b
WHERE a.id > b.id AND a.parent_case_id = b.parent_case_id AND a.child_case_id = b.child_case_id;

-- ============================================
-- 3. INDEXES (Your original + missing critical ones)
-- ============================================

-- Case indexes
CREATE INDEX IF NOT EXISTS idx_case_court_id ON court_case(court_id);
CREATE INDEX IF NOT EXISTS idx_case_date_delivered ON court_case(date_delivered);

-- 🔥 NEW: Compound index for court+date queries
CREATE INDEX IF NOT EXISTS idx_case_court_date ON court_case(court_id, date_delivered);

-- Advocate indexes
CREATE INDEX IF NOT EXISTS idx_advocate_name ON advocate(name);

-- 🔥 NEW: Judge indexes (critical for search)
CREATE INDEX IF NOT EXISTS idx_judge_name ON judge(name);

-- Court indexes
CREATE INDEX IF NOT EXISTS idx_court_county_id ON court(county_id);

-- Party indexes
CREATE INDEX IF NOT EXISTS idx_party_case_id ON party(case_id);

-- 🔥 NEW: Party name index (for search)
CREATE INDEX IF NOT EXISTS idx_party_name ON party(name);

-- CaseHistory indexes
CREATE INDEX IF NOT EXISTS idx_case_history_case_id ON case_history(case_id);

-- 🔥 NEW: Docket number index (for lookups)
CREATE INDEX IF NOT EXISTS idx_case_history_docket ON case_history(history_docket_no);

-- ============================================
-- 4. NOT NULL CONSTRAINTS (Your original)
-- ============================================

ALTER TABLE county ALTER COLUMN county SET NOT NULL;
ALTER TABLE advocate ALTER COLUMN name SET NOT NULL;

-- ============================================
-- 5. VERIFICATION QUERIES (Your original)
-- ============================================

-- Check constraints
SELECT 
    con.conname AS constraint_name,
    rel.relname AS table_name,
    contype AS constraint_type
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
WHERE rel.relname IN ('court_case', 'case_advocate', 'case_judge', 'related_cases')
ORDER BY rel.relname, con.conname;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('court_case', 'advocate', 'judge', 'court', 'party', 'case_history')
ORDER BY tablename, indexname;

-- ============================================
-- 6. ROLLBACK (Your original)
-- ============================================

/*
ALTER TABLE case_advocate DROP CONSTRAINT IF EXISTS unique_case_advocate;
ALTER TABLE case_judge DROP CONSTRAINT IF EXISTS unique_case_judge;
ALTER TABLE related_cases DROP CONSTRAINT IF EXISTS unique_related_cases;
ALTER TABLE court_case DROP CONSTRAINT IF EXISTS unique_case_number;

DROP INDEX IF EXISTS idx_case_court_id;
DROP INDEX IF EXISTS idx_case_date_delivered;
DROP INDEX IF EXISTS idx_case_court_date;
DROP INDEX IF EXISTS idx_advocate_name;
DROP INDEX IF EXISTS idx_judge_name;
DROP INDEX IF EXISTS idx_court_county_id;
DROP INDEX IF EXISTS idx_party_case_id;
DROP INDEX IF EXISTS idx_party_name;
DROP INDEX IF EXISTS idx_case_history_case_id;
DROP INDEX IF EXISTS idx_case_history_docket;
*/