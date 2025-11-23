import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DataCoreService } from './datacore.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../constants/roles.constants';

@Controller('datacore')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN)
export class DataCoreController {
  constructor(private readonly datacoreService: DataCoreService) {}

  @Get('dashboard/stats')
  async getStats() {
    return this.datacoreService.getDashboardStats();
  }

  @Get('jobs/history')
  async getJobHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.datacoreService.getJobHistory(Number(page), Number(limit));
  }

  @Get('jobs/history/:id')
  async getJobDetail(@Param('id') id: string) {
    return this.datacoreService.getJobDetail(id);
  }

  @Get('cache/keys')
  async getCacheKeys() {
    return this.datacoreService.getCacheKeys();
  }

  @Get('cache/:key')
  async getCacheDetail(@Param('key') key: string) {
    return this.datacoreService.getCacheDetail(key);
  }
}
