import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JOB_NAMES } from '../constants';
import { DRIZZLE_PROVIDER } from '../database/drizzle/drizzle.provider';
import * as schema from '../database/drizzle/schema';
import { DataHubAkademikDto } from './datahub/dto/datahub-akademik.dto';
import { DataHubDosenDto } from './datahub/dto/datahub-dosen.dto';
import { DataHubMahasiswaDto } from './datahub/dto/datahub-mahasiswa.dto';
import { CreateEtlJobLogDto } from './dto/create-etl-job-log.dto';
import { EtlJobLogDto } from './dto/etl-job-log.dto';

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

  // Aggregation (REFRESH MATERIALIZED VIEWS)

  async refreshAggregatedGenderData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaGender)
      .concurrently();
  }

  async refreshAggregatedAgamaData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaAgama)
      .concurrently();
  }

  async refreshAggregatedSltaData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaSltaKategori)
      .concurrently();
  }

  async refreshAggregatedJalurDaftarData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaJalurDaftar)
      .concurrently();
  }

  async refreshAggregatedJumlahMhsData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaTotalPerAngkatan)
      .concurrently();
  }

  async refreshAggregatedDomisiliData(): Promise<void> {
    // Mengambil data lengkap agar bisa di-filter per provinsi nanti
    // Service bisa memilahnya menjadi dua jenis cache (All & Per Provinsi)
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaDomisiliKota)
      .concurrently();
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

  // READ

  async getJobLogs(limit: number, offset: number): Promise<EtlJobLogDto[]> {
    const logs = await this.db
      .select()
      .from(schema.etlJobLog)
      .orderBy(desc(schema.etlJobLog.startTime))
      .limit(limit)
      .offset(offset);

    return logs as EtlJobLogDto[];
  }

  async getJobLogsCount(): Promise<number> {
    const jobLogsCount = await this.db
      .select({ count: count() })
      .from(schema.etlJobLog);
    return jobLogsCount[0].count;
  }

  async getJobLogById(id: string): Promise<EtlJobLogDto | null> {
    const result = await this.db
      .select()
      .from(schema.etlJobLog)
      .where(eq(schema.etlJobLog.id, id))
      .limit(1);

    return (result[0] as EtlJobLogDto) || null;
  }

  async getLastMainJobRun(): Promise<EtlJobLogDto | null> {
    const result = await this.db
      .select()
      .from(schema.etlJobLog)
      .where(eq(schema.etlJobLog.jobName, JOB_NAMES.FULL_SYNC_AND_AGGREGATE))
      .orderBy(desc(schema.etlJobLog.startTime))
      .limit(1);

    return result[0] || null;
  }

  async getTotalFactMahasiswa(): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(schema.factMahasiswa);
    return result[0].count;
  }

  async getTotalFactDosen(): Promise<number> {
    return 0;
  }

  async getTotalFactAkademik(): Promise<number> {
    return 0;
  }
}
