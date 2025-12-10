import { Expose, Type } from 'class-transformer';

export type AkademikNilaiHuruf =
  | 'A'
  | 'AB'
  | 'B'
  | 'BC'
  | 'C'
  | 'CD'
  | 'D'
  | 'E'
  | 'T';

export type AkademikSemester = 'Ganjil' | 'Genap';

export class DataHubPeriodeDto {
  @Expose({ name: 'periode_id' })
  periodeId: number;

  @Expose({ name: 'tahun_ajaran' })
  tahunAjaran: number;

  @Expose()
  semester: AkademikSemester;
}

export class DataHubMataKuliahDto {
  @Expose({ name: 'kode_mk' })
  kodeMk: string;

  @Expose({ name: 'nama_mk' })
  namaMk: string;

  @Expose()
  sks: number;
}

export class DataHubNilaiMahasiswaDto {
  @Expose({ name: 'nilai_id' })
  nilaiId: number;

  @Expose({ name: 'nilai_huruf' })
  nilaiHuruf: AkademikNilaiHuruf;

  @Expose({ name: 'kode_mk' })
  kodeMk: string;

  @Expose({ name: 'mata_kuliah' })
  @Type(() => DataHubMataKuliahDto)
  mataKuliah: DataHubMataKuliahDto;

  @Expose()
  @Type(() => DataHubPeriodeDto)
  periode: DataHubPeriodeDto;
}

export class DataHubIpDto {
  @Expose({ name: 'ip_id' })
  ipId: number;

  @Expose({ name: 'ip_semester' })
  ipSemester: number | null;

  @Expose()
  ipk: number;

  @Expose()
  @Type(() => DataHubPeriodeDto)
  periode: DataHubPeriodeDto;
}

export class DataHubAkademikDto {
  @Expose({ name: 'mahasiswa_id' })
  mahasiswaId: number;

  @Expose()
  angkatan: number;

  @Expose({ name: 'nilai_mahasiswa' })
  @Type(() => DataHubNilaiMahasiswaDto)
  nilaiMahasiswa: DataHubNilaiMahasiswaDto[];

  @Expose({ name: 'ip' })
  @Type(() => DataHubIpDto)
  ip: DataHubIpDto[];
}
