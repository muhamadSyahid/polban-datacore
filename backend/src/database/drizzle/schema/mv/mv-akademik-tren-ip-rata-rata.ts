import { sql } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factAkademikIp } from '../fact-akademik-ip';

export const mvAkademikTrenIpRataRata = pgMaterializedView(
  'mv_akademik_tren_ip_rata_rata',
).as((qb) => {
  return qb
    .select({
      angkatan: factAkademikIp.angkatan,
      semesterUrut: factAkademikIp.semesterUrut,
      ipRataRata: sql<number>`avg(${factAkademikIp.ipSemester})::float`.as(
        'ip_rata_rata',
      ),
    })
    .from(factAkademikIp)
    .groupBy(factAkademikIp.angkatan, factAkademikIp.semesterUrut);
});
