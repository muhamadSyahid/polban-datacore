import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { DATAHUB_ENDPOINTS } from '../../constants';
import { DataHubMahasiswaDto } from './dto/datahub-mahasiswa.dto';
import { DataHubAkademikDto } from './dto/datahub-akademik.dto';
import { DataHubDosenDto } from './dto/datahub-dosen.dto';

@Injectable()
export class DataHubService {
  private readonly logger = new Logger(DataHubService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('DATAHUB_URL');
  }

  async getMahasiswaData(updatedSince?: Date): Promise<DataHubMahasiswaDto[]> {
    const url = `${this.baseUrl}${DATAHUB_ENDPOINTS.MAHASISWA}`;
    const params = updatedSince
      ? { updated_since: updatedSince.toISOString() }
      : {};

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { params }),
      );

      const rawData = response.data?.data || [];

      // @ts-expect-error [class-transformer type inference limitation: plainToInstance does not infer array types correctly]
      return plainToInstance(DataHubMahasiswaDto, rawData, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      const errorMsg = error?.message || String(error);
      this.logger.error(`Failed to fetch mahasiswa data from ${url}`, errorMsg);
      throw error;
    }
  }

  // TODO: Implement getAkademikData
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAkademikData(updatedSince?: Date): Promise<DataHubAkademikDto[]> {
    return [];
  }

  // TODO: Implement getDosenData
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getDosenData(updatedSince?: Date): Promise<DataHubDosenDto[]> {
    return [];
  }
}
