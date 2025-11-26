import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KemahasiswaanService } from './kemahasiswaan.service';
import { KemahasiswaanTotalArrayDto } from './dto/kemahasiswaan-total-array.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants/roles.constants';
import { Roles } from '../../common/decorators/roles.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('v1/mahasiswa')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN, UserRole.DATAVIEW_INTERNAL)
@ApiTags('Kemahasiswaan')
export class KemahasiswaanController {
  constructor(private readonly kemahasiswaanService: KemahasiswaanService) {}

  @Get('jumlah-mahasiswa')
  async getJumlahMahasiswa(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getJumlahMahasiswaData(angkatan, prodi);
  }

  @Get('gender')
  async getGender(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getGenderData(angkatan, prodi, kelas);
  }

  @Get('jenis-slta')
  async getJenisSlta(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getJenisSltaData(angkatan, prodi, kelas);
  }

  @Get('agama')
  async getAgama(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getAgamaData(angkatan, prodi, kelas);
  }
}
