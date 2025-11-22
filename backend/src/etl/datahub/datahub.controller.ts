import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DataHubService } from './datahub.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants/roles.constants';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('etl/datahub')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN)
export class DataHubController {
  constructor(private readonly dataHubService: DataHubService) {}

  @Get('debug/mahasiswa')
  async debugGetMahasiswa(@Query('since') since?: string) {
    const date = since ? new Date(since) : undefined;
    return this.dataHubService.getMahasiswaData(date);
  }
}
