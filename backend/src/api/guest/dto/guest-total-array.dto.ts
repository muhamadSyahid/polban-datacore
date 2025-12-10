import { Expose, Type } from 'class-transformer';

class GuestTotalItemDto {
  @Expose()
  jenis?: string;

  @Expose()
  agama?: string;

  @Expose()
  total: number;
}

export class GuestTotalArrayDto {
  @Expose()
  @Type(() => GuestTotalItemDto)
  data: GuestTotalItemDto[];
}
