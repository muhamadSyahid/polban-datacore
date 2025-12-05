import { count } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factAkademikNilai } from '../fact-akademik-nilai';

export const mvAkademikDistribusiNilai = pgMaterializedView(
  'mv_akademik_distribusi_nilai',
).as((qb) => {
  return qb
    .select({
      angkatan: factAkademikNilai.angkatan,
      kodeMk: factAkademikNilai.kodeMk,
      namaMk: factAkademikNilai.namaMk,
      sks: factAkademikNilai.sks,
      nilaiHuruf: factAkademikNilai.nilaiHuruf,
      total: count().as('total'),
    })
    .from(factAkademikNilai)
    .groupBy(
      factAkademikNilai.angkatan,
      factAkademikNilai.kodeMk,
      factAkademikNilai.namaMk,
      factAkademikNilai.sks,
      factAkademikNilai.nilaiHuruf,
    );
});
