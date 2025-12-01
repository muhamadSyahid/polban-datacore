import { sql } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factMahasiswa } from '../fact-mahasiswa';

export const mvMahasiswaAgama = pgMaterializedView('mv_mahasiswa_agama').as(
  (qb) => {
    return qb
      .select({
        angkatan: factMahasiswa.angkatan,
        agama: factMahasiswa.agama,
        total: sql<number>`count(*)::int`.as('total'),
      })
      .from(factMahasiswa)
      .groupBy(factMahasiswa.angkatan, factMahasiswa.agama);
  },
);
