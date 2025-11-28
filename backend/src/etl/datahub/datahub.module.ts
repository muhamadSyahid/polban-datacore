import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DataHubService } from './datahub.service';
import { DataHubController } from './datahub.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule],
  controllers: [DataHubController],
  providers: [DataHubService],
  exports: [DataHubService],
})
export class DataHubModule {}
