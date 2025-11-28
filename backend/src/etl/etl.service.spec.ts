import { Test, TestingModule } from '@nestjs/testing';
import {
  AKADEMIK_CACHE_KEYS,
  GUEST_CACHE_KEYS,
  JOB_NAMES,
  KEMAHASISWAAN_CACHE_KEYS,
} from '../constants';
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
    aggregateGenderData: jest.fn(),
    aggregateAgamaData: jest.fn(),
    aggregateSltaData: jest.fn(),
    aggregateDomisiliData: jest.fn(),
    aggregateJumlahMahasiswaPerAngkatan: jest.fn(),
    aggregateJalurDaftarData: jest.fn(),
    saveAggregateResult: jest.fn(),
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

      // Mock empty arrays for aggregations
      mockEtlRepository.aggregateGenderData.mockResolvedValue([]);
      mockEtlRepository.aggregateAgamaData.mockResolvedValue([]);
      mockEtlRepository.aggregateSltaData.mockResolvedValue([]);
      mockEtlRepository.aggregateDomisiliData.mockResolvedValue([]);
      mockEtlRepository.aggregateJumlahMahasiswaPerAngkatan.mockResolvedValue(
        [],
      );
      mockEtlRepository.aggregateJalurDaftarData.mockResolvedValue([]);

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
      expect(repository.aggregateGenderData).toHaveBeenCalled();
      expect(repository.aggregateAgamaData).toHaveBeenCalled();
      expect(repository.aggregateSltaData).toHaveBeenCalled();
      expect(repository.aggregateDomisiliData).toHaveBeenCalled();
      expect(repository.aggregateJumlahMahasiswaPerAngkatan).toHaveBeenCalled();
      expect(repository.aggregateJalurDaftarData).toHaveBeenCalled();
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

  describe('Aggregation Logic', () => {
    describe('aggregateGuestData', () => {
      it('should aggregate Gender, Agama, Slta (Summed), and Domisili correctly', async () => {
        mockEtlRepository.startJobLog.mockResolvedValue('job-agg-guest');

        // Mock Raw Data from Repository
        mockEtlRepository.aggregateGenderData.mockResolvedValue([
          { jenis: 'L', total: 10, angkatan: 2024 },
          { jenis: 'L', total: 5, angkatan: 2023 },
        ]);
        mockEtlRepository.aggregateAgamaData.mockResolvedValue([
          { agama: 'Islam', total: 100, angkatan: 2024 },
        ]);
        mockEtlRepository.aggregateSltaData.mockResolvedValue([
          { jenis: 'SMA', total: 50, angkatan: 2024 },
        ]);
        mockEtlRepository.aggregateDomisiliData.mockResolvedValue([
          {
            namaProvinsi: 'Jabar',
            namaWilayah: 'Bandung',
            total: 10,
            provinsiLat: 1,
            provinsiLng: 1,
          },
        ]);
        mockEtlRepository.aggregateJalurDaftarData.mockResolvedValue([
          {
            angkatan: 2024,
            jalur: 'SNBT',
            total: 100,
          },
          {
            angkatan: 2023,
            jalur: 'SNBT',
            total: 100,
          },
          {
            angkatan: 2024,
            jalur: 'SMBM',
            total: 100,
          },
          {
            angkatan: 2025,
            jalur: 'ADIK',
            total: 10,
          },
          {
            angkatan: 2025,
            jalur: 'SNBP',
            total: 20,
          },
        ]);

        await service.aggregateGuestData('manual');

        // Assert Gender Summed
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          GUEST_CACHE_KEYS.MAHASISWA_GENDER,
          expect.arrayContaining([{ jenis: 'L', total: 15 }]),
        );

        // Assert Agama Summed
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          GUEST_CACHE_KEYS.MAHASISWA_AGAMA,
          expect.arrayContaining([{ agama: 'Islam', total: 100 }]),
        );

        // Assert SLTA Summed
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          GUEST_CACHE_KEYS.MAHASISWA_JENIS_SLTA,
          expect.arrayContaining([{ jenis: 'SMA', total: 50 }]),
        );

        // Assert Domisili All
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_ALL,
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({ provinsi: 'Jabar', total: 10 }),
            ]),
          }),
        );

        // Assert Domisili Per Provinsi (Snake Case Key)
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          `${GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_PROVINSI_PREFIX}jabar`,
          expect.objectContaining({
            provinsi: 'Jabar',
            data: expect.arrayContaining([
              expect.objectContaining({ kota: 'Bandung', total: 10 }),
            ]),
          }),
        );

        // Assert Jalur / Tipe Tes Masuk
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          GUEST_CACHE_KEYS.AKADEMIK_TIPE_TES_MASUK,
          expect.arrayContaining([
            expect.objectContaining({ tipe: 'SNBT', total: 200 }),
            expect.objectContaining({ tipe: 'SNBP', total: 20 }),
            expect.objectContaining({ tipe: 'SMBM', total: 100 }),
            expect.objectContaining({ tipe: 'ADIK', total: 10 }),
          ]),
        );
      });
    });

    describe('aggregateKemahasiswaanData', () => {
      it('should aggregate internal data (granular) correctly', async () => {
        mockEtlRepository.startJobLog.mockResolvedValue('job-agg-mhs');

        const rawGender = [{ jenis: 'L', total: 10, angkatan: 2024 }];
        const rawAgama = [{ agama: 'Islam', total: 50, angkatan: 2024 }];
        const rawSlta = [{ jenis: 'SMK', total: 20, angkatan: 2024 }];
        const rawJumlah = [{ angkatan: 2024, total: 100 }];

        mockEtlRepository.aggregateGenderData.mockResolvedValue(rawGender);
        mockEtlRepository.aggregateAgamaData.mockResolvedValue(rawAgama);
        mockEtlRepository.aggregateSltaData.mockResolvedValue(rawSlta);
        mockEtlRepository.aggregateJumlahMahasiswaPerAngkatan.mockResolvedValue(
          rawJumlah,
        );

        await service.aggregateKemahasiswaanData('cron');

        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          KEMAHASISWAAN_CACHE_KEYS.GENDER,
          rawGender,
        );
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          KEMAHASISWAAN_CACHE_KEYS.AGAMA,
          rawAgama,
        );
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          KEMAHASISWAAN_CACHE_KEYS.JENIS_SLTA,
          rawSlta,
        );
        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          KEMAHASISWAAN_CACHE_KEYS.JUMLAH_MAHASISWA,
          rawJumlah,
        );
      });
    });

    describe('aggregateAkademikData', () => {
      it('should aggregate akademik data correctly', async () => {
        mockEtlRepository.startJobLog.mockResolvedValue('job-agg-akd');

        const rawJalur = [{ jalur: 'SNBP', total: 100, angkatan: 2024 }];
        mockEtlRepository.aggregateJalurDaftarData.mockResolvedValue(rawJalur);

        await service.aggregateAkademikData('manual');

        expect(repository.saveAggregateResult).toHaveBeenCalledWith(
          AKADEMIK_CACHE_KEYS.TIPE_TES_MASUK,
          [{ angkatan: 2024, tipe: 'SNBP', total: 100 }], // Check mapping 'jalur' -> 'tipe'
        );
      });
    });
  });
});
