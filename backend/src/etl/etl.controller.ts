import { Controller, Get, UseGuards } from '@nestjs/common';
import { EtlService } from './etl.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../constants/roles.constants';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('etl')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN)
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Get('debug/fullSync')
  async debugFullSyncAndAggregate() {
    return await this.etlService.runFullSync();
  }
}
