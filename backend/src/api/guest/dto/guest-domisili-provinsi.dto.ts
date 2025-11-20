import { Expose, Type } from 'class-transformer';
import { GeoDto } from './guest-domisili-all.dto';

export class GuestDomisiliProvinsiItemDto {
  @Expose()
  kota: string;

  @Expose()
  total: number;

  @Expose()
  @Type(() => GeoDto)
  geo: GeoDto;
}

export class GuestDomisiliProvinsiDto {
  @Expose()
  provinsi: string;

  @Expose()
  @Type(() => GuestDomisiliProvinsiItemDto)
  data: GuestDomisiliProvinsiItemDto[];
}
