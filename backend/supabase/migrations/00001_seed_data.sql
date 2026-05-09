-- 1. Create Employer User in auth.users
-- Note: Replace the standard pgcrypto crypt hash with a valid Supabase bcrypt hash if running manually
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'employer@laborlink.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"name":"Acme Builders","phone":"1112223333","role":"employer","company_name":"Acme Builders Inc."}', NOW(), NOW(), 'authenticated', 'authenticated', ''),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'worker@laborlink.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"name":"John Doe","phone":"4445556666","role":"worker","location":"Seattle, WA"}', NOW(), NOW(), 'authenticated', 'authenticated', '');

-- Wait for the handle_new_user() trigger to automatically create rows in 'profiles', 'worker_profiles', and 'employer_profiles' tables.

-- 2. Create Dummy Jobs
INSERT INTO public.jobs (id, employer_id, title, description, category, job_type, salary_amount, salary_period, location, requirements, is_active, created_at, updated_at)
VALUES 
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Expert Carpenter Needed', 'Looking for an experienced carpenter for full-time work on a new commercial building site.', 'carpentry', 'full-time', 35, 'hourly', 'Seattle, WA', '{"3+ years experience","Own tools","Reliable transportation"}', TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Site Cleanup Crew', 'Need 2 workers for post-construction site cleanup.', 'cleaning', 'daily', 150, 'daily', 'Bellevue, WA', '{"Heavy lifting capability","Punctual"}', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- 3. Create Dummy Applications
-- Note: inserting an application automatically triggers 'update_applicants_count' to increment the applicants_count in 'jobs'
INSERT INTO public.applications (id, job_id, worker_id, status, message, created_at, updated_at)
VALUES 
('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'pending', 'I have 5 years of carpentry experience and can start immediately.', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');