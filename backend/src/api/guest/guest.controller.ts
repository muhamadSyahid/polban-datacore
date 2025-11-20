import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GuestService } from './guest.service';
import { GuestTotalArrayDto } from './dto/guest-total-array.dto';
import { GuestDomisiliAllDto } from './dto/guest-domisili-all.dto';
import { GuestDomisiliProvinsiDto } from './dto/guest-domisili-provinsi.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('v1/guest/mahasiswa')
@ApiTags('Guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get('gender')
  async getGender(): Promise<GuestTotalArrayDto> {
    return this.guestService.getGenderData();
  }

  @Get('agama')
  async getAgama(): Promise<GuestTotalArrayDto> {
    return this.guestService.getAgamaData();
  }

  @Get('jenis-slta')
  async getJenisSlta(): Promise<GuestTotalArrayDto> {
    return this.guestService.getJenisSltaData();
  }

  @Get('domisili')
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
}
