import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobsProcessor } from './jobs.processor';
import { EtlModule } from '../etl/etl.module';
import { QUEUE_CONSTANTS } from '../constants';

@Module({
  imports: [
    EtlModule,
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.ETL_QUEUE,
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsProcessor],
})
export class JobsModule {}
