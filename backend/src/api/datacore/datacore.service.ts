import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EtlRepository } from '../../etl/etl.repository';
import { ALLOWED_MV_NAMES, QUEUE_CONSTANTS } from '../../constants';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JobHistoryListDto } from './dto/job-history.dto';

@Injectable()
export class DataCoreService {
  constructor(
    private readonly etlRepository: EtlRepository,
    @InjectQueue(QUEUE_CONSTANTS.ETL_QUEUE) private etlQueue: Queue,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      lastJob,
      totalMhs,
      totalDosen,
      totalAkademikNilai,
      totalAkademikIp,
      jobCounts,
    ] = await Promise.all([
      this.etlRepository.getLastMainJobRun(),
      this.etlRepository.getTotalFactMahasiswa(),
      this.etlRepository.getTotalFactDosen(),
      this.etlRepository.getTotalFactAkademikNilai(),
      this.etlRepository.getTotalFactAkademikIp(),
      this.etlQueue.getJobCounts('active', 'waiting', 'failed'),
    ]);

    return {
      lastSync: {
        status: lastJob?.status || 'never',
        finishedAt: lastJob?.endTime || null,
        duration: this.calculateDuration(lastJob?.startTime, lastJob?.endTime),
      },
      queue: {
        active: jobCounts.active,
        waiting: jobCounts.waiting,
        failed: jobCounts.failed,
      },
      data: {
        totalMahasiswa: totalMhs,
        totalDosen: totalDosen,
        totalDataAkademikNilai: totalAkademikNilai,
        totalDataAkademikIp: totalAkademikIp,
      },
    };
  }

  async getJobHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<JobHistoryListDto> {
    const offset = (page - 1) * limit;
    const data = await this.etlRepository.getJobLogs(limit, offset);
    const allJobCount = await this.etlRepository.getJobLogsCount();

    const mappedData = data.map((log) => ({
      id: log.id,
      jobName: log.jobName,
      status: log.status,
      triggeredBy: log.triggeredBy,
      startTime: log.startTime,
      endTime: log.endTime,
      duration: this.calculateDuration(log.startTime, log.endTime),
      logMessage: log.logMessage,
    }));

    return {
      data: mappedData,
      meta: {
        total: data.length,
        page,
        perPage: limit,
        lastPage: Math.ceil(allJobCount / limit),
      },
    };
  }

  async getJobDetail(id: string) {
    return { data: await this.etlRepository.getJobLogById(id) };
  }

  async getInspectorMvList() {
    return { data: ALLOWED_MV_NAMES };
  }

  async getInspectorMvData(
    mvName: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    if (!ALLOWED_MV_NAMES.includes(mvName)) {
      throw new BadRequestException(
        `Materialized View '${mvName}' is not accessible or does not exist.`,
      );
    }

    const { data, total } =
      await this.etlRepository.getMaterializedViewDataPaged(
        mvName,
        page,
        limit,
        search,
      );

    return {
      data,
      meta: {
        total,
        page,
        perPage: limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  private calculateDuration(start: Date, end: Date | null): string {
    if (!start || !end) return '-';
    const diffMs = end.getTime() - start.getTime();

    if (diffMs < 60000) {
      return `${(diffMs / 1000).toFixed(1)}s`;
    }
    const minutes = Math.floor(diffMs / 60000);
    const seconds = ((diffMs % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}
