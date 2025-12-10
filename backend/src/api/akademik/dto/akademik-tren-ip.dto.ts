import { Expose, Type } from 'class-transformer';

export class SemesterIpDto {
  @Expose()
  semester: number;

  @Expose()
  prodi?: string;

  @Expose()
  ip: number;
}

export class AngkatanIpDto {
  @Expose()
  angkatan: string | number;

  @Expose()
  prodi?: string;

  @Expose()
  ip: number;
}

export class AkademikTrenIpRataRataDto {
  @Expose()
  angkatan: string | number;

  @Expose()
  prodi?: string;

  @Expose()
  @Type(() => SemesterIpDto)
  data: SemesterIpDto[];
}

export class AkademikTrenIpTertinggiDto {
  @Expose()
  angkatan?: string | number;

  @Expose()
  prodi?: string;

  @Expose()
  semester?: number;

  @Expose()
  @Type(() => SemesterIpDto)
  data: (SemesterIpDto | AngkatanIpDto)[];
}
