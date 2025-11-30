import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseGuards,
  Version,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { AkademikService } from './akademik.service';
import { AkademikTotalArrayDto } from './dto/akademik-total-array.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants/roles.constants';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Akademik')
@Controller('akademik')
@UseInterceptors(ClassSerializerInterceptor)
@CacheTTL(300000)
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN, UserRole.DATAVIEW_INTERNAL)
export class AkademikController {
  constructor(private readonly akademikService: AkademikService) {}

  @Version('1')
  @Get('tipe-tes-masuk')
  async getTipeTesMasuk(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<AkademikTotalArrayDto> {
    return this.akademikService.getTipeTesMasukData(angkatan, prodi, kelas);
  }
}
