import { defineStore } from 'pinia';
import jobService from '@/services/job.service';

export const useJobStore = defineStore('job', {
  state: () => ({
    loading: false,
    error: null,
    success: null,
    history: [],
    historyLoading: false,
    pagination: {
      total: 0,
      perPage: 10,
      currentPage: 1,
      lastPage: 1
    }
  }),
  actions: {
    async triggerJob(jobName) {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        await jobService.runJob(jobName);
        this.success = 'Job berhasil dijadwalkan';
        // Refresh history after successful trigger
        this.fetchHistory();
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menjalankan job';
      } finally {
        this.loading = false;
      }
    },

    async fetchHistory(page = 1) {
      this.historyLoading = true;
      try {
        const response = await jobService.getHistory({ page });
        // Assuming response structure: { data: [...], meta: { total, per_page, current_page, last_page } }
        // Adjust based on actual API response if needed. 
        // If API returns { data: [...], total: 100, page: 1, limit: 10 }, adjust accordingly.
        // Based on common Laravel/NestJS patterns often used in this context:
        const { data, meta } = response.data;
        
        this.history = data || [];
        if (meta) {
            this.pagination = {
                total: meta.total,
                perPage: meta.per_page,
                currentPage: meta.current_page,
                lastPage: meta.last_page
            };
        }
      } catch (error) {
        console.error('Failed to fetch job history:', error);
      } finally {
        this.historyLoading = false;
      }
    }
  },
});
