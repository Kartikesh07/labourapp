-- SQL query to truncate all tables and reset the identity counters
-- The CASCADE keyword ensures that dependent rows in child tables are also safely removed, 
-- bypassing foreign key blockages.

BEGIN;

TRUNCATE TABLE 
    public.saved_jobs,
    public.applications,
    public.jobs,
    public.employer_profiles,
    public.worker_profiles,
    public.profiles 
CASCADE;

-- -----------------------------------------------------------------------------------------
-- NOTE: If you also want to completely wipe all registered user accounts from Supabase Auth 
-- (so you can register from scratch), uncomment the line below before running:
-- -----------------------------------------------------------------------------------------

TRUNCATE TABLE auth.users CASCADE;

COMMIT;
