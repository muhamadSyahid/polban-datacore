export interface DashboardStatsResponse {
  lastSync: {
    status: 'success' | 'failed' | 'running' | 'pending';
    finishedAt: string | null;
    duration: string | null;
  };
  queue: {
    active: number;
    waiting: number;
    failed: number;
  };
  data: {
    totalMahasiswa: number;
    totalDosen: number;
    totalDataAkademikNilai: number;
    totalDataAkademikIp: number;
  };
}
