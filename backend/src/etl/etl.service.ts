import { Injectable, Logger } from '@nestjs/common';
import { EtlRepository } from './etl.repository';
import { DataHubService } from './datahub/datahub.service';
import { AuthService } from '../auth/auth.service';
import { JOB_NAMES } from '../constants';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly etlRepository: EtlRepository,
    private readonly dataHubService: DataHubService,
    private readonly authService: AuthService,
  ) {}

  // Orchestration / Full sync
  async runFullSync(triggeredBy: 'cron' | 'manual' = 'manual') {
    await this.wrapJob(
      JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
      triggeredBy,
      async () => {
        // 1. Sync All (Ingestion)
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
    this.logger.debug(`Getting System's DataHub Auth Token...`);
    const token = await this.authService.getSystemToken();

    this.logger.debug('Syncing Mahasiswa data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_MAHASISWA,
    );
    const data = await this.dataHubService.getMahasiswaData(token, lastSync);
    await this.etlRepository.saveFactMahasiswa(data);
    this.logger.debug(`Synced ${data.length} mahasiswa records.`);
  }

  private async syncDosenInternal() {
    this.logger.debug(`Getting System's DataHub Auth Token...`);
    const token = await this.authService.getSystemToken();

    this.logger.debug('Syncing Dosen data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_DOSEN,
    );
    const data = await this.dataHubService.getDosenData(token, lastSync);
    await this.etlRepository.saveFactDosen(data);
    this.logger.debug(`Synced ${data.length} dosen records.`);
  }

  private async syncAkademikInternal() {
    this.logger.debug(`Getting System's DataHub Auth Token...`);
    const token = await this.authService.getSystemToken();

    this.logger.debug('Syncing Akademik data from DataHub...');
    const lastSync = await this.etlRepository.getLastSuccessfulSync(
      JOB_NAMES.SYNC_AKADEMIK,
    );
    const data = await this.dataHubService.getAkademikData(token, lastSync);
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

    await Promise.all([
      // 1. GENDER
      this.etlRepository.refreshAggregatedMhsGenderData(),

      // 2. JENIS SLTA
      this.etlRepository.refreshAggregatedMhsSltaData(),

      // 3. RASIO DOSEN MAHASISWA
      // TODO: RASIO DOSEN MAHASISWA AGGREGATION

      // 4. DOMISILI
      this.etlRepository.refreshAggregatedMhsDomisiliData(),

      // 5. AGAMA
      this.etlRepository.refreshAggregatedMhsAgamaData(),

      // 6. JALUR DAFTAR / TIPE TES MASUK
      this.etlRepository.refreshAggregatedMhsJalurDaftarData(),
    ]);
  }

  private async aggregateKemahasiswaanDataInternal() {
    this.logger.debug('Aggregating KEMAHASISWAAN Data...');

    await Promise.all([
      // 1. JUMLAH MAHASISWA
      this.etlRepository.refreshAggregatedMhsTotalData(),

      // 2. GENDER
      this.etlRepository.refreshAggregatedMhsGenderData(),

      // 3. JENIS SLTA
      this.etlRepository.refreshAggregatedMhsSltaData(),

      // 4. AGAMA
      this.etlRepository.refreshAggregatedMhsAgamaData(),
    ]);
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
    await this.etlRepository.refreshAggregatedJalurDaftarData();
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
}
