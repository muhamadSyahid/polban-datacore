import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobsProcessor } from './jobs.processor';
import { JobsRepository } from './jobs.repository';
import { EtlModule } from '../etl/etl.module';
import { QUEUE_CONSTANTS } from '../constants';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    EtlModule,
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.ETL_QUEUE,
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsProcessor, JobsRepository],
})
export class JobsModule {}
