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
@Controller('v1/kemahasiswaan/mahasiswa')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATAVIEW_INTERNAL)
@ApiTags('Kemahasiswaan')
export class KemahasiswaanController {
  constructor(private readonly kemahasiswaanService: KemahasiswaanService) {}

  @Get('gender')
  async getGender(): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getGenderData();
  }

  @Get('agama')
  async getAgama(): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getAgamaData();
  }

  @Get('jenis-slta')
  async getJenisSlta(): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getJenisSltaData();
  }

  @Get('jumlah-mahasiswa')
  async getJumlahMahasiswa(): Promise<KemahasiswaanTotalArrayDto> {
    return this.kemahasiswaanService.getJumlahMahasiswaData();
  }
}
