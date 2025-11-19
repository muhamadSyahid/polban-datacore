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
import { toSnakeCase } from 'drizzle-orm/casing';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly etlRepository: EtlRepository,
    private readonly dataHubService: DataHubService,
  ) {}

  // Orchestration / Full sync
  async runFullSync(
    jobName: string = JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
    triggeredBy: 'cron' | 'manual' = 'manual',
  ) {
    const jobId = await this.etlRepository.startJobLog({
      jobName,
      triggeredBy,
    });

    try {
      this.logger.log(`Starting Job ${jobName} [${jobId}]...`);

      // Sync Data (ETL)
      await this.syncMahasiswa();

      // Aggregate Data (Transform & Cache)
      // Menjalankan agregasi untuk Guest dan Internal sekaligus
      await this.aggregateDataMahasiswa();

      await this.etlRepository.finishJobLog(jobId, 'success');
      this.logger.log(`Job ${jobName} [${jobId}] completed successfully.`);
    } catch (error) {
      this.logger.error(`Job ${jobName} [${jobId}] failed: ${error.message}`);
      await this.etlRepository.finishJobLog(jobId, 'failed', error.message);
      throw error;
    }
  }

  // Sync Logic
  async syncMahasiswa() {
    this.logger.debug('Syncing Mahasiswa data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_MAHASISWA,
    );

    const data = await this.dataHubService.getMahasiswaData(lastSync);
    await this.etlRepository.saveFactMahasiswa(data);

    this.logger.debug(`Synced ${data.length} mahasiswa records.`);
  }

  // Aggregation Logic
  async aggregateDataMahasiswa() {
    this.logger.debug('Aggregating Mahasiswa Data (Guest & Internal)...');

    // 1. GENDER
    const genderDataRaw = await this.etlRepository.aggregateGenderData();
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_GENDER,
      this.groupByAndSum(genderDataRaw, 'jenis'),
    );
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.GENDER,
      genderDataRaw,
    );

    // 2. AGAMA
    const agamaDataRaw = await this.etlRepository.aggregateAgamaData();
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_AGAMA,
      this.groupByAndSum(agamaDataRaw, 'agama'),
    );
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.AGAMA,
      agamaDataRaw,
    );

    // 3. SLTA
    const sltaDataRaw = await this.etlRepository.aggregateSltaData();
    const guestSltaMapped = this.groupByAndSum(sltaDataRaw, 'namaSlta').map(
      (item) => ({
        jenis: item.namaSlta,
        total: item.total,
      }),
    );
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_JENIS_SLTA,
      guestSltaMapped,
    );
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.JENIS_SLTA,
      sltaDataRaw,
    );

    // 4. DOMISILI
    const domisiliRaw = await this.etlRepository.aggregateDomisiliData();

    // A. Simpan Guest Domisili All (Group by Provinsi)
    const guestDomisiliAll = this.transformDomisiliForGuestAll(domisiliRaw);
    await this.etlRepository.saveAggregateResult(
      GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_ALL,
      guestDomisiliAll,
    );

    // B. Simpan Guest Domisili Per Provinsi (Group by Wilayah/Kota)
    const uniqueProvinces = [
      ...new Set(domisiliRaw.map((d) => d.namaProvinsi)),
    ];

    for (const prov of uniqueProvinces) {
      // Filter data hanya untuk provinsi ini
      const dataProv = domisiliRaw.filter((d) => d.namaProvinsi === prov);
      const transformedProv = this.transformDomisiliForGuestProvinsi(
        prov,
        dataProv,
      );

      const cacheKey = `${GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_PROVINSI_PREFIX}${toSnakeCase(prov)}`;

      await this.etlRepository.saveAggregateResult(cacheKey, transformedProv);
    }

    // 5. JUMLAH MAHASISWA (Internal)
    const jumlahMhsRaw =
      await this.etlRepository.aggregateJumlahMahasiswaPerAngkatan();
    await this.etlRepository.saveAggregateResult(
      KEMAHASISWAAN_CACHE_KEYS.JUMLAH_MAHASISWA,
      jumlahMhsRaw,
    );

    // 6. JALUR DAFTAR (Internal)
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

    this.logger.debug('Mahasiswa Data aggregation completed.');
  }

  // Helpers
  private groupByAndSum(data: any[], keyField: string) {
    const map = new Map<string, number>();
    data.forEach((item) => {
      const key = item[keyField];
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
    const provMap = new Map<string, any>();

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

    return Array.from(provMap.values());
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
