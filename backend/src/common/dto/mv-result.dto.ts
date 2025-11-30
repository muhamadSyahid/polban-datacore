import { IsInt, IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';

export class MvMhsGenderResultDto {
  @IsInt()
  @IsNotEmpty()
  angkatan: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['L', 'P'])
  jenis: string;

  @IsInt()
  @IsNotEmpty()
  total: number;
}

export class MvMhsAgamaResultDto {
  @IsInt()
  @IsNotEmpty()
  angkatan: number;

  @IsString()
  @IsNotEmpty()
  agama: string;

  @IsInt()
  @IsNotEmpty()
  total: number;
}

export class MvMhsSltaResultDto {
  @IsInt()
  @IsNotEmpty()
  angkatan: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['SMA', 'SMK', 'MA', 'Lainnya'])
  jenis: string;

  @IsInt()
  @IsNotEmpty()
  total: number;
}

export class MvMhsJalurDaftarResultDto {
  @IsInt()
  @IsNotEmpty()
  angkatan: number;

  @IsString()
  @IsNotEmpty()
  tipe: string;

  @IsInt()
  @IsNotEmpty()
  total: number;
}

export class MvMhsDomisiliKotaResultDto {
  @IsString()
  @IsNotEmpty()
  namaProvinsi: string;

  @IsNumber()
  @IsNotEmpty()
  provinsiLat: number;

  @IsNumber()
  @IsNotEmpty()
  provinsiLng: number;

  @IsString()
  @IsNotEmpty()
  namaWilayah: string;

  @IsNumber()
  @IsNotEmpty()
  wilayahLat: number;

  @IsNumber()
  @IsNotEmpty()
  wilayahLng: number;

  @IsInt()
  @IsNotEmpty()
  total: number;
}

export class MvMhsTotalResultDto {
  @IsInt()
  @IsNotEmpty()
  angkatan: number;

  @IsInt()
  @IsNotEmpty()
  total: number;
}
