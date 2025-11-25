import { Test, TestingModule } from '@nestjs/testing';
import { JobsProcessor } from './jobs.processor';
import { EtlService } from '../etl/etl.service';
import { JOB_NAMES } from '../constants';
import { Job } from 'bullmq';

describe('JobsProcessor', () => {
  let processor: JobsProcessor;
  let etlService: EtlService;

  const mockEtlService = {
    runFullSync: jest.fn(),
    syncMahasiswa: jest.fn(),
    syncDosen: jest.fn(),
    syncAkademik: jest.fn(),
    aggregateGuestData: jest.fn(),
    aggregateKemahasiswaanData: jest.fn(),
    aggregateAkademikData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsProcessor,
        { provide: EtlService, useValue: mockEtlService },
      ],
    }).compile();

    processor = module.get<JobsProcessor>(JobsProcessor);
    etlService = module.get<EtlService>(EtlService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should route FULL_SYNC_AND_AGGREGATE correctly', async () => {
      const job = {
        id: '1',
        name: 'test',
        data: {
          jobName: JOB_NAMES.FULL_SYNC_AND_AGGREGATE,
          triggeredBy: 'manual',
        },
      } as Job;
      await processor.process(job);
      expect(etlService.runFullSync).toHaveBeenCalledWith('manual');
    });

    it('should route SYNC_MAHASISWA correctly', async () => {
      const job = {
        id: '2',
        name: 'test',
        data: { jobName: JOB_NAMES.SYNC_MAHASISWA, triggeredBy: 'cron' },
      } as Job;
      await processor.process(job);
      expect(etlService.syncMahasiswa).toHaveBeenCalledWith('cron');
    });

    it('should route SYNC_DOSEN correctly', async () => {
      const job = {
        id: '3',
        name: 'test',
        data: { jobName: JOB_NAMES.SYNC_DOSEN, triggeredBy: 'cron' },
      } as Job;
      await processor.process(job);
      expect(etlService.syncDosen).toHaveBeenCalledWith('cron');
    });

    it('should route SYNC_AKADEMIK correctly', async () => {
      const job = {
        id: '4',
        name: 'test',
        data: { jobName: JOB_NAMES.SYNC_AKADEMIK, triggeredBy: 'cron' },
      } as Job;
      await processor.process(job);
      expect(etlService.syncAkademik).toHaveBeenCalledWith('cron');
    });

    it('should route AGGREGATE_GUEST_DATA correctly', async () => {
      const job = {
        id: '5',
        name: 'test',
        data: {
          jobName: JOB_NAMES.AGGREGATE_GUEST_DATA,
          triggeredBy: 'manual',
        },
      } as Job;
      await processor.process(job);
      expect(etlService.aggregateGuestData).toHaveBeenCalledWith('manual');
    });

    it('should route AGGREGATE_KEMAHASISWAAN_DATA correctly', async () => {
      const job = {
        id: '6',
        name: 'test',
        data: {
          jobName: JOB_NAMES.AGGREGATE_KEMAHASISWAAN_DATA,
          triggeredBy: 'manual',
        },
      } as Job;
      await processor.process(job);
      expect(etlService.aggregateKemahasiswaanData).toHaveBeenCalledWith(
        'manual',
      );
    });

    it('should route AGGREGATE_AKADEMIK_DATA correctly', async () => {
      const job = {
        id: '7',
        name: 'test',
        data: {
          jobName: JOB_NAMES.AGGREGATE_AKADEMIK_DATA,
          triggeredBy: 'manual',
        },
      } as Job;
      await processor.process(job);
      expect(etlService.aggregateAkademikData).toHaveBeenCalledWith('manual');
    });

    it('should handle unknown job name gracefully', async () => {
      const job = {
        id: '99',
        name: 'test',
        data: { jobName: 'UNKNOWN_JOB', triggeredBy: 'manual' },
      } as Job;

      // Should not throw
      await expect(processor.process(job)).resolves.not.toThrow();

      // Should not call any service
      expect(etlService.runFullSync).not.toHaveBeenCalled();
      expect(etlService.syncMahasiswa).not.toHaveBeenCalled();
    });

    it('should throw error if service fails', async () => {
      const job = {
        id: 'err',
        name: 'test',
        data: { jobName: JOB_NAMES.SYNC_MAHASISWA, triggeredBy: 'manual' },
      } as Job;
      mockEtlService.syncMahasiswa.mockRejectedValue(
        new Error('Service Failed'),
      );

      await expect(processor.process(job)).rejects.toThrow('Service Failed');
    });
  });
});
