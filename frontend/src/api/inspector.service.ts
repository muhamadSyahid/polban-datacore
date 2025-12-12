import apiClient from "./core";

export interface InspectorResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

export const inspectorService = {
  // Ambil daftar nama MV (mv_mahasiswa_gender, dll)
  async getMvList(): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>(
      "/api/datacore/inspector/mv",
    );
    return response.data.data;
  },

  // Ambil isi data MV dengan pagination & search
  async getMvData(
    mvName: string,
    page = 1,
    limit = 10,
    search = "",
  ): Promise<InspectorResponse> {
    const response = await apiClient.get<InspectorResponse>(
      `/api/datacore/inspector/mv/${mvName}`,
      {
        params: {
          page,
          limit,
          q: search || undefined,
        },
      },
    );
    return response.data;
  },
};
