import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataCoreService } from './datacore.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../constants/roles.constants';

@ApiTags('DataCore')
@Controller('datacore')
@UseInterceptors(ClassSerializerInterceptor)
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
    throw new NotImplementedException();
  }

  @Get('cache/:key')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCacheDetail(@Param('key') key: string) {
    throw new NotImplementedException();
  }

  @Get('inspector/mv')
  async getInspectorMvList() {
    return this.datacoreService.getInspectorMvList();
  }

  @Get('inspector/mv/:mvName')
  async getInspectorMvData(
    @Param('mvName') mvName: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') search?: string,
  ) {
    return this.datacoreService.getInspectorMvData(
      mvName,
      Number(page),
      Number(limit),
      search,
    );
  }
}
