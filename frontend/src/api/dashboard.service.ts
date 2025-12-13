import apiClient from './core';
import type { DashboardStatsResponse } from '@/types/dashboard.types';

export const dashboardService = {
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await apiClient.get<DashboardStatsResponse>(
      '/api/datacore/dashboard/stats',
    );
    return response.data;
  },
};
