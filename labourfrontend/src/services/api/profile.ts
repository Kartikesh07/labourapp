import apiClient from './client';
import { ApiResponse, FullProfile, UpdateProfilePayload } from '../../types';

export const profileApi = {
  getProfile: async (): Promise<ApiResponse<FullProfile>> => {
    const { data } = await apiClient.get('/profile');
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<FullProfile>> => {
    const { data } = await apiClient.put('/profile', payload);
    return data;
  },

  updateAvailability: async (available: boolean): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.patch('/profile/availability', { available });
    return data;
  },
};
