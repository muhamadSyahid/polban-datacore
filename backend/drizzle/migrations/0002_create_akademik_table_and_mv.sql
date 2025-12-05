CREATE TYPE "public"."nilai_huruf_enum" AS ENUM('A', 'AB', 'B', 'BC', 'C', 'CD', 'D', 'E', 'T');--> statement-breakpoint
CREATE TYPE "public"."semester_enum" AS ENUM('Ganjil', 'Genap');--> statement-breakpoint

CREATE TABLE "fact_akademik_nilai" (
	"id" text PRIMARY KEY NOT NULL,
	"datahub_nilai_id" integer NOT NULL,
	"mahasiswa_id" integer NOT NULL,
	"angkatan" integer NOT NULL,
	"kode_mk" text NOT NULL,
	"nama_mk" text NOT NULL,
	"sks" integer NOT NULL,
	"nilai_huruf" "nilai_huruf_enum",
	"tahun_ajaran" integer NOT NULL,
	"semester_nama" "semester_enum" NOT NULL,
	"datahub_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_akademik_nilai_datahub_nilai_id_unique" UNIQUE("datahub_nilai_id")
);
--> statement-breakpoint
CREATE TABLE "fact_akademik_ip" (
	"id" text PRIMARY KEY NOT NULL,
	"datahub_ip_id" integer NOT NULL,
	"mahasiswa_id" integer NOT NULL,
	"angkatan" integer NOT NULL,
	"tahun_ajaran" integer NOT NULL,
	"semester_nama" "semester_enum" NOT NULL,
	"semester_urut" integer,
	"ip_semester" double precision,
	"ipk" double precision,
	"datahub_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_akademik_ip_datahub_ip_id_unique" UNIQUE("datahub_ip_id")
);
--> statement-breakpoint

CREATE INDEX "fact_akd_nilai_main_idx" ON "fact_akademik_nilai" USING btree ("angkatan","kode_mk","nilai_huruf");--> statement-breakpoint
CREATE INDEX "fact_akd_nilai_mhs_idx" ON "fact_akademik_nilai" USING btree ("mahasiswa_id");--> statement-breakpoint
CREATE INDEX "fact_akd_ip_tren_idx" ON "fact_akademik_ip" USING btree ("angkatan","semester_urut");--> statement-breakpoint

-- MATERIALIZED VIEWS

CREATE MATERIALIZED VIEW "public"."mv_akademik_distribusi_nilai" AS (select "angkatan", "kode_mk", "nama_mk", "sks", "nilai_huruf", count(*) as "total" from "fact_akademik_nilai" group by "fact_akademik_nilai"."angkatan", "fact_akademik_nilai"."kode_mk", "fact_akademik_nilai"."nama_mk", "fact_akademik_nilai"."sks", "fact_akademik_nilai"."nilai_huruf");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_akademik_tren_ip_rata_rata" AS (select "angkatan", "semester_urut", avg("ip_semester") as "ip_rata_rata" from "fact_akademik_ip" group by "fact_akademik_ip"."angkatan", "fact_akademik_ip"."semester_urut");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_akademik_tren_ip_tertinggi" AS (select "angkatan", "semester_urut", max("ip_semester") as "ip_tertinggi" from "fact_akademik_ip" group by "fact_akademik_ip"."angkatan", "fact_akademik_ip"."semester_urut");--> statement-breakpoint

CREATE UNIQUE INDEX "mv_akd_nilai_unique_idx" ON "mv_akademik_distribusi_nilai" ("angkatan", "kode_mk", "nilai_huruf");
CREATE UNIQUE INDEX "mv_akd_ip_avg_unique_idx" ON "mv_akademik_tren_ip_rata_rata" ("angkatan", "semester_urut");
CREATE UNIQUE INDEX "mv_akd_ip_max_unique_idx" ON "mv_akademik_tren_ip_tertinggi" ("angkatan", "semester_urut");

CREATE INDEX "mv_akd_nilai_angkatan_idx" ON "mv_akademik_distribusi_nilai" ("angkatan");
CREATE INDEX "mv_akd_ip_avg_angkatan_idx" ON "mv_akademik_tren_ip_rata_rata" ("angkatan");
CREATE INDEX "mv_akd_ip_max_angkatan_idx" ON "mv_akademik_tren_ip_tertinggi" ("angkatan");
CREATE INDEX "mv_akd_ip_max_sem_idx" ON "mv_akademik_tren_ip_tertinggi" ("semester_urut");
