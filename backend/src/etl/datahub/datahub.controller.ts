import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { DataHubService } from './datahub.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('etl/datahub')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN)
export class DataHubController {
  constructor(private readonly dataHubService: DataHubService) {}

  @Get('debug/mahasiswa')
  async debugGetMahasiswa(
    @Request() req: Request,
    @Query('since') since?: string,
  ) {
    const date = since ? new Date(since) : undefined;

    return this.dataHubService.getMahasiswaData(req['datacore_token'], date);
  }

  @Get('debug/akademik')
  async debugGetAkademik(
    @Request() req: Request,
    @Query('since') since?: string,
  ) {
    const date = since ? new Date(since) : undefined;

    return this.dataHubService.getAkademikData(req['datacore_token'], date);
  }
}
