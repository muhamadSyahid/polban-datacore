export interface InspectorResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}
