export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'worker' | 'employer';
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string;
}
