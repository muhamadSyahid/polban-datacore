import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateJobDto } from './dto/create-job.dto';
import { QUEUE_CONSTANTS, JOB_NAMES } from '../constants';
import { UpdateScheduleDto } from './dto/schedule-job.dto';
import { JobsRepository } from './jobs.repository';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue(QUEUE_CONSTANTS.ETL_QUEUE) private etlQueue: Queue,
    private readonly jobsRepository: JobsRepository,
  ) {}

  async onModuleInit() {
    await this.initDefaultSchedules();
  }

  // Trigger Manual
  async addJobToQueue(dto: CreateJobDto) {
    const job = await this.etlQueue.add(dto.jobName, {
      jobName: dto.jobName,
      triggeredBy: 'manual',
    });
    return {
      message: `Job queued.`,
      queueId: job.id,
      timestamp: new Date(job.timestamp),
    };
  }

  // Schedules
  async updateSchedule(dto: UpdateScheduleDto) {
    await this.jobsRepository.upsertSchedule(
      dto.jobName,
      dto.cronExpression,
      dto.description,
    );

    await this.syncBullMqSchedule(dto.jobName, dto.cronExpression);

    return {
      message: `Schedule for ${dto.jobName} updated to '${dto.cronExpression}'`,
    };
  }

  async getSchedules() {
    return { data: await this.jobsRepository.findAllSchedules() };
  }

  // Helpers

  private async initDefaultSchedules() {
    const existing = await this.jobsRepository.findScheduleByName(
      JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
    );

    if (!existing) {
      this.logger.log('Initializing default schedule: Daily at 00:00');
      await this.updateSchedule({
        jobName: JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
        cronExpression: '0 0 * * *',
        description: 'Daily Full Sync & Aggregate at 00:00',
      });
    } else {
      if (existing.isActive) {
        await this.syncBullMqSchedule(
          existing.jobName,
          existing.cronExpression,
        );
      }
    }
  }

  private async syncBullMqSchedule(jobName: string, cron: string) {
    const repeatableJobs = await this.etlQueue.getJobSchedulers();
    const oldJobs = repeatableJobs.filter((j) => j.name === jobName);

    for (const job of oldJobs) {
      await this.etlQueue.removeJobScheduler(job.key);
    }

    await this.etlQueue.add(
      jobName,
      { jobName, triggeredBy: 'cron' },
      {
        repeat: { pattern: cron },
        jobId: `schedule:${jobName}`,
      },
    );

    this.logger.log(`Synced schedule for ${jobName}: ${cron}`);
  }
}
