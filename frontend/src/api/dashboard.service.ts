import apiClient from "./core";

// Definisi Tipe Data (DTO) sesuai response backend
export interface DashboardStats {
  lastSync: {
    status: "success" | "failed" | "running" | "pending";
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
    totalDataAkademik: number;
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(
      "/api/datacore/dashboard/stats",
    );
    return response.data;
  },
};
