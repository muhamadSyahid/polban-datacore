export class EtlJobLogDto {
  id: string;
  jobName: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  triggeredBy: 'cron' | 'manual';
  startTime: Date;
  endTime: Date | null;
  logMessage: string | null;
}
