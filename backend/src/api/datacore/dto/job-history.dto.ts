export class JobHistoryItemDto {
  id: string;
  jobName: string;
  status: string;
  triggeredBy: string;
  startTime: Date;
  endTime: Date | null;
  duration: string;
}

export class JobHistoryListDto {
  data: JobHistoryItemDto[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}
