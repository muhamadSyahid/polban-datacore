import { Module } from '@nestjs/common';
import { GuestRepository } from './guest.repository';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';

@Module({
  providers: [GuestRepository, GuestService],
  controllers: [GuestController],
})
export class GuestModule {}
