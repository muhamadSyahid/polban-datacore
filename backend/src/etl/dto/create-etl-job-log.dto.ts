export class CreateEtlJobLogDto {
  jobName: string;
  triggeredBy: 'cron' | 'manual';
}
