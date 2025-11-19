import { Controller, Get } from '@nestjs/common';
import { EtlService } from './etl.service';

@Controller('etl')
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Get('debug/fullSync')
  async debugFullSyncAndAggregate() {
    await this.etlService.runFullSync();
  }
}
