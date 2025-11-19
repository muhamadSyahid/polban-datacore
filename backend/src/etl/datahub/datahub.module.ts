import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DataHubService } from './datahub.service';
import { DataHubController } from './datahub.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [DataHubController],
  providers: [DataHubService],
  exports: [DataHubService],
})
export class DataHubModule {}
