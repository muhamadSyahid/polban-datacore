import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotImplementedException,
  Query,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { GuestService } from './guest.service';
import { GuestTotalArrayDto } from './dto/guest-total-array.dto';
import { GuestDomisiliAllDto } from './dto/guest-domisili-all.dto';
import { GuestDomisiliProvinsiDto } from './dto/guest-domisili-provinsi.dto';

@ApiTags('Guest')
@Controller('guest')
@UseInterceptors(ClassSerializerInterceptor)
@CacheTTL(300000)
@UseInterceptors(CacheInterceptor)
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Version('1')
  @Get('mahasiswa/gender')
  async getGender(): Promise<GuestTotalArrayDto> {
    return this.guestService.getGenderData();
  }

  @Version('1')
  @Get('mahasiswa/agama')
  async getAgama(): Promise<GuestTotalArrayDto> {
    return this.guestService.getAgamaData();
  }

  @Version('1')
  @Get('mahasiswa/jenis-slta')
  async getJenisSlta(): Promise<GuestTotalArrayDto> {
    return this.guestService.getJenisSltaData();
  }

  @Version('1')
  @Get('mahasiswa/domisili')
  async getDomisili(
    @Query('provinsi') provinsi?: string,
  ): Promise<GuestDomisiliAllDto | GuestDomisiliProvinsiDto> {
    if (provinsi) {
      // Mengembalikan data per provinsi (kota/kabupaten)
      return this.guestService.getDomisiliByProvinsiData(provinsi);
    }
    // Mengembalikan data semua provinsi (All)
    return this.guestService.getDomisiliAllData();
  }

  @Version('1')
  @Get('akademik/tipe-tes-masuk')
  async getTipeTesMasuk(): Promise<GuestTotalArrayDto> {
    return this.guestService.getTipeTesMasukData();
  }

  // TODO: Rasio Dosen Mhs
  @Version('1')
  @Get('mahasiswa/rasio-dosen-mhs')
  async getRasioDosenMhs() {
    throw new NotImplementedException();
  }
}
