import { sql } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factMahasiswa } from '../fact-mahasiswa';

export const mvMahasiswaTotal = pgMaterializedView(
  'mv_mahasiswa_total_per_angkatan',
).as((qb) => {
  return qb
    .select({
      angkatan: factMahasiswa.angkatan,
      total: sql<number>`count(*)::int`.as('total'),
    })
    .from(factMahasiswa)
    .groupBy(factMahasiswa.angkatan);
});
