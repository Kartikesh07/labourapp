import apiClient from './client';
import { ApiResponse, Job, JobsResponse, CreateJobPayload, JobFilters } from '../../types';

export const jobsApi = {
  getJobs: async (filters: JobFilters = {}): Promise<ApiResponse<JobsResponse>> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.job_type) params.append('job_type', filters.job_type);
    if (filters.location) params.append('location', filters.location);
    if (filters.search) params.append('search', filters.search);
    if (filters.cursor) params.append('cursor', filters.cursor);
    if (filters.limit) params.append('limit', String(filters.limit));

    const { data } = await apiClient.get(`/jobs?${params.toString()}`);
    return data;
  },

  getJobById: async (id: string): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.get(`/jobs/${id}`);
    return data;
  },

  getMyJobs: async (): Promise<ApiResponse<Job[]>> => {
    const { data } = await apiClient.get('/jobs/employer/my-jobs');
    return data;
  },

  createJob: async (payload: CreateJobPayload): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.post('/jobs', payload);
    return data;
  },

  updateJob: async (id: string, payload: Partial<CreateJobPayload>): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.put(`/jobs/${id}`, payload);
    return data;
  },

  deleteJob: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/jobs/${id}`);
    return data;
  },
};
