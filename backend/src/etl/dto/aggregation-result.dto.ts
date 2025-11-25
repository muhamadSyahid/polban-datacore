export class GenderAggregationResultDto {
  angkatan: number;
  jenis: 'L' | 'P';
  total: number;
}

export class AgamaAggregationResultDto {
  angkatan: number;
  agama: string;
  total: number;
}

export class SltaAggregationResultDto {
  angkatan: number;
  jenis: string;
  total: number;
}

export class JalurDaftarAggregationResultDto {
  angkatan: number;
  jalur: string;
  total: number;
}

export class JumlahMhsAggregationResultDto {
  angkatan: number;
  total: number;
}

export class DomisiliAggregationResultDto {
  namaProvinsi: string;
  provinsiLat: number;
  provinsiLng: number;
  namaWilayah: string;
  wilayahLat: number;
  wilayahLng: number;
  total: number;
}
