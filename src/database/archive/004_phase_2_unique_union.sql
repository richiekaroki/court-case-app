-- Quick verification - should return 4 constraints
SELECT conname FROM pg_constraint 
WHERE conname LIKE 'unique_%'
ORDER BY conname;

-- Should show:
-- unique_case_advocate
-- unique_case_judge
-- unique_case_number
-- unique_related_cases