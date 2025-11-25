import { Module } from '@nestjs/common';
import { DataCoreController } from './datacore.controller';
import { DataCoreService } from './datacore.service';
import { EtlModule } from '../../etl/etl.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_CONSTANTS } from '../../constants';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    EtlModule,
    AuthModule,
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.ETL_QUEUE,
    }),
  ],
  controllers: [DataCoreController],
  providers: [DataCoreService],
})
export class DataCoreModule {}
