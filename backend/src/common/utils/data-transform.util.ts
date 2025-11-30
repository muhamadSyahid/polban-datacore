import { DomisiliAggregationResultDto } from '../../etl/dto/aggregation-result.dto';

export const groupByAndSum = <T extends Record<string, any>>(
  data: T[],
  keyField: keyof T,
) => {
  const map = new Map<string, number>();
  data.forEach((item) => {
    const key = String(item[keyField]);
    const current = map.get(key) || 0;
    map.set(key, current + item.total);
  });
  return Array.from(map.entries()).map(([key, total]) => ({
    [keyField]: key,
    total,
  }));
};

/**
 * Helper untuk Guest Domisili All (Peta Indonesia)
 * Mengelompokkan data berdasarkan Provinsi
 */
export const transformDomisiliForGuestAll = (
  data: DomisiliAggregationResultDto[],
) => {
  const provMap = new Map<
    string,
    { provinsi: string; total: number; geo: { lat: number; lng: number } }
  >();

  data.forEach((item) => {
    if (!provMap.has(item.namaProvinsi)) {
      provMap.set(item.namaProvinsi, {
        provinsi: item.namaProvinsi,
        total: 0,
        geo: { lat: item.provinsiLat, lng: item.provinsiLng },
      });
    }
    const entry = provMap.get(item.namaProvinsi);
    entry.total += item.total;
  });

  return { data: Array.from(provMap.values()) };
};

/**
 * Helper untuk Guest Domisili Per Provinsi (Peta Provinsi)
 * Mengelompokkan data berdasarkan Kota/Kabupaten
 */
export const transformDomisiliForGuestProvinsi = (
  provinsiName: string,
  data: DomisiliAggregationResultDto[],
) => {
  const kotaList = data.map((item) => ({
    kota: item.namaWilayah,
    total: item.total,
    geo: { lat: item.wilayahLat, lng: item.wilayahLng },
  }));

  return {
    provinsi: provinsiName,
    data: kotaList,
  };
};
