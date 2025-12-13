import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq, ilike, or, SQL, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JOB_NAMES, MV_NAMES } from '../constants';
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

    const nilaiRecords: (typeof schema.factAkademikNilai.$inferInsert)[] = [];
    const ipRecords: (typeof schema.factAkademikIp.$inferInsert)[] = [];

    // Flattening, data per mahasiswa dipecah per nilai/ip
    for (const mhs of data) {
      // Prepare Fact Nilai
      if (mhs.nilaiMahasiswa && mhs.nilaiMahasiswa.length > 0) {
        for (const nilai of mhs.nilaiMahasiswa) {
          nilaiRecords.push({
            datahubNilaiId: nilai.nilaiId,
            mahasiswaId: mhs.mahasiswaId,
            angkatan: mhs.angkatan,

            kodeMk: nilai.kodeMk,
            namaMk: nilai.mataKuliah.namaMk,
            sks: nilai.mataKuliah.sks,

            nilaiHuruf: nilai.nilaiHuruf,

            tahunAjaran: nilai.periode.tahunAjaran,
            semesterNama: nilai.periode.semester,

            // Asumsi fetch time karena akademik DataHub tidak ada field updated_at
            datahubUpdatedAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Prepare Fact IP
      if (mhs.ip && mhs.ip.length > 0) {
        for (const ipItem of mhs.ip) {
          // Logika Semester Urut: (Tahun - Angkatan) * 2 + (1 jika Ganjil, 2 jika Genap)
          // Contoh: Angkatan 2023, Tahun 2023 Ganjil = (0)*2 + 1 = Sem 1
          // Contoh: Angkatan 2023, Tahun 2024 Genap = (1)*2 + 2 = Sem 4
          const semesterOffset = ipItem.periode.semester === 'Ganjil' ? 1 : 2;
          const semesterUrut =
            (ipItem.periode.tahunAjaran - mhs.angkatan) * 2 + semesterOffset;

          ipRecords.push({
            datahubIpId: ipItem.ipId,
            mahasiswaId: mhs.mahasiswaId,
            angkatan: mhs.angkatan,

            tahunAjaran: ipItem.periode.tahunAjaran,
            semesterNama: ipItem.periode.semester,
            semesterUrut: semesterUrut > 0 ? semesterUrut : 0,

            ipSemester: ipItem.ipSemester,
            ipk: ipItem.ipk,

            // Asumsi fetch time karena akademik DataHub tidak ada field updated_at
            datahubUpdatedAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    // Bulk Upsert Fact Nilai
    if (nilaiRecords.length > 0) {
      await this.db
        .insert(schema.factAkademikNilai)
        .values(nilaiRecords)
        .onConflictDoUpdate({
          target: schema.factAkademikNilai.datahubNilaiId,
          set: {
            nilaiHuruf: sql`excluded.nilai_huruf`,
            kodeMk: sql`excluded.kode_mk`,
            namaMk: sql`excluded.nama_mk`,
            sks: sql`excluded.sks`,
            updatedAt: new Date(),
          },
        });
    }

    // Bulk Upsert Fact IP
    if (ipRecords.length > 0) {
      await this.db
        .insert(schema.factAkademikIp)
        .values(ipRecords)
        .onConflictDoUpdate({
          target: schema.factAkademikIp.datahubIpId,
          set: {
            ipSemester: sql`excluded.ip_semester`,
            ipk: sql`excluded.ipk`,
            semesterUrut: sql`excluded.semester_urut`,
            updatedAt: new Date(),
          },
        });
    }
  }

  // Aggregation (REFRESH MATERIALIZED VIEWS)

  async refreshAllAggregatedData(): Promise<void> {
    await Promise.all([
      this.refreshAggregatedMhsGenderData(),
      this.refreshAggregatedMhsAgamaData(),
      this.refreshAggregatedMhsSltaData(),
      this.refreshAggregatedMhsJalurDaftarData(),
      this.refreshAggregatedMhsTotalData(),
      this.refreshAggregatedMhsDomisiliData(),

      this.refreshAggregatedAkdDistribusiNilai(),
      this.refreshAggregatedAkdTrenIpRataRata(),
      this.refreshAggregatedAkdTrenIpTertinggi(),
    ]);
  }

  // mahasiswa

  async refreshAggregatedMhsGenderData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaGender)
      .concurrently();
  }

  async refreshAggregatedMhsAgamaData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaAgama)
      .concurrently();
  }

  async refreshAggregatedMhsSltaData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaSltaKategori)
      .concurrently();
  }

  async refreshAggregatedMhsJalurDaftarData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaJalurDaftar)
      .concurrently();
  }

  async refreshAggregatedMhsTotalData(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaTotal)
      .concurrently();
  }

  async refreshAggregatedMhsDomisiliData(): Promise<void> {
    // Mengambil data lengkap agar bisa di-filter per provinsi nanti
    // Service bisa memilahnya menjadi dua jenis cache (All & Per Provinsi)
    await this.db
      .refreshMaterializedView(schema.mvMahasiswaDomisili)
      .concurrently();
  }

  // akademik

  async refreshAggregatedAkdDistribusiNilai(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvAkademikDistribusiNilai)
      .concurrently();
  }

  async refreshAggregatedAkdTrenIpRataRata(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvAkademikTrenIpRataRata)
      .concurrently();
  }

  async refreshAggregatedAkdTrenIpTertinggi(): Promise<void> {
    await this.db
      .refreshMaterializedView(schema.mvAkademikTrenIpTertinggi)
      .concurrently();
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

  async getTotalFactAkademikNilai(): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(schema.factAkademikNilai);
    return result[0].count;
  }

  async getTotalFactAkademikIp(): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(schema.factAkademikIp);
    return result[0].count;
  }

  // INSPECTOR

  async getMaterializedViewDataPaged(
    mvName: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: any[]; total: number }> {
    const config = this.mvConfig[mvName];
    if (!config) {
      throw new Error(`Materialized View '${mvName}' is not configured.`);
    }

    const { table, searchFields, sortBy } = config;
    const offset = (page - 1) * limit;

    // Build Filter Condition (Dynamic Search)
    let whereCondition: SQL | undefined = undefined;
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) =>
        ilike(sql`${field}::text`, `%${search}%`),
      );

      whereCondition = or(...searchConditions);
    }

    const dataQuery = this.db.select().from(table).limit(limit).offset(offset);

    if (whereCondition) {
      dataQuery.where(whereCondition);
    }

    dataQuery.orderBy(...sortBy);

    const countQuery = this.db.select({ count: count() }).from(table);

    if (whereCondition) {
      countQuery.where(whereCondition);
    }

    const [data, totalResult] = await Promise.all([dataQuery, countQuery]);

    return {
      data,
      total: totalResult[0].count,
    };
  }

  private mvConfig = {
    [MV_NAMES.MAHASISWA_GENDER]: {
      table: schema.mvMahasiswaGender,
      searchFields: [schema.mvMahasiswaGender.jenis],
      sortBy: [
        schema.mvMahasiswaGender.angkatan,
        schema.mvMahasiswaGender.jenis,
      ],
    },
    [MV_NAMES.MAHASISWA_AGAMA]: {
      table: schema.mvMahasiswaAgama,
      searchFields: [schema.mvMahasiswaAgama.agama],
      sortBy: [
        schema.mvMahasiswaAgama.angkatan,
        desc(schema.mvMahasiswaAgama.total),
      ],
    },
    [MV_NAMES.MAHASISWA_SLTA_KATEGORI]: {
      table: schema.mvMahasiswaSltaKategori,
      searchFields: [schema.mvMahasiswaSltaKategori.jenis],
      sortBy: [
        schema.mvMahasiswaSltaKategori.angkatan,
        schema.mvMahasiswaSltaKategori.jenis,
      ],
    },
    [MV_NAMES.MAHASISWA_JALUR_DAFTAR]: {
      table: schema.mvMahasiswaJalurDaftar,
      searchFields: [schema.mvMahasiswaJalurDaftar.tipe],
      sortBy: [
        schema.mvMahasiswaJalurDaftar.angkatan,
        schema.mvMahasiswaJalurDaftar.tipe,
      ],
    },
    [MV_NAMES.MAHASISWA_TOTAL]: {
      table: schema.mvMahasiswaTotal,
      searchFields: [],
      sortBy: [schema.mvMahasiswaTotal.angkatan],
    },
    [MV_NAMES.MAHASISWA_DOMISILI_KOTA]: {
      table: schema.mvMahasiswaDomisili,
      searchFields: [
        schema.mvMahasiswaDomisili.namaProvinsi,
        schema.mvMahasiswaDomisili.namaWilayah,
        schema.mvMahasiswaDomisili.provinsiLat,
        schema.mvMahasiswaDomisili.provinsiLng,
        schema.mvMahasiswaDomisili.wilayahLat,
        schema.mvMahasiswaDomisili.wilayahLng,
      ],
      sortBy: [
        schema.mvMahasiswaDomisili.namaProvinsi,
        schema.mvMahasiswaDomisili.namaWilayah,
      ],
    },

    [MV_NAMES.AKADEMIK_DISTRIBUSI_NILAI]: {
      table: schema.mvAkademikDistribusiNilai,
      searchFields: [
        schema.mvAkademikDistribusiNilai.angkatan,
        schema.mvAkademikDistribusiNilai.kodeMk,
        schema.mvAkademikDistribusiNilai.namaMk,
        schema.mvAkademikDistribusiNilai.sks,
        schema.mvAkademikDistribusiNilai.nilaiHuruf,
      ],
      sortBy: [
        schema.mvAkademikDistribusiNilai.angkatan,
        schema.mvAkademikDistribusiNilai.kodeMk,
        schema.mvAkademikDistribusiNilai.nilaiHuruf,
      ],
    },
    [MV_NAMES.AKADEMIK_TREN_IP_RATA_RATA]: {
      table: schema.mvAkademikTrenIpRataRata,
      searchFields: [
        schema.mvAkademikTrenIpRataRata.angkatan,
        schema.mvAkademikTrenIpRataRata.semesterUrut,
      ],
      sortBy: [
        schema.mvAkademikTrenIpRataRata.angkatan,
        schema.mvAkademikTrenIpRataRata.semesterUrut,
      ],
    },
    [MV_NAMES.AKADEMIK_TREN_IP_TERTINGGI]: {
      table: schema.mvAkademikTrenIpTertinggi,
      searchFields: [
        schema.mvAkademikTrenIpTertinggi.angkatan,
        schema.mvAkademikTrenIpTertinggi.semesterUrut,
      ],
      sortBy: [
        schema.mvAkademikTrenIpTertinggi.angkatan,
        schema.mvAkademikTrenIpTertinggi.semesterUrut,
      ],
    },
  };
}
