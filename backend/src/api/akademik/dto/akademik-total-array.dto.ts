import { Expose, Type } from 'class-transformer';

export class AkademikTotalItemDto {
  @Expose()
  tipe?: string;

  @Expose()
  angkatan: number;

  @Expose()
  prodi?: string;

  @Expose()
  kelas?: string;

  @Expose()
  total: number;
}

export class AkademikTotalArrayDto {
  @Expose()
  angkatan: number;

  @Expose()
  prodi?: string;

  @Expose()
  kelas?: string;

  @Expose()
  @Type(() => AkademikTotalItemDto)
  data: AkademikTotalItemDto[];
}
