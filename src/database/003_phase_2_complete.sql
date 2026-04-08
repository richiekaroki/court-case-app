-- ============================================
-- PHASE 2 COMPLETE - Idempotent Migration
-- Kenya Court Cases App
-- ============================================

-- ============================================
-- 1. TABLES (Create if not exists)
-- ============================================

-- Court case main table
CREATE TABLE IF NOT EXISTS court_case (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    citation VARCHAR(200),
    parties TEXT,
    case_action TEXT,
    pdf_file_path VARCHAR(500),
    date_delivered TIMESTAMP,
    case_class VARCHAR(50),
    court_id INTEGER NOT NULL,
    court_division VARCHAR(100),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Judge table
CREATE TABLE IF NOT EXISTS judge (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case-Judge junction table
CREATE TABLE IF NOT EXISTS case_judge (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL,
    judge_id INTEGER NOT NULL
);

-- Advocate table
CREATE TABLE IF NOT EXISTS advocate (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case-Advocate junction table
CREATE TABLE IF NOT EXISTS case_advocate (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL,
    advocate_id INTEGER NOT NULL
);

-- Party table
CREATE TABLE IF NOT EXISTS party (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case History table
CREATE TABLE IF NOT EXISTS case_history (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL,
    history_docket_no VARCHAR(100) NOT NULL,
    history_county_id INTEGER,
    history_judge_id INTEGER,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Related Cases table
CREATE TABLE IF NOT EXISTS related_cases (
    id SERIAL PRIMARY KEY,
    parent_case_id INTEGER NOT NULL,
    child_case_id INTEGER NOT NULL
);

-- Scraper state table
CREATE TABLE IF NOT EXISTS scraper_state (
    id SERIAL PRIMARY KEY,
    last_page INTEGER,
    last_case_number VARCHAR(100),
    last_scraped_date TIMESTAMP,
    total_cases_scraped INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'idle',
    last_error TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. FOREIGN KEY CONSTRAINTS (Safe add)
-- ============================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'court_case_court_id_fkey') THEN
        ALTER TABLE court_case ADD CONSTRAINT court_case_court_id_fkey 
        FOREIGN KEY (court_id) REFERENCES court(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_judge_case_id_fkey') THEN
        ALTER TABLE case_judge ADD CONSTRAINT case_judge_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES court_case(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_judge_judge_id_fkey') THEN
        ALTER TABLE case_judge ADD CONSTRAINT case_judge_judge_id_fkey 
        FOREIGN KEY (judge_id) REFERENCES judge(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_advocate_case_id_fkey') THEN
        ALTER TABLE case_advocate ADD CONSTRAINT case_advocate_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES court_case(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_advocate_advocate_id_fkey') THEN
        ALTER TABLE case_advocate ADD CONSTRAINT case_advocate_advocate_id_fkey 
        FOREIGN KEY (advocate_id) REFERENCES advocate(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'party_case_id_fkey') THEN
        ALTER TABLE party ADD CONSTRAINT party_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES court_case(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_history_case_id_fkey') THEN
        ALTER TABLE case_history ADD CONSTRAINT case_history_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES court_case(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_history_history_county_id_fkey') THEN
        ALTER TABLE case_history ADD CONSTRAINT case_history_history_county_id_fkey 
        FOREIGN KEY (history_county_id) REFERENCES county(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_history_history_judge_id_fkey') THEN
        ALTER TABLE case_history ADD CONSTRAINT case_history_history_judge_id_fkey 
        FOREIGN KEY (history_judge_id) REFERENCES judge(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'related_cases_parent_case_id_fkey') THEN
        ALTER TABLE related_cases ADD CONSTRAINT related_cases_parent_case_id_fkey 
        FOREIGN KEY (parent_case_id) REFERENCES court_case(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'related_cases_child_case_id_fkey') THEN
        ALTER TABLE related_cases ADD CONSTRAINT related_cases_child_case_id_fkey 
        FOREIGN KEY (child_case_id) REFERENCES court_case(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 3. UNIQUE CONSTRAINTS
-- ============================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_case_number') THEN
        ALTER TABLE court_case ADD CONSTRAINT unique_case_number UNIQUE (case_number);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_judge_name') THEN
        ALTER TABLE judge ADD CONSTRAINT unique_judge_name UNIQUE (name);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_advocate_name') THEN
        ALTER TABLE advocate ADD CONSTRAINT unique_advocate_name UNIQUE (name);
    END IF;
END $$;

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

-- ============================================
-- 4. INDEXES (Drop if exists, then create)
-- ============================================

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
DROP INDEX IF EXISTS idx_case_number;

CREATE INDEX idx_case_court_id ON court_case(court_id);
CREATE INDEX idx_case_date_delivered ON court_case(date_delivered);
CREATE INDEX idx_case_court_date ON court_case(court_id, date_delivered);
CREATE INDEX idx_advocate_name ON advocate(name);
CREATE INDEX idx_judge_name ON judge(name);
CREATE INDEX idx_court_county_id ON court(county_id);
CREATE INDEX idx_party_case_id ON party(case_id);
CREATE INDEX idx_party_name ON party(name);
CREATE INDEX idx_case_history_case_id ON case_history(case_id);
CREATE INDEX idx_case_history_docket ON case_history(history_docket_no);
CREATE INDEX idx_case_number ON court_case(case_number);

-- ============================================
-- 5. TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_court_case_modtime ON court_case;
DROP TRIGGER IF EXISTS update_judge_modtime ON judge;
DROP TRIGGER IF EXISTS update_advocate_modtime ON advocate;
DROP TRIGGER IF EXISTS update_party_modtime ON party;
DROP TRIGGER IF EXISTS update_case_history_modtime ON case_history;

CREATE TRIGGER update_court_case_modtime BEFORE UPDATE ON court_case FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_judge_modtime BEFORE UPDATE ON judge FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_advocate_modtime BEFORE UPDATE ON advocate FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_party_modtime BEFORE UPDATE ON party FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_case_history_modtime BEFORE UPDATE ON case_history FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================
-- 6. INITIAL SEED DATA
-- ============================================

INSERT INTO scraper_state (id, status, updated_at) 
VALUES (1, 'idle', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. VERIFICATION
-- ============================================

-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check all constraints
SELECT conname, contype FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY conname;

-- Check all indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- ============================================
-- 8. ROLLBACK (commented)
-- ============================================

/*
-- Drop triggers
DROP TRIGGER IF EXISTS update_court_case_modtime ON court_case;
DROP TRIGGER IF EXISTS update_judge_modtime ON judge;
DROP TRIGGER IF EXISTS update_advocate_modtime ON advocate;
DROP TRIGGER IF EXISTS update_party_modtime ON party;
DROP TRIGGER IF EXISTS update_case_history_modtime ON case_history;

-- Drop indexes
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
DROP INDEX IF EXISTS idx_case_number;

-- Drop constraints
ALTER TABLE court_case DROP CONSTRAINT IF EXISTS unique_case_number;
ALTER TABLE judge DROP CONSTRAINT IF EXISTS unique_judge_name;
ALTER TABLE advocate DROP CONSTRAINT IF EXISTS unique_advocate_name;
ALTER TABLE case_advocate DROP CONSTRAINT IF EXISTS unique_case_advocate;
ALTER TABLE case_judge DROP CONSTRAINT IF EXISTS unique_case_judge;
ALTER TABLE related_cases DROP CONSTRAINT IF EXISTS unique_related_cases;

-- Drop foreign keys
ALTER TABLE court_case DROP CONSTRAINT IF EXISTS court_case_court_id_fkey;
ALTER TABLE case_judge DROP CONSTRAINT IF EXISTS case_judge_case_id_fkey;
ALTER TABLE case_judge DROP CONSTRAINT IF EXISTS case_judge_judge_id_fkey;
ALTER TABLE case_advocate DROP CONSTRAINT IF EXISTS case_advocate_case_id_fkey;
ALTER TABLE case_advocate DROP CONSTRAINT IF EXISTS case_advocate_advocate_id_fkey;
ALTER TABLE party DROP CONSTRAINT IF EXISTS party_case_id_fkey;
ALTER TABLE case_history DROP CONSTRAINT IF EXISTS case_history_case_id_fkey;
ALTER TABLE case_history DROP CONSTRAINT IF EXISTS case_history_history_county_id_fkey;
ALTER TABLE case_history DROP CONSTRAINT IF EXISTS case_history_history_judge_id_fkey;
ALTER TABLE related_cases DROP CONSTRAINT IF EXISTS related_cases_parent_case_id_fkey;
ALTER TABLE related_cases DROP CONSTRAINT IF EXISTS related_cases_child_case_id_fkey;
*/