import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseGuards,
  Version,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
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

  @Version('1')
  @Get('distribusi-nilai')
  async getDistribusiNilai(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
  ): Promise<AkademikTotalArrayDto> {
    return this.akademikService.getDistribusiNilaiData(angkatan, prodi);
  }

  @Version('1')
  @Get('tren-ip-rata-rata')
  async getTrenIpRataRata(
    @Query('angkatan') angkatan?: number,
  ): Promise<AkademikTotalArrayDto> {
    return this.akademikService.getTrenIpRataRataData(angkatan);
  }

  @Version('1')
  @Get('tren-ip-tertinggi')
  async getTrenIpTertinggi(
    @Query('semester') semester?: number,
    @Query('angkatan') angkatan?: number,
  ): Promise<AkademikTotalArrayDto> {
    return this.akademikService.getTrenIpTertinggiData(semester, angkatan);
  }
}
