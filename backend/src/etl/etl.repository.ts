import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/drizzle/schema';
import { desc, eq, isNotNull, sql } from 'drizzle-orm';
import { CreateEtlJobLogDto } from './dto/create-etl-job-log.dto';
import { DataHubMahasiswaDto } from './datahub/dto/datahub-mahasiswa.dto';
import {
  GenderAggregationResultDto,
  AgamaAggregationResultDto,
  SltaAggregationResultDto,
  JalurDaftarAggregationResultDto,
  JumlahMhsAggregationResultDto,
  DomisiliAggregationResultDto,
} from './dto/aggregation-result.dto';
import { DataHubDosenDto } from './datahub/dto/datahub-dosen.dto';
import { DataHubAkademikDto } from './datahub/dto/datahub-akademik.dto';

@Injectable()
export class EtlRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  // Job Logging

  async startJobLog(dto: CreateEtlJobLogDto): Promise<string> {
    const result = await this.db
      .insert(schema.etlJobLog)
      .values({
        jobName: dto.jobName,
        triggeredBy: dto.triggeredBy,
        status: 'running',
      })
      .returning({ id: schema.etlJobLog.id });

    return result[0].id;
  }

  async finishJobLog(
    jobId: string,
    status: 'success' | 'failed',
    message?: string,
  ) {
    await this.db
      .update(schema.etlJobLog)
      .set({
        status: status,
        logMessage: message,
        endTime: new Date(),
      })
      .where(eq(schema.etlJobLog.id, jobId));
  }

  async getLastSuccessfulSync(jobName: string): Promise<Date | undefined> {
    const result = await this.db
      .select({ startTime: schema.etlJobLog.startTime })
      .from(schema.etlJobLog)
      .where(
        sql`${schema.etlJobLog.jobName} = ${jobName} AND ${schema.etlJobLog.status} = 'success'`,
      )
      .orderBy(sql`${schema.etlJobLog.startTime} DESC`)
      .limit(1);

    return result[0]?.startTime;
  }

  // Fact Loading

  async saveFactMahasiswa(data: DataHubMahasiswaDto[]) {
    if (data.length === 0) return;

    await this.db
      .insert(schema.factMahasiswa)
      .values(
        data.map((item) => ({
          datahubMahasiswaId: item.mahasiswaId.toString(),
          angkatan: item.angkatan,
          jenisKelamin: item.jenisKelamin,
          agama: item.agama as any,
          tglLahir: item.tglLahir,

          namaSlta: item.slta?.namaSlta,
          namaJalurDaftar: item.jalurDaftar?.namaJalurDaftar,
          namaWilayah: item.wilayah?.namaWilayah,
          namaProvinsi: item.provinsi?.namaProvinsi,

          datahubProvinsiId: item.provinsi?.provinsiId?.toString(),
          provinsiLat: item.provinsi?.latitude,
          provinsiLng: item.provinsi?.longitude,

          datahubWilayahId: item.wilayah?.wilayahId?.toString(),
          wilayahLat: item.wilayah?.latitude,
          wilayahLng: item.wilayah?.longitude,

          datahubUpdatedAt: new Date(item.updatedAt),
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: schema.factMahasiswa.datahubMahasiswaId,
        set: {
          // Fields to update on conflict
          angkatan: sql`excluded.angkatan`,
          jenisKelamin: sql`excluded.jenis_kelamin`,
          agama: sql`excluded.agama`,
          namaSlta: sql`excluded.nama_slta`,
          namaJalurDaftar: sql`excluded.nama_jalur_daftar`,
          datahubProvinsiId: sql`excluded.datahub_provinsi_id`,
          datahubWilayahId: sql`excluded.datahub_wilayah_id`,
          namaWilayah: sql`excluded.nama_wilayah`,
          namaProvinsi: sql`excluded.nama_provinsi`,
          provinsiLat: sql`excluded.provinsi_lat`,
          provinsiLng: sql`excluded.provinsi_lng`,
          wilayahLat: sql`excluded.wilayah_lat`,
          wilayahLng: sql`excluded.wilayah_lng`,
          datahubUpdatedAt: sql`excluded.datahub_updated_at`,
          updatedAt: new Date(),
        },
      });
  }

  async saveFactDosen(data: DataHubDosenDto[]) {
    if (data.length === 0) return;
  }

  async saveFactAkademik(data: DataHubAkademikDto[]) {
    if (data.length === 0) return;
  }

  // Aggregation

  async aggregateGenderData(): Promise<GenderAggregationResultDto[]> {
    // GROUP BY angkatan, jenis_kelamin
    return await this.db
      .select({
        angkatan: schema.factMahasiswa.angkatan,
        jenis: schema.factMahasiswa.jenisKelamin,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.factMahasiswa)
      .groupBy(schema.factMahasiswa.angkatan, schema.factMahasiswa.jenisKelamin)
      .orderBy(desc(schema.factMahasiswa.angkatan));
  }

  async aggregateAgamaData(): Promise<AgamaAggregationResultDto[]> {
    // GROUP BY angkatan, agama
    return await this.db
      .select({
        angkatan: schema.factMahasiswa.angkatan,
        agama: schema.factMahasiswa.agama,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.factMahasiswa)
      .groupBy(schema.factMahasiswa.angkatan, schema.factMahasiswa.agama)
      .orderBy(desc(schema.factMahasiswa.angkatan));
  }

  async aggregateSltaData(): Promise<SltaAggregationResultDto[]> {
    const sltaTypeSql = sql<string>`
        (CASE
          WHEN UPPER(${schema.factMahasiswa.namaSlta}) SIMILAR TO '(SMK|SME|SMKN|SMKS)%' THEN 'SMK'
          WHEN UPPER(${schema.factMahasiswa.namaSlta}) SIMILAR TO '(SMA|SPMA|SMAN|SMAS)%' THEN 'SMA'
          WHEN UPPER(${schema.factMahasiswa.namaSlta}) SIMILAR TO '(MA|MAN|MAS)%' THEN 'MA'
          ELSE 'Lainnya'
        END)
      `.as('jenis');

    return await this.db
      .select({
        angkatan: schema.factMahasiswa.angkatan,
        jenis: sltaTypeSql,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.factMahasiswa)
      .where(isNotNull(schema.factMahasiswa.namaSlta))
      .groupBy(schema.factMahasiswa.angkatan, sltaTypeSql);
  }

  async aggregateJalurDaftarData(): Promise<JalurDaftarAggregationResultDto[]> {
    // GROUP BY angkatan, nama_jalur_daftar
    return await this.db
      .select({
        angkatan: schema.factMahasiswa.angkatan,
        jalur: schema.factMahasiswa.namaJalurDaftar,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.factMahasiswa)
      .where(sql`${schema.factMahasiswa.namaJalurDaftar} IS NOT NULL`)
      .groupBy(
        schema.factMahasiswa.angkatan,
        schema.factMahasiswa.namaJalurDaftar,
      );
  }

  async aggregateJumlahMahasiswaPerAngkatan(): Promise<
    JumlahMhsAggregationResultDto[]
  > {
    // GROUP BY angkatan
    return await this.db
      .select({
        angkatan: schema.factMahasiswa.angkatan,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.factMahasiswa)
      .groupBy(schema.factMahasiswa.angkatan)
      .orderBy(desc(schema.factMahasiswa.angkatan));
  }

  async aggregateDomisiliData(): Promise<DomisiliAggregationResultDto[]> {
    // GROUP BY provinsi, wilayah (termasuk geo lat/long)
    // Mengambil data lengkap agar bisa di-filter per provinsi nanti
    // Service bisa memilahnya menjadi dua jenis cache (All & Per Provinsi)
    return await this.db
      .select({
        namaProvinsi: schema.factMahasiswa.namaProvinsi,
        provinsiLat: schema.factMahasiswa.provinsiLat,
        provinsiLng: schema.factMahasiswa.provinsiLng,
        namaWilayah: schema.factMahasiswa.namaWilayah,
        wilayahLat: schema.factMahasiswa.wilayahLat,
        wilayahLng: schema.factMahasiswa.wilayahLng,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.factMahasiswa)
      .where(sql`${schema.factMahasiswa.namaProvinsi} IS NOT NULL`)
      .groupBy(
        schema.factMahasiswa.namaProvinsi,
        schema.factMahasiswa.provinsiLat,
        schema.factMahasiswa.provinsiLng,
        schema.factMahasiswa.namaWilayah,
        schema.factMahasiswa.wilayahLat,
        schema.factMahasiswa.wilayahLng,
      );
  }

  // Cache Saving
  async saveAggregateResult(key: string, data: any) {
    return await this.db
      .insert(schema.aggrCache)
      .values({
        cacheKey: key,
        data: { data },
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.aggrCache.cacheKey,
        set: {
          data: { data },
          lastUpdated: new Date(),
        },
      });
  }
}
