import { Test, TestingModule } from '@nestjs/testing';
import { JOB_NAMES } from '../constants';
import { DataHubService } from './datahub/datahub.service';
import { EtlRepository } from './etl.repository';
import { EtlService } from './etl.service';

describe('EtlService', () => {
  let service: EtlService;
  let repository: EtlRepository;
  let dataHubService: DataHubService;

  const mockEtlRepository = {
    startJobLog: jest.fn(),
    finishJobLog: jest.fn(),
    getLastSuccessfulSync: jest.fn(),
    saveFactMahasiswa: jest.fn(),
    saveFactDosen: jest.fn(),
    saveFactAkademik: jest.fn(),
    refreshAggregatedGenderData: jest.fn(),
    refreshAggregatedAgamaData: jest.fn(),
    refreshAggregatedSltaData: jest.fn(),
    refreshAggregatedDomisiliData: jest.fn(),
    refreshAggregatedJumlahMhsData: jest.fn(),
    refreshAggregatedJalurDaftarData: jest.fn(),
  };

  const mockDataHubService = {
    getMahasiswaData: jest.fn(),
    getDosenData: jest.fn(),
    getAkademikData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtlService,
        { provide: EtlRepository, useValue: mockEtlRepository },
        { provide: DataHubService, useValue: mockDataHubService },
      ],
    }).compile();

    service = module.get<EtlService>(EtlService);
    repository = module.get<EtlRepository>(EtlRepository);
    dataHubService = module.get<DataHubService>(DataHubService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Orchestration (runFullSync)', () => {
    it('should execute full sync flow (sync all -> aggregate all) successfully', async () => {
      const jobId = 'job-123';
      mockEtlRepository.startJobLog.mockResolvedValue(jobId);
      mockDataHubService.getMahasiswaData.mockResolvedValue([]);
      mockDataHubService.getDosenData.mockResolvedValue([]);
      mockDataHubService.getAkademikData.mockResolvedValue([]);

      await service.runFullSync('manual');

      // 1. Check Logging
      expect(repository.startJobLog).toHaveBeenCalledWith({
        jobName: JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
        triggeredBy: 'manual',
      });
      expect(repository.finishJobLog).toHaveBeenCalledWith(jobId, 'success');

      // 2. Check Sync Calls
      expect(dataHubService.getMahasiswaData).toHaveBeenCalled();
      expect(dataHubService.getDosenData).toHaveBeenCalled();
      expect(dataHubService.getAkademikData).toHaveBeenCalled();

      // 3. Check Aggregation Calls
      // Should call ALL aggregate methods
      expect(repository.refreshAggregatedGenderData).toHaveBeenCalled();
      expect(repository.refreshAggregatedAgamaData).toHaveBeenCalled();
      expect(repository.refreshAggregatedSltaData).toHaveBeenCalled();
      expect(repository.refreshAggregatedDomisiliData).toHaveBeenCalled();
      expect(repository.refreshAggregatedJumlahMhsData).toHaveBeenCalled();
      expect(repository.refreshAggregatedJalurDaftarData).toHaveBeenCalled();
    });

    it('should log failure and rethrow error if any step fails', async () => {
      const jobId = 'job-fail';
      const error = new Error('API Error');
      mockEtlRepository.startJobLog.mockResolvedValue(jobId);
      mockDataHubService.getMahasiswaData.mockRejectedValue(error);

      await expect(service.runFullSync('cron')).rejects.toThrow(error);

      expect(repository.startJobLog).toHaveBeenCalledWith({
        jobName: JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
        triggeredBy: 'cron',
      });
      expect(repository.finishJobLog).toHaveBeenCalledWith(
        jobId,
        'failed',
        'API Error',
      );
    });
  });

  describe('Sync Logic', () => {
    it('syncMahasiswa should fetch data since last sync and save it', async () => {
      const jobId = 'job-mhs';
      const lastSyncDate = new Date('2024-01-01');
      const mockData = [{ mahasiswaId: 1 }];

      mockEtlRepository.startJobLog.mockResolvedValue(jobId);
      mockEtlRepository.getLastSuccessfulSync.mockResolvedValue(lastSyncDate);
      mockDataHubService.getMahasiswaData.mockResolvedValue(mockData);

      await service.syncMahasiswa('manual');

      expect(repository.startJobLog).toHaveBeenCalledWith({
        jobName: JOB_NAMES.SYNC_MAHASISWA,
        triggeredBy: 'manual',
      });
      expect(repository.getLastSuccessfulSync).toHaveBeenCalledWith(
        JOB_NAMES.SYNC_MAHASISWA,
      );
      expect(dataHubService.getMahasiswaData).toHaveBeenCalledWith(
        lastSyncDate,
      );
      expect(repository.saveFactMahasiswa).toHaveBeenCalledWith(mockData);
      expect(repository.finishJobLog).toHaveBeenCalledWith(jobId, 'success');
    });

    it('syncDosen should fetch and save data', async () => {
      const jobId = 'job-dosen';
      mockEtlRepository.startJobLog.mockResolvedValue(jobId);
      mockEtlRepository.getLastSuccessfulSync.mockResolvedValue(null);
      mockDataHubService.getDosenData.mockResolvedValue([]);

      await service.syncDosen('cron');

      expect(repository.getLastSuccessfulSync).toHaveBeenCalledWith(
        JOB_NAMES.SYNC_DOSEN,
      );
      expect(dataHubService.getDosenData).toHaveBeenCalledWith(null);
      expect(repository.saveFactDosen).toHaveBeenCalledWith([]);
      expect(repository.finishJobLog).toHaveBeenCalledWith(jobId, 'success');
    });

    it('syncAkademik should fetch and save data', async () => {
      const jobId = 'job-akademik';
      mockEtlRepository.startJobLog.mockResolvedValue(jobId);
      mockDataHubService.getAkademikData.mockResolvedValue([]);

      await service.syncAkademik('manual');

      expect(repository.getLastSuccessfulSync).toHaveBeenCalledWith(
        JOB_NAMES.SYNC_AKADEMIK,
      );
      expect(dataHubService.getAkademikData).toHaveBeenCalled();
      expect(repository.saveFactAkademik).toHaveBeenCalled();
      expect(repository.finishJobLog).toHaveBeenCalledWith(jobId, 'success');
    });
  });

  describe('Aggregation (refresh materialized view) Logic', () => {
    describe('aggregateGuestData', () => {
      it('should refresh mv for Gender, Agama, Slta (Summed), and Domisili correctly', async () => {
        mockEtlRepository.startJobLog.mockResolvedValue('job-agg-guest');

        await service.aggregateGuestData('manual');

        // Assert Gender Refreshed
        expect(repository.refreshAggregatedGenderData).toHaveBeenCalled();

        // Assert Agama Refreshed
        expect(repository.refreshAggregatedAgamaData).toHaveBeenCalled();

        // Assert SLTA Refreshed
        expect(repository.refreshAggregatedSltaData).toHaveBeenCalled();

        // Assert Domisili Refreshed
        expect(repository.refreshAggregatedDomisiliData).toHaveBeenCalled();

        // Assert Jalur / Tipe Tes Masuk Refreshed
        expect(repository.refreshAggregatedJalurDaftarData).toHaveBeenCalled();
      });
    });

    describe('aggregateKemahasiswaanData', () => {
      it('should refresh mv for internal data (granular) correctly', async () => {
        mockEtlRepository.startJobLog.mockResolvedValue('job-agg-mhs');

        await service.aggregateKemahasiswaanData('cron');

        // Assert Gender Refreshed
        expect(repository.refreshAggregatedGenderData).toHaveBeenCalled();

        // Assert Agama Refreshed
        expect(repository.refreshAggregatedAgamaData).toHaveBeenCalled();

        // Assert SLTA Refreshed
        expect(repository.refreshAggregatedSltaData).toHaveBeenCalled();

        // Assert Jumlah Mahasiswa Refreshed
        expect(repository.refreshAggregatedJumlahMhsData).toHaveBeenCalled();
      });
    });

    describe('aggregateAkademikData', () => {
      it('should refresh mv for akademik data correctly', async () => {
        mockEtlRepository.startJobLog.mockResolvedValue('job-agg-akd');

        await service.aggregateAkademikData('manual');

        // Assert Jalur / Tipe Tes Masuk Refreshed
        expect(repository.refreshAggregatedJalurDaftarData).toHaveBeenCalled();
      });
    });
  });
});
