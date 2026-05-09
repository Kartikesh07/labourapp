-- Migration: Initial Schema for LaborLink

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('worker', 'employer')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Worker Profiles Table
CREATE TABLE worker_profiles (
    id UUID REFERENCES profiles(id) PRIMARY KEY,
    skills TEXT[] DEFAULT '{}',
    experience TEXT,
    location TEXT NOT NULL,
    bio TEXT,
    available BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Employer Profiles Table
CREATE TABLE employer_profiles (
    id UUID REFERENCES profiles(id) PRIMARY KEY,
    company_name TEXT,
    company_logo_url TEXT,
    location TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Jobs Table
CREATE TABLE jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'daily')),
    salary_amount NUMERIC NOT NULL,
    salary_period TEXT NOT NULL CHECK (salary_period IN ('hourly', 'daily', 'weekly', 'monthly')),
    location TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    applicants_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Applications Table
CREATE TABLE applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) NOT NULL,
    worker_id UUID REFERENCES profiles(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- 6. Saved Jobs Table
CREATE TABLE saved_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) NOT NULL,
    worker_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Worker Profiles Policies
CREATE POLICY "Anyone can view worker profiles" ON worker_profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "Workers can update their own profile" ON worker_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Employer Profiles Policies
CREATE POLICY "Anyone can view employer profiles" ON employer_profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "Employers can update their own profile" ON employer_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Jobs Policies
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Employers can view all their jobs" ON jobs
    FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs" ON jobs
    FOR UPDATE USING (auth.uid() = employer_id);

-- Applications Policies
CREATE POLICY "Workers can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Employers can view applications for their jobs" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.employer_id = auth.uid()
        )
    );

CREATE POLICY "Employers can update applications for their jobs" ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.employer_id = auth.uid()
        )
    );

-- Saved Jobs Policies
CREATE POLICY "Workers can view their saved jobs" ON saved_jobs
    FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers can save jobs" ON saved_jobs
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can remove their saved jobs" ON saved_jobs
    FOR DELETE USING (auth.uid() = worker_id);

-- Triggers and Functions

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, phone, role)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'role'
    );
    
    -- Also create the specific role profile
    IF new.raw_user_meta_data->>'role' = 'worker' THEN
        INSERT INTO public.worker_profiles (id, location, skills)
        VALUES (
            new.id, 
            COALESCE(new.raw_user_meta_data->>'location', 'Not specified'),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(new.raw_user_meta_data->'skills', '[]'::jsonb)))
        );
    ELSIF new.raw_user_meta_data->>'role' = 'employer' THEN
        INSERT INTO public.employer_profiles (id, location, company_name)
        VALUES (
            new.id, 
            COALESCE(new.raw_user_meta_data->>'location', 'Not specified'),
            new.raw_user_meta_data->>'company_name'
        );
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically increment/decrement applicants_count
CREATE OR REPLACE FUNCTION public.update_applicants_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.jobs
        SET applicants_count = applicants_count + 1
        WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.jobs
        SET applicants_count = applicants_count - 1
        WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_change ON applications;
CREATE TRIGGER on_application_change
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION public.update_applicants_count();

-- Update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_worker_profiles_modtime ON worker_profiles;
CREATE TRIGGER update_worker_profiles_modtime BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_employer_profiles_modtime ON employer_profiles;
CREATE TRIGGER update_employer_profiles_modtime BEFORE UPDATE ON employer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_jobs_modtime ON jobs;
CREATE TRIGGER update_jobs_modtime BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_applications_modtime ON applications;
CREATE TRIGGER update_applications_modtime BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
