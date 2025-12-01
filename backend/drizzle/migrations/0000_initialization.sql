CREATE TYPE "public"."agama_enum" AS ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Lainnya');--> statement-breakpoint
CREATE TYPE "public"."jenis_kelamin_enum" AS ENUM('L', 'P');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'running', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_trigger" AS ENUM('cron', 'manual');--> statement-breakpoint
CREATE TABLE "etl_job_log" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"triggered_by" "job_trigger" NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"log_message" text
);
--> statement-breakpoint
CREATE TABLE "job_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"cron_expression" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "job_schedules_job_name_unique" UNIQUE("job_name")
);
--> statement-breakpoint
CREATE TABLE "fact_mahasiswa" (
	"id" text PRIMARY KEY NOT NULL,
	"datahub_mahasiswa_id" text NOT NULL,
	"angkatan" integer,
	"jenis_kelamin" "jenis_kelamin_enum",
	"agama" "agama_enum",
	"tgl_lahir" date,
	"nama_slta" text,
	"nama_jalur_daftar" text,
	"nama_wilayah" text,
	"nama_provinsi" text,
	"datahub_provinsi_id" text,
	"datahub_wilayah_id" text,
	"provinsi_lat" double precision,
	"provinsi_lng" double precision,
	"wilayah_lat" double precision,
	"wilayah_lng" double precision,
	"datahub_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_mahasiswa_datahub_mahasiswa_id_unique" UNIQUE("datahub_mahasiswa_id")
);
--> statement-breakpoint
CREATE INDEX "fact_mhs_angkatan_idx" ON "fact_mahasiswa" USING btree ("angkatan");--> statement-breakpoint
CREATE INDEX "fact_mhs_jenis_kelamin_idx" ON "fact_mahasiswa" USING btree ("jenis_kelamin");--> statement-breakpoint
CREATE INDEX "fact_mhs_agama_idx" ON "fact_mahasiswa" USING btree ("agama");--> statement-breakpoint
CREATE INDEX "fact_mhs_provinsi_id_idx" ON "fact_mahasiswa" USING btree ("datahub_provinsi_id");--> statement-breakpoint
CREATE INDEX "fact_mhs_wilayah_id_idx" ON "fact_mahasiswa" USING btree ("datahub_wilayah_id");--> statement-breakpoint
CREATE INDEX "fact_mhs_provinsi_idx" ON "fact_mahasiswa" USING btree ("nama_provinsi");--> statement-breakpoint
CREATE INDEX "fact_mhs_wilayah_idx" ON "fact_mahasiswa" USING btree ("nama_wilayah");--> statement-breakpoint
CREATE INDEX "fact_mhs_slta_idx" ON "fact_mahasiswa" USING btree ("nama_slta");--> statement-breakpoint
CREATE INDEX "fact_mhs_jalur_idx" ON "fact_mahasiswa" USING btree ("nama_jalur_daftar");--> statement-breakpoint
CREATE INDEX "fact_mhs_updated_at_idx" ON "fact_mahasiswa" USING btree ("datahub_updated_at");--> statement-breakpoint

-- MATERIALIZED VIEWS

CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_gender" AS (select "angkatan", "jenis_kelamin", count(*)::int as "total" from "fact_mahasiswa" group by "fact_mahasiswa"."angkatan", "fact_mahasiswa"."jenis_kelamin");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_agama" AS (select "angkatan", "agama", count(*)::int as "total" from "fact_mahasiswa" group by "fact_mahasiswa"."angkatan", "fact_mahasiswa"."agama");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_jalur_daftar" AS (select "angkatan", "nama_jalur_daftar", count(*)::int as "total" from "fact_mahasiswa" where "fact_mahasiswa"."nama_jalur_daftar" is not null group by "fact_mahasiswa"."angkatan", "fact_mahasiswa"."nama_jalur_daftar");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_total" AS (select "angkatan", count(*)::int as "total" from "fact_mahasiswa" group by "fact_mahasiswa"."angkatan");--> statement-breakpoint
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
CREATE MATERIALIZED VIEW "public"."mv_mahasiswa_domisili" AS (select "nama_provinsi", "provinsi_lat", "provinsi_lng", "nama_wilayah", "wilayah_lat", "wilayah_lng", count(*)::int as "total" from "fact_mahasiswa" where "fact_mahasiswa"."nama_provinsi" is not null group by "fact_mahasiswa"."nama_provinsi", "fact_mahasiswa"."provinsi_lat", "fact_mahasiswa"."provinsi_lng", "fact_mahasiswa"."nama_wilayah", "fact_mahasiswa"."wilayah_lat", "fact_mahasiswa"."wilayah_lng");

CREATE UNIQUE INDEX "mv_mhs_gender_unique_idx" ON "mv_mahasiswa_gender" ("angkatan", "jenis_kelamin");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_agama_unique_idx" ON "mv_mahasiswa_agama" ("angkatan", "agama");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_jalur_unique_idx" ON "mv_mahasiswa_jalur_daftar" ("angkatan", "nama_jalur_daftar");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_total_angkatan_unique_idx" ON "mv_mahasiswa_total" ("angkatan");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_slta_unique_idx" ON "mv_mahasiswa_slta_kategori" ("angkatan", "jenis");--> statement-breakpoint
CREATE UNIQUE INDEX "mv_mhs_domisili_unique_idx" ON "mv_mahasiswa_domisili" ("nama_provinsi", "nama_wilayah", "provinsi_lat", "provinsi_lng", "wilayah_lat", "wilayah_lng");
