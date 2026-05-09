import apiClient from './client';
import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '../../types';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },

  getMe: async (): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  refreshToken: async (refresh_token: string): Promise<ApiResponse<{ session: any }>> => {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token });
    return data;
  },
};
