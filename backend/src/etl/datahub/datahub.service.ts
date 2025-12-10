import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { DATAHUB_ENDPOINTS } from '../../constants';
import { DataHubMahasiswaDto } from './dto/datahub-mahasiswa.dto';
import { DataHubAkademikDto } from './dto/datahub-akademik.dto';
import { DataHubDosenDto } from './dto/datahub-dosen.dto';

/* eslint-disable @typescript-eslint/no-unused-vars */

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

  async getMahasiswaData(
    token: string,
    updatedSince?: Date,
  ): Promise<DataHubMahasiswaDto[]> {
    const url = `${this.baseUrl}${DATAHUB_ENDPOINTS.MAHASISWA}`;
    const params = updatedSince
      ? { updated_since: updatedSince.toISOString() }
      : {};

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
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
  async getAkademikData(
    token: string,
    updatedSince?: Date,
  ): Promise<DataHubAkademikDto[]> {
    const url = `${this.baseUrl}${DATAHUB_ENDPOINTS.AKADEMIK}`;
    const params = updatedSince
      ? { updated_since: updatedSince.toISOString() }
      : {};

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const rawData = response.data?.data || [];

      // @ts-expect-error [class-transformer type inference limitation: plainToInstance does not infer array types correctly]
      return plainToInstance(DataHubAkademikDto, rawData, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      const errorMsg = error?.message || String(error);
      this.logger.error(`Failed to fetch akademik data from ${url}`, errorMsg);
      throw error;
    }
  }

  // TODO: Implement getDosenData
  async getDosenData(
    token: string,
    updatedSince?: Date,
  ): Promise<DataHubDosenDto[]> {
    return [];
  }
}
