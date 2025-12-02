import { defineStore } from 'pinia';
import dashboardService from '@/services/dashboard.service';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null,
    loading: false,
    error: null
  }),
  getters: {
    syncStatus: (state) => state.stats?.lastSync?.status,
    lastSyncTime: (state) => state.stats?.lastSync?.finishedAt,
    studentCount: (state) => state.stats?.data?.totalMahasiswa,
    lecturerCount: (state) => state.stats?.data?.totalDosen,
    activeQueue: (state) => (state.stats?.queue?.active || 0) + (state.stats?.queue?.waiting || 0),
    failedQueue: (state) => state.stats?.queue?.failed || 0
  },
  actions: {
    async fetchStats() {
      this.loading = true;
      this.error = null;
      try {
        const response = await dashboardService.getStats();
        this.stats = response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat data statistik.';
        console.error('Error fetching dashboard stats:', err);
      } finally {
        this.loading = false;
      }
    }
  }
});
