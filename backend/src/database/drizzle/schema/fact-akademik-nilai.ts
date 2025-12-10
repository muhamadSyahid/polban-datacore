import { pgTable, text, integer, index, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { nilaiHurufEnum, semesterEnum } from './_enums';

export const factAkademikNilai = pgTable(
  'fact_akademik_nilai',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    // id asli dari DataHub
    datahubNilaiId: integer('datahub_nilai_id').unique().notNull(),

    // Identitas Mahasiswa (Independen)
    mahasiswaId: integer('mahasiswa_id').notNull(),
    angkatan: integer('angkatan').notNull(),

    // Data Mata Kuliah
    kodeMk: text('kode_mk').notNull(),
    namaMk: text('nama_mk').notNull(),
    sks: integer('sks').notNull(),

    // Data Nilai & Periode
    nilaiHuruf: nilaiHurufEnum('nilai_huruf'),
    tahunAjaran: integer('tahun_ajaran').notNull(),
    semesterNama: semesterEnum('semester_nama').notNull(),

    // Metadata ETL
    datahubUpdatedAt: timestamp('datahub_updated_at', {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Index untuk API '/distribusi-nilai' (Filter Angkatan & Group By MK/Nilai)
    index('fact_akd_nilai_main_idx').on(
      table.angkatan,
      table.kodeMk,
      table.nilaiHuruf,
    ),
    // Index untuk cleanup/update data per mahasiswa
    index('fact_akd_nilai_mhs_idx').on(table.mahasiswaId),
  ],
);
