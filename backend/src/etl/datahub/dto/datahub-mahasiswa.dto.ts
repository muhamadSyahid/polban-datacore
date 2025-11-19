import { Expose, Type } from 'class-transformer';

export class DataHubProvinsiDto {
  @Expose({ name: 'provinsi_id' })
  provinsiId: number;

  @Expose({ name: 'nama_provinsi' })
  namaProvinsi: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;
}

export class DataHubWilayahDto {
  @Expose({ name: 'wilayah_id' })
  wilayahId: number;

  @Expose({ name: 'nama_wilayah' })
  namaWilayah: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose({ name: 'provinsi_id' })
  provinsiId: number;
}

export class DataHubSltaDto {
  @Expose({ name: 'nama_slta' })
  namaSlta: string;
}

export class DataHubJalurDaftarDto {
  @Expose({ name: 'nama_jalur_daftar' })
  namaJalurDaftar: string;
}

export class DataHubMahasiswaDto {
  @Expose({ name: 'mahasiswa_id' })
  mahasiswaId: number;

  @Expose()
  angkatan: number;

  @Expose()
  kelas: string;

  @Expose({ name: 'jenis_kelamin' })
  jenisKelamin: 'L' | 'P';

  @Expose()
  agama: string;

  @Expose({ name: 'tgl_lahir' })
  tglLahir: string;

  @Expose({ name: 'updated_at' })
  updatedAt: string;

  @Expose()
  @Type(() => DataHubProvinsiDto)
  provinsi: DataHubProvinsiDto | null;

  @Expose()
  @Type(() => DataHubWilayahDto)
  wilayah: DataHubWilayahDto | null;

  @Expose()
  @Type(() => DataHubSltaDto)
  slta: DataHubSltaDto | null;

  @Expose({ name: 'jalur_daftar' })
  @Type(() => DataHubJalurDaftarDto)
  jalurDaftar: DataHubJalurDaftarDto | null;
}
