import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_CONSTANTS, JOB_NAMES } from '../constants';
import { EtlService } from '../etl/etl.service';

@Processor(QUEUE_CONSTANTS.ETL_QUEUE, { concurrency: 5 })
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(private readonly etlService: EtlService) {
    super();
  }

  async process(
    job: Job<{ triggeredBy: 'cron' | 'manual'; jobName: string }>,
  ): Promise<any> {
    this.logger.debug(`Processing Job [${job.id}] Name: ${job.name}...`);

    try {
      const { jobName, triggeredBy } = job.data;

      // Routing
      switch (jobName) {
        case JOB_NAMES.FULL_SYNC_AND_AGGREGATE:
          await this.etlService.runFullSync(triggeredBy);
          break;

        case JOB_NAMES.SYNC_MAHASISWA:
          await this.etlService.syncMahasiswa(triggeredBy);
          break;
        case JOB_NAMES.SYNC_DOSEN:
          await this.etlService.syncDosen(triggeredBy);
          break;
        case JOB_NAMES.SYNC_AKADEMIK:
          await this.etlService.syncAkademik(triggeredBy);
          break;

        case JOB_NAMES.AGGREGATE_GUEST_DATA:
          await this.etlService.aggregateGuestData(triggeredBy);
          break;
        case JOB_NAMES.AGGREGATE_KEMAHASISWAAN_DATA:
          await this.etlService.aggregateKemahasiswaanData(triggeredBy);
          break;
        case JOB_NAMES.AGGREGATE_AKADEMIK_DATA:
          await this.etlService.aggregateAkademikData(triggeredBy);
          break;

        default:
          this.logger.warn(`Unknown job name: ${jobName}. No action taken.`);
      }

      this.logger.debug(`Job [${job.id}] completed.`);
    } catch (error) {
      this.logger.error(
        `Job [${job.id}] failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
