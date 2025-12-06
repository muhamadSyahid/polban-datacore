import { Expose, Type } from 'class-transformer';

export class IndeksNilaiDto {
  @Expose()
  indeks: string;

  @Expose()
  total: number;
}

export class MataKuliahNilaiDto {
  @Expose({ name: 'mata_kuliah' })
  mataKuliah: string;

  @Expose({ name: 'indeks_nilai' })
  @Type(() => IndeksNilaiDto)
  indeksNilai: IndeksNilaiDto[];
}

export class AkademikDistribusiNilaiDto {
  @Expose()
  angkatan: string | number;

  @Expose()
  prodi?: string;

  @Expose()
  semester?: number;

  @Expose()
  @Type(() => MataKuliahNilaiDto)
  data: MataKuliahNilaiDto[];
}
