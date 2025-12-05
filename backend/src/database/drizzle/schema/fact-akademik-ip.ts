import {
  pgTable,
  text,
  integer,
  doublePrecision,
  index,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { semesterEnum } from './_enums';

export const factAkademikIp = pgTable(
  'fact_akademik_ip',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    // id asli dari DataHub
    datahubIpId: integer('datahub_ip_id').unique().notNull(),

    // Identitas Mahasiswa (Independen)
    mahasiswaId: integer('mahasiswa_id').notNull(),
    angkatan: integer('angkatan').notNull(),

    // Data IP
    tahunAjaran: integer('tahun_ajaran').notNull(),
    semesterNama: semesterEnum('semester_nama').notNull(),

    // semester ke-berapa (1, 2, 3...) secara numerik
    // Logika konversi (Tahun - Angkatan) * 2 + (Ganjil=1/Genap=2) akan dilakukan di ETL Service
    semesterUrut: integer('semester_urut'),

    ipSemester: doublePrecision('ip_semester'),
    ipk: doublePrecision('ipk'),

    // Metadata ETL
    datahubUpdatedAt: timestamp('datahub_updated_at', {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Index untuk API '/tren-ip-rata-rata' (Avg IP per Semester per Angkatan)
    index('fact_akd_ip_tren_idx').on(table.angkatan, table.semesterUrut),
  ],
);
