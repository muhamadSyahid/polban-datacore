import { sql } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factMahasiswa } from '../fact-mahasiswa';

export const mvMahasiswaGender = pgMaterializedView('mv_mahasiswa_gender').as(
  (qb) => {
    return qb
      .select({
        angkatan: factMahasiswa.angkatan,
        jenis: factMahasiswa.jenisKelamin,
        total: sql<number>`count(*)::int`.as('total'),
      })
      .from(factMahasiswa)
      .groupBy(factMahasiswa.angkatan, factMahasiswa.jenisKelamin);
  },
);
