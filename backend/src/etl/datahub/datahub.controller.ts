import { Controller, Get, Query } from '@nestjs/common';
import { DataHubService } from './datahub.service';

@Controller('etl/datahub')
export class DataHubController {
  constructor(private readonly dataHubService: DataHubService) {}

  @Get('debug/mahasiswa')
  async debugGetMahasiswa(@Query('since') since?: string) {
    const date = since ? new Date(since) : undefined;
    return this.dataHubService.getMahasiswaData(date);
  }
}
