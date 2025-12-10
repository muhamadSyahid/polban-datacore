import { sql, isNotNull } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factMahasiswa } from '../fact-mahasiswa';

const jenisSltaSql = sql<string>`(CASE
  WHEN UPPER(${factMahasiswa.namaSlta}) SIMILAR TO '(SMK|SME|SMKN|SMKS)%' THEN 'SMK'
  WHEN UPPER(${factMahasiswa.namaSlta}) SIMILAR TO '(SMA|SPMA|SMAN|SMAS)%' THEN 'SMA'
  WHEN UPPER(${factMahasiswa.namaSlta}) SIMILAR TO '(MA|MAN|MAS)%' THEN 'MA'
  ELSE 'Lainnya'
END)`;

export const mvMahasiswaSltaKategori = pgMaterializedView(
  'mv_mahasiswa_slta_kategori',
).as((qb) => {
  return qb
    .select({
      angkatan: factMahasiswa.angkatan,
      jenis: jenisSltaSql.as('jenis'),
      total: sql<number>`count(*)::int`.as('total'),
    })
    .from(factMahasiswa)
    .where(isNotNull(factMahasiswa.namaSlta))
    .groupBy(factMahasiswa.angkatan, jenisSltaSql);
});
