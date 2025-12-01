import { Expose, Type } from 'class-transformer';

class KemahasiswaanTotalItemDto {
  @Expose()
  jenis?: string;

  @Expose()
  agama?: string;

  @Expose()
  angkatan?: number;

  @Expose()
  prodi?: string;

  @Expose()
  kelas?: string;

  @Expose()
  total: number;
}

export class KemahasiswaanTotalArrayDto {
  @Expose()
  angkatan?: number;

  @Expose()
  prodi?: string;

  @Expose()
  kelas?: string;

  @Expose()
  @Type(() => KemahasiswaanTotalItemDto)
  data: KemahasiswaanTotalItemDto[];
}
