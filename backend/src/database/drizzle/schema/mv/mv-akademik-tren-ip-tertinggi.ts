import { max } from 'drizzle-orm';
import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { factAkademikIp } from '../fact-akademik-ip';

export const mvAkademikTrenIpTertinggi = pgMaterializedView(
  'mv_akademik_tren_ip_tertinggi',
).as((qb) => {
  return qb
    .select({
      angkatan: factAkademikIp.angkatan,
      semesterUrut: factAkademikIp.semesterUrut,
      ipTertinggi: max(factAkademikIp.ipSemester).as('ip_tertinggi'),
    })
    .from(factAkademikIp)
    .groupBy(factAkademikIp.angkatan, factAkademikIp.semesterUrut);
});
