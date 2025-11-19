import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { GuestRepository } from './guest.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GuestController],
  providers: [GuestService, GuestRepository],
})
export class GuestModule {}
