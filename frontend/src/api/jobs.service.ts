import apiClient from './core';
import type {
  JobHistoryResponse,
  JobSchedule,
  RunJobResponse,
} from '@/types/job.types';

export const jobsService = {
  // Get Available Jobs
  async getAvailableJobs(): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>('/api/jobs');
    return response.data.data;
  },

  // Get History
  async getHistory(page = 1, limit = 10): Promise<JobHistoryResponse> {
    const response = await apiClient.get<JobHistoryResponse>(
      '/api/datacore/jobs/history',
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  // Trigger Manual Job
  async runJob(jobName: string): Promise<RunJobResponse> {
    const response = await apiClient.post<RunJobResponse>('/api/jobs/run', {
      jobName,
    });
    return response.data;
  },

  // Get Schedules
  async getSchedules(): Promise<{ data: JobSchedule[] }> {
    const response = await apiClient.get<{ data: JobSchedule[] }>(
      '/api/jobs/schedules',
    );
    return response.data;
  },

  // Update Schedule
  async updateSchedule(payload: {
    jobName: string;
    cronExpression?: string;
    description?: string;
    isActive?: boolean;
  }) {
    const response = await apiClient.put('/api/jobs/schedules', payload);
    return response.data;
  },

  // Delete Schedule
  async deleteSchedule(jobName: string) {
    const response = await apiClient.delete('/api/jobs/schedules', {
      data: { jobName },
    });
    return response.data;
  },
};
