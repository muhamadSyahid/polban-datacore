import { sql, isNotNull } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factMahasiswa } from '../fact-mahasiswa';

export const mvMahasiswaJalurDaftar = pgMaterializedView(
  'mv_mahasiswa_jalur_daftar',
).as((qb) => {
  return qb
    .select({
      angkatan: factMahasiswa.angkatan,
      tipe: factMahasiswa.namaJalurDaftar,
      total: sql<number>`count(*)::int`.as('total'),
    })
    .from(factMahasiswa)
    .where(isNotNull(factMahasiswa.namaJalurDaftar))
    .groupBy(factMahasiswa.angkatan, factMahasiswa.namaJalurDaftar);
});
