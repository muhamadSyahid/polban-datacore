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
import { KemahasiswaanService } from './kemahasiswaan.service';
import { KemahasiswaanTotalArrayDto } from './dto/kemahasiswaan-total-array.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants/roles.constants';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Kemahasiswaan')
@Controller('mahasiswa')
@UseInterceptors(ClassSerializerInterceptor)
@CacheTTL(300000)
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN, UserRole.DATAVIEW_INTERNAL)
export class KemahasiswaanController {
  constructor(private readonly kemahasiswaanService: KemahasiswaanService) {}

  @Version('1')
  @Get('jumlah-mahasiswa')
  async getJumlahMahasiswa(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getJumlahMahasiswaData(angkatan, prodi);
  }

  @Version('1')
  @Get('gender')
  async getGender(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getGenderData(angkatan, prodi, kelas);
  }

  @Version('1')
  @Get('jenis-slta')
  async getJenisSlta(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getJenisSltaData(angkatan, prodi, kelas);
  }

  @Version('1')
  @Get('agama')
  async getAgama(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getAgamaData(angkatan, prodi, kelas);
  }
}
