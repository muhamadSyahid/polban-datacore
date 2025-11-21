import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateJobDto } from './dto/create-job.dto';
import { QUEUE_CONSTANTS } from '../constants';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(QUEUE_CONSTANTS.ETL_QUEUE) private etlQueue: Queue,
  ) {}

  async addJobToQueue(dto: CreateJobDto) {
    const job = await this.etlQueue.add(dto.jobName, {
      jobName: dto.jobName,
      triggeredBy: 'manual',
    });

    return {
      message: `Job '${dto.jobName}' has been queued successfully.`,
      queueId: job.id,
      timestamp: new Date(),
    };
  }
}
