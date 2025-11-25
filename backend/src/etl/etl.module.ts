import { Module } from '@nestjs/common';
import { EtlService } from './etl.service';
import { EtlRepository } from './etl.repository';
import { DataHubModule } from './datahub/datahub.module';
import { DatabaseModule } from '../database/database.module';
import { EtlController } from './etl.controller'; // Uncomment if you need direct HTTP trigger without Queue (debug only)
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, DatabaseModule, DataHubModule],
  controllers: [EtlController], // EtlController optional for debugging
  providers: [EtlService, EtlRepository],
  exports: [EtlService, EtlRepository],
})
export class EtlModule {}
