// ─── User & Profile Types ────────────────────────────────────────

export type UserRole = 'worker' | 'employer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile extends UserProfile {
  skills: string[];
  experience?: string;
  location: string;
  bio?: string;
  available: boolean;
}

export interface EmployerProfile extends UserProfile {
  company_name?: string;
  company_logo_url?: string;
  location: string;
  description?: string;
}

export type FullProfile = WorkerProfile | EmployerProfile;

// ─── Auth Types ──────────────────────────────────────────────────

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
}

export interface AuthResponse {
  user: UserProfile;
  session: Session;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  location: string;
  skills?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Job Types ───────────────────────────────────────────────────

export type JobType = 'full-time' | 'part-time' | 'contract' | 'daily';
export type SalaryPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  category: string;
  job_type: JobType;
  salary_amount: number;
  salary_period: SalaryPeriod;
  location: string;
  requirements: string[];
  is_active: boolean;
  applicants_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    name: string;
    avatar_url?: string;
    employer_profiles?: {
      company_name?: string;
      company_logo_url?: string;
      description?: string;
    };
  };
  employer_profiles?: {
    company_name?: string;
    company_logo_url?: string;
    description?: string;
  } | null;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    nextCursor: string | null;
    limit: number;
  };
}

export interface CreateJobPayload {
  title: string;
  description: string;
  category: string;
  job_type: JobType;
  salary_amount: number;
  salary_period: SalaryPeriod;
  location: string;
  requirements?: string[];
}

export interface JobFilters {
  category?: string;
  job_type?: JobType;
  location?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

// ─── Application Types ──────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  message?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  jobs?: Job;
  profiles?: {
    name: string;
    email: string;
    phone: string;
    avatar_url?: string;
    worker_profiles?: {
      skills: string[];
      experience?: string;
      location: string;
    };
  };
  worker_profiles?: {
    skills: string[];
    experience?: string;
    location: string;
  } | null;
}

export interface CreateApplicationPayload {
  job_id: string;
  message?: string;
}

// ─── Profile Update Types ───────────────────────────────────────

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar_url?: string;
  avatar_base64?: string;
  avatar_type?: string;
  // Worker-specific
  skills?: string[];
  experience?: string;
  location?: string;
  bio?: string;
  // Employer-specific
  company_name?: string;
  company_logo_url?: string;
  description?: string;
}

// ─── API Response ────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string;
}

// ─── Navigation Types ────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type WorkerTabParamList = {
  Home: undefined;
  MyApplications: undefined;
  Profile: undefined;
};

export type EmployerTabParamList = {
  Dashboard: undefined;
  Discover: undefined;
  MyJobs: undefined;
  Profile: undefined;
};

export type WorkerStackParamList = {
  WorkerTabs: undefined;
  JobDetail: { jobId: string };
  EmployerPublicProfile: { employerData: any };
};

export type EmployerStackParamList = {
  EmployerTabs: undefined;
  CreateJob: undefined;
  Applicants: { jobId: string; jobTitle: string };
  EditJob: { job: Job };
  WorkerPublicProfile: { workerData: any };
};
