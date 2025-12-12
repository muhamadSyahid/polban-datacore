export interface JobLog {
  id: string;
  jobName: string;
  status: "pending" | "running" | "success" | "failed";
  triggeredBy: "cron" | "manual" | "webhook";
  startTime: string;
  endTime?: string;
  duration?: string;
  logMessage?: string;
}

export interface JobSchedule {
  id: string;
  jobName: string;
  cronExpression: string;
  description?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface JobHistoryResponse {
  data: JobLog[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

export interface RunJobResponse {
  message: string;
  queueId: string;
  timestamp: string;
}
