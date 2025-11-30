CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_gender" AS (select "angkatan", "jenis_kelamin", count(*)::int as "total" from "fact_mahasiswa" group by "fact_mahasiswa"."angkatan", "fact_mahasiswa"."jenis_kelamin");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_agama" AS (select "angkatan", "agama", count(*)::int as "total" from "fact_mahasiswa" group by "fact_mahasiswa"."angkatan", "fact_mahasiswa"."agama");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_jalur_daftar" AS (select "angkatan", "nama_jalur_daftar", count(*)::int as "total" from "fact_mahasiswa" where "fact_mahasiswa"."nama_jalur_daftar" is not null group by "fact_mahasiswa"."angkatan", "fact_mahasiswa"."nama_jalur_daftar");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_total_per_angkatan" AS (select "angkatan", count(*)::int as "total" from "fact_mahasiswa" group by "fact_mahasiswa"."angkatan");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_slta_kategori" AS (select "angkatan", (CASE
  WHEN UPPER("nama_slta") SIMILAR TO '(SMK|SME|SMKN|SMKS)%' THEN 'SMK'
  WHEN UPPER("nama_slta") SIMILAR TO '(SMA|SPMA|SMAN|SMAS)%' THEN 'SMA'
  WHEN UPPER("nama_slta") SIMILAR TO '(MA|MAN|MAS)%' THEN 'MA'
  ELSE 'Lainnya'
END) as "jenis", count(*)::int as "total" from "fact_mahasiswa" where "fact_mahasiswa"."nama_slta" is not null group by "fact_mahasiswa"."angkatan", (CASE
  WHEN UPPER("fact_mahasiswa"."nama_slta") SIMILAR TO '(SMK|SME|SMKN|SMKS)%' THEN 'SMK'
  WHEN UPPER("fact_mahasiswa"."nama_slta") SIMILAR TO '(SMA|SPMA|SMAN|SMAS)%' THEN 'SMA'
  WHEN UPPER("fact_mahasiswa"."nama_slta") SIMILAR TO '(MA|MAN|MAS)%' THEN 'MA'
  ELSE 'Lainnya'
END));--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_domisili_kota" AS (select "nama_provinsi", "provinsi_lat", "provinsi_lng", "nama_wilayah", "wilayah_lat", "wilayah_lng", count(*)::int as "total" from "fact_mahasiswa" where "fact_mahasiswa"."nama_provinsi" is not null group by "fact_mahasiswa"."nama_provinsi", "fact_mahasiswa"."provinsi_lat", "fact_mahasiswa"."provinsi_lng", "fact_mahasiswa"."nama_wilayah", "fact_mahasiswa"."wilayah_lat", "fact_mahasiswa"."wilayah_lng");

CREATE UNIQUE INDEX "mv_mhs_gender_unique_idx" ON "mv_mahasiswa_gender" ("angkatan", "jenis_kelamin");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_agama_unique_idx" ON "mv_mahasiswa_agama" ("angkatan", "agama");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_jalur_unique_idx" ON "mv_mahasiswa_jalur_daftar" ("angkatan", "nama_jalur_daftar");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_total_angkatan_unique_idx" ON "mv_mahasiswa_total_per_angkatan" ("angkatan");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_slta_unique_idx" ON "mv_mahasiswa_slta_kategori" ("angkatan", "jenis");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_domisili_unique_idx" ON "mv_mahasiswa_domisili_kota" ("nama_provinsi", "nama_wilayah", "provinsi_lat", "provinsi_lng", "wilayah_lat", "wilayah_lng");
