import { Expose, Type } from 'class-transformer';

export class KemahasiswaanTotalItemDto {
  @Expose()
  jenis?: string;

  @Expose()
  agama?: string;

  @Expose()
  angkatan: number;

  @Expose()
  total: number;
}

export class KemahasiswaanTotalArrayDto {
  @Expose()
  @Type(() => KemahasiswaanTotalItemDto)
  data: KemahasiswaanTotalItemDto[];
}
