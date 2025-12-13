export class DashboardStatsDto {
  lastSync: {
    status: string;
    finishedAt: Date | null;
    duration: string;
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
