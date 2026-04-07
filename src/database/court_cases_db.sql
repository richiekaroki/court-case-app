-- Court Cases App - PostgreSQL Database Schema
-- Generated from Sequelize Models

-- ============================================
-- Drop existing tables (if recreating)
-- ============================================
DROP TABLE IF EXISTS related_cases CASCADE;
DROP TABLE IF EXISTS case_advocate CASCADE;
DROP TABLE IF EXISTS case_judge CASCADE;
DROP TABLE IF EXISTS case_history CASCADE;
DROP TABLE IF EXISTS party CASCADE;
DROP TABLE IF EXISTS court_case CASCADE;
DROP TABLE IF EXISTS advocate CASCADE;
DROP TABLE IF EXISTS judge CASCADE;
DROP TABLE IF EXISTS court CASCADE;
DROP TABLE IF EXISTS county CASCADE;
DROP TABLE IF EXISTS initial_run CASCADE;

-- ============================================
-- Create Tables
-- ============================================

-- County Table
CREATE TABLE county (
    id SERIAL PRIMARY KEY,
    county VARCHAR(255) NOT NULL,
    date_created TIMESTAMP,
    date_modified TIMESTAMP
);

-- Court Table
CREATE TABLE court (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    county_id INTEGER REFERENCES county(id) ON DELETE SET NULL,
    date_created TIMESTAMP NOT NULL,
    date_modified TIMESTAMP NOT NULL
);

-- Advocate Table
CREATE TABLE advocate (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    date_created TIMESTAMP,
    date_modified TIMESTAMP
);

-- Judge Table
CREATE TABLE judge (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    date_created TIMESTAMP,
    date_modified TIMESTAMP
);

-- Case Table (Main table for court cases)
CREATE TABLE court_case (
    id SERIAL PRIMARY KEY,
    case_number TEXT NOT NULL,
    parties TEXT,
    title TEXT NOT NULL,
    citation TEXT NOT NULL,
    case_action VARCHAR(255),
    pdf_file_path TEXT,
    date_delivered TIMESTAMP NOT NULL,
    case_class VARCHAR(255),
    court_id INTEGER NOT NULL REFERENCES court(id) ON DELETE CASCADE,
    court_division VARCHAR(255),
    date_created TIMESTAMP,
    date_modified TIMESTAMP
);

-- Party Table (Links parties to cases)
CREATE TABLE party (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    case_id INTEGER NOT NULL REFERENCES court_case(id) ON DELETE CASCADE,
    date_created TIMESTAMP,
    date_modified TIMESTAMP
);

-- Case-Advocate Junction Table (Many-to-Many)
CREATE TABLE case_advocate (
    id SERIAL PRIMARY KEY,
    advocate_id INTEGER REFERENCES advocate(id) ON DELETE CASCADE,
    case_id INTEGER REFERENCES court_case(id) ON DELETE CASCADE
);

-- Case-Judge Junction Table (Many-to-Many)
CREATE TABLE case_judge (
    id SERIAL PRIMARY KEY,
    judge_id INTEGER REFERENCES judge(id) ON DELETE CASCADE,
    case_id INTEGER REFERENCES court_case(id) ON DELETE CASCADE
);

-- Case History Table
CREATE TABLE case_history (
    id SERIAL PRIMARY KEY,
    history_docket_no VARCHAR(255) NOT NULL,
    history_county_id INTEGER REFERENCES county(id) ON DELETE SET NULL,
    history_judge_id INTEGER REFERENCES judge(id) ON DELETE SET NULL,
    case_id INTEGER NOT NULL REFERENCES court_case(id) ON DELETE CASCADE,
    date_created TIMESTAMP,
    date_modified TIMESTAMP
);

-- Related Cases Table (self-referencing for case relationships)
CREATE TABLE related_cases (
    id SERIAL PRIMARY KEY,
    parent_case_id INTEGER NOT NULL REFERENCES court_case(id) ON DELETE CASCADE,
    child_case_id INTEGER NOT NULL REFERENCES court_case(id) ON DELETE CASCADE
);

-- Initial Run Table (tracks scraper run status)
CREATE TABLE initial_run (
    id SERIAL PRIMARY KEY,
    initial_run INTEGER NOT NULL
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Indexes on frequently queried columns
CREATE INDEX idx_court_case_case_number ON court_case(case_number);
CREATE INDEX idx_court_case_court_id ON court_case(court_id);
CREATE INDEX idx_court_case_date_delivered ON court_case(date_delivered);
CREATE INDEX idx_party_case_id ON party(case_id);
CREATE INDEX idx_case_advocate_case_id ON case_advocate(case_id);
CREATE INDEX idx_case_advocate_advocate_id ON case_advocate(advocate_id);
CREATE INDEX idx_case_judge_case_id ON case_judge(case_id);
CREATE INDEX idx_case_judge_judge_id ON case_judge(judge_id);
CREATE INDEX idx_case_history_case_id ON case_history(case_id);
CREATE INDEX idx_court_county_id ON court(county_id);
CREATE INDEX idx_related_cases_parent ON related_cases(parent_case_id);
CREATE INDEX idx_related_cases_child ON related_cases(child_case_id);

-- ============================================
-- Insert Initial Data (Optional)
-- ============================================

-- Initialize the initial_run tracker
INSERT INTO initial_run (initial_run) VALUES (0);

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE county IS 'Stores county/location information';
COMMENT ON TABLE court IS 'Stores court information with reference to county';
COMMENT ON TABLE advocate IS 'Stores advocate/lawyer information';
COMMENT ON TABLE judge IS 'Stores judge information';
COMMENT ON TABLE court_case IS 'Main table storing all court case details';
COMMENT ON TABLE party IS 'Stores parties involved in cases (plaintiff, defendant, etc.)';
COMMENT ON TABLE case_advocate IS 'Junction table linking cases to advocates';
COMMENT ON TABLE case_judge IS 'Junction table linking cases to judges';
COMMENT ON TABLE case_history IS 'Stores historical information about cases';
COMMENT ON TABLE related_cases IS 'Links related cases together';
COMMENT ON TABLE initial_run IS 'Tracks whether initial scraper run has been completed';