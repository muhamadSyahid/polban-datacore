import { Expose, Type } from 'class-transformer';

export class GeoDto {
  @Expose()
  lat: number;

  @Expose()
  lng: number;
}

export class GuestDomisiliItemDto {
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
  @Type(() => GuestDomisiliItemDto)
  data: GuestDomisiliItemDto[];
}
