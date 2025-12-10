import { sql, isNotNull } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factMahasiswa } from '../fact-mahasiswa';

export const mvMahasiswaDomisili = pgMaterializedView(
  'mv_mahasiswa_domisili',
).as((qb) => {
  return qb
    .select({
      namaProvinsi: factMahasiswa.namaProvinsi,
      provinsiLat: factMahasiswa.provinsiLat,
      provinsiLng: factMahasiswa.provinsiLng,
      namaWilayah: factMahasiswa.namaWilayah,
      wilayahLat: factMahasiswa.wilayahLat,
      wilayahLng: factMahasiswa.wilayahLng,
      total: sql<number>`count(*)::int`.as('total'),
    })
    .from(factMahasiswa)
    .where(isNotNull(factMahasiswa.namaProvinsi))
    .groupBy(
      factMahasiswa.namaProvinsi,
      factMahasiswa.provinsiLat,
      factMahasiswa.provinsiLng,
      factMahasiswa.namaWilayah,
      factMahasiswa.wilayahLat,
      factMahasiswa.wilayahLng,
    );
});
