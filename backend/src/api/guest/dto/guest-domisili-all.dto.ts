import { Expose, Type } from 'class-transformer';

export class GeoDto {
  @Expose()
  lat: number;

  @Expose()
  lng: number;
}

export class GuestDomisiliAllItemDto {
  @Expose()
  provinsi: string;

  @Expose()
  total: number;

  @Expose()
  @Type(() => GeoDto)
  geo: GeoDto;
}

export class GuestDomisiliAllDto {
  @Expose()
  @Type(() => GuestDomisiliAllItemDto)
  data: GuestDomisiliAllItemDto[];
}
