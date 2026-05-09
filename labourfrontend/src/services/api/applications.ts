import apiClient from './client';
import { ApiResponse, Application, CreateApplicationPayload, ApplicationStatus } from '../../types';

export const applicationsApi = {
  apply: async (payload: CreateApplicationPayload): Promise<ApiResponse<Application>> => {
    const { data } = await apiClient.post('/applications', payload);
    return data;
  },

  getMyApplications: async (): Promise<ApiResponse<Application[]>> => {
    const { data } = await apiClient.get('/applications/my-applications');
    return data;
  },

  getJobApplicants: async (jobId: string): Promise<ApiResponse<Application[]>> => {
    const { data } = await apiClient.get(`/applications/job/${jobId}`);
    return data;
  },

  updateStatus: async (
    id: string,
    status: ApplicationStatus
  ): Promise<ApiResponse<Application>> => {
    const { data } = await apiClient.patch(`/applications/${id}/status`, { status });
    return data;
  },
};
