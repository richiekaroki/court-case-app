-- Grant ALL permissions to your user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO court_cases_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO court_cases_user;
GRANT USAGE ON SCHEMA public TO court_cases_user;

-- If you need to grant for future tables too:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO court_cases_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO court_cases_user;