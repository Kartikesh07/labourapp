import apiClient from './client';

export interface WorkerFilterParams {
  skill?: string;
  location?: string;
}

export const fetchWorkers = async (params: WorkerFilterParams = {}) => {
  const query = new URLSearchParams();
  if (params.skill) query.append('skill', params.skill);
  if (params.location) query.append('location', params.location);
  
  const response = await apiClient.get(`/workers?${query.toString()}`);
  return response.data;
};
