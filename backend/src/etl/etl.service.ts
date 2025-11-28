import { Injectable, Logger } from '@nestjs/common';
import { EtlRepository } from './etl.repository';
import { DataHubService } from './datahub/datahub.service';
import {
  JOB_NAMES,
  GUEST_CACHE_KEYS,
  KEMAHASISWAAN_CACHE_KEYS,
  AKADEMIK_CACHE_KEYS,
} from '../constants';
import { DomisiliAggregationResultDto } from './dto/aggregation-result.dto';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly etlRepository: EtlRepository,
    private readonly dataHubService: DataHubService,
  ) {}

  // Orchestration / Full sync
  async runFullSync(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(
      JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
      triggeredBy,
      async () => {
        // 1. Sync All
        await this.syncMahasiswaInternal();
        await this.syncDosenInternal();
        await this.syncAkademikInternal();

        // 2. Aggregate All
        await this.aggregateGuestDataInternal();
        await this.aggregateKemahasiswaanDataInternal();
        await this.aggregateAkademikDataInternal();
      },
    );
  }

  // Sync Logic (Public Methods with Logging)

  async syncMahasiswa(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(JOB_NAMES.SYNC_MAHASISWA, triggeredBy, () =>
      this.syncMahasiswaInternal(),
    );
  }

  async syncDosen(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(JOB_NAMES.SYNC_DOSEN, triggeredBy, () =>
      this.syncDosenInternal(),
    );
  }

  async syncAkademik(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(JOB_NAMES.SYNC_AKADEMIK, triggeredBy, () =>
      this.syncAkademikInternal(),
    );
  }

  // Sync Logic (Internal Implementations)

  private async syncMahasiswaInternal() {
    this.logger.debug('Syncing Mahasiswa data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_MAHASISWA,
    );
    const data = await this.dataHubService.getMahasiswaData(lastSync);
    await this.etlRepository.saveFactMahasiswa(data);
    this.logger.debug(`Synced ${data.length} mahasiswa records.`);
  }

  private async syncDosenInternal() {
    this.logger.debug('Syncing Dosen data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_DOSEN,
    );
    const data = await this.dataHubService.getDosenData(lastSync);
    await this.etlRepository.saveFactDosen(data);
    this.logger.debug(`Synced ${data.length} dosen records.`);
  }

  private async syncAkademikInternal() {
    this.logger.debug('Syncing Akademik data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_AKADEMIK,
    );
    const data = await this.dataHubService.getAkademikData(lastSync);
    await this.etlRepository.saveFactAkademik(data);
    this.logger.debug(`Synced ${data.length} akademik records.`);
  }

  // Aggregation Logic (Public Methods with Logging)

  async aggregateGuestData(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(JOB_NAMES.AGGREGATE_GUEST_DATA, triggeredBy, () =>
      this.aggregateGuestDataInternal(),
    );
  }

  async aggregateKemahasiswaanData(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(
      JOB_NAMES.AGGREGATE_KEMAHASISWAAN_DATA,
      triggeredBy,
      () => this.aggregateKemahasiswaanDataInternal(),
    );
  }

  async aggregateAkademikData(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(JOB_NAMES.AGGREGATE_AKADEMIK_DATA, triggeredBy, () =>
      this.aggregateAkademikDataInternal(),
    );
  }

  // Aggregation Logic (Internal Implementations)

  private async aggregateGuestDataInternal() {
    this.logger.debug('Aggregating GUEST Data...');

    // 1. GENDER
    const genderDataRaw = await this.etlRepository.aggregateGenderData();
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_GENDER,
      this.groupByAndSum(genderDataRaw, 'jenis'),
    );

    // 2. JENIS SLTA
    const sltaDataRaw = await this.etlRepository.aggregateSltaData();
    const guestSltaSummed = this.groupByAndSum(sltaDataRaw, 'jenis');

    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_JENIS_SLTA,
      guestSltaSummed,
    );

    // 3. RASIO DOSEN MAHASISWA
    // TODO: RASIO DOSEN MAHASISWA AGGREGATION

    // 4. DOMISILI
    const domisiliRaw = await this.etlRepository.aggregateDomisiliData();

    // A. Simpan Guest Domisili All (Group by Provinsi)
    const guestDomisiliAll = this.transformDomisiliForGuestAll(domisiliRaw);
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_ALL,
      guestDomisiliAll,
    );

    // B. Simpan Guest Domisili Per Provinsi (Group by Wilayah)
    const uniqueProvinces = [
      ...new Set(domisiliRaw.map((d) => d.namaProvinsi)),
    ];

    for (const prov of uniqueProvinces) {
      const dataProv = domisiliRaw.filter((d) => d.namaProvinsi === prov);
      const transformedProv = this.transformDomisiliForGuestProvinsi(
        prov,
        dataProv,
      );

      const provSlug = prov.toLowerCase().replace(/\s+/g, '_');

      const cacheKey = `${GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_PROVINSI_PREFIX}${provSlug}`;

      await this.etlRepository.saveAggregateResult(cacheKey, transformedProv);
    }

    // 5. AGAMA
    const agamaDataRaw = await this.etlRepository.aggregateAgamaData();
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_AGAMA,
      this.groupByAndSum(agamaDataRaw, 'agama'),
    );

    // 6. JALUR DAFTAR / TIPE TES MASUK
    const jalurRaw = await this.etlRepository.aggregateJalurDaftarData();
    const tipeTesFormatted = jalurRaw.map((item) => ({
      tipe: item.jalur,
      total: item.total,
    }));
    const tipeTesSummed = this.groupByAndSum(tipeTesFormatted, 'tipe');
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.AKADEMIK_TIPE_TES_MASUK,
      tipeTesSummed,
    );
  }

  private async aggregateKemahasiswaanDataInternal() {
    this.logger.debug('Aggregating KEMAHASISWAAN Data...');

    // 1. JUMLAH MAHASISWA
    const jumlahMhsRaw =
      await this.etlRepository.aggregateJumlahMahasiswaPerAngkatan();
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.JUMLAH_MAHASISWA,
      jumlahMhsRaw,
    );

    // 2. GENDER
    const genderDataRaw = await this.etlRepository.aggregateGenderData();
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.GENDER,
      genderDataRaw,
    );

    // 3. JENIS SLTA
    const sltaDataRaw = await this.etlRepository.aggregateSltaData();
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.JENIS_SLTA,
      sltaDataRaw,
    );

    // 4. AGAMA
    const agamaDataRaw = await this.etlRepository.aggregateAgamaData();
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.AGAMA,
      agamaDataRaw,
    );
  }

  private async aggregateAkademikDataInternal() {
    this.logger.debug('Aggregating AKADEMIK Data...');

    // 1. DISTRIBUSI NILAI
    // TODO: DISTRIBUSI NILAI AGGREGATION

    // 2. TREN IP RATA RATA
    // TODO: TREN IP RATA RATA AGGREGATION

    // 3. TREN IP TERTINGGI
    // TODO: TREN IP TERTINGGI AGGREGATION

    // 4. JALUR DAFTAR / TIPE TES MASUK
    const jalurRaw = await this.etlRepository.aggregateJalurDaftarData();
    const tipeTesFormatted = jalurRaw.map((item) => ({
      angkatan: item.angkatan,
      tipe: item.jalur,
      total: item.total,
    }));
    await this.etlRepository.saveAggregateResult(
      AKADEMIK_CACHE_KEYS.TIPE_TES_MASUK,
      tipeTesFormatted,
    );
  }

  // Helpers

  /**
   * Membungkus eksekusi job dengan startJobLog dan finishJobLog
   */
  private async wrapJob(
    jobName: string,
    triggeredBy: 'cron' | 'manual',
    action: () => Promise<void>,
  ) {
    const jobId = await this.etlRepository.startJobLog({
      jobName,
      triggeredBy,
    });
    try {
      this.logger.log(`Starting Job ${jobName} [${jobId}]...`);
      await action();
      await this.etlRepository.finishJobLog(jobId, 'success');
      this.logger.log(`Job ${jobName} [${jobId}] completed successfully.`);
    } catch (error) {
      const errorMsg = error?.message || String(error);
      this.logger.error(`Job ${jobName} [${jobId}] failed: ${errorMsg}`);
      await this.etlRepository.finishJobLog(jobId, 'failed', errorMsg);
      throw error;
    }
  }

  private groupByAndSum<T extends Record<string, any>>(
    data: T[],
    keyField: keyof T,
  ) {
    const map = new Map<string, number>();
    data.forEach((item) => {
      const key = String(item[keyField]);
      const current = map.get(key) || 0;
      map.set(key, current + item.total);
    });
    return Array.from(map.entries()).map(([key, total]) => ({
      [keyField]: key,
      total,
    }));
  }

  /**
   * Helper untuk Guest Domisili All (Peta Indonesia)
   * Mengelompokkan data berdasarkan Provinsi
   */
  private transformDomisiliForGuestAll(data: DomisiliAggregationResultDto[]) {
    const provMap = new Map<
      string,
      { provinsi: string; total: number; geo: { lat: number; lng: number } }
    >();

    data.forEach((item) => {
      if (!provMap.has(item.namaProvinsi)) {
        provMap.set(item.namaProvinsi, {
          provinsi: item.namaProvinsi,
          total: 0,
          geo: { lat: item.provinsiLat, lng: item.provinsiLng },
        });
      }
      const entry = provMap.get(item.namaProvinsi);
      entry.total += item.total;
    });

    return { data: Array.from(provMap.values()) };
  }

  /**
   * Helper untuk Guest Domisili Per Provinsi (Peta Provinsi)
   * Mengelompokkan data berdasarkan Kota/Kabupaten
   */
  private transformDomisiliForGuestProvinsi(
    provinsiName: string,
    data: DomisiliAggregationResultDto[],
  ) {
    const kotaList = data.map((item) => ({
      kota: item.namaWilayah,
      total: item.total,
      geo: { lat: item.wilayahLat, lng: item.wilayahLng },
    }));

    return {
      provinsi: provinsiName,
      data: kotaList,
    };
  }
}
