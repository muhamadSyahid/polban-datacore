import apiClient from './core';
import type { LoginPayload, LoginResponse } from '@/types/auth.types';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      payload,
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },
};
