import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  MvMhsGenderResultDto,
  MvMhsAgamaResultDto,
  MvMhsSltaResultDto,
  MvMhsTotalResultDto,
} from '../../common/dto/mv-result.dto';

@Injectable()
export class KemahasiswaanRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getAggregatedGenderData(): Promise<MvMhsGenderResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaGender);
  }

  async getAggregatedAgamaData(): Promise<MvMhsAgamaResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaAgama);
  }

  async getAggregatedSltaData(): Promise<MvMhsSltaResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaSltaKategori);
  }

  async getAggregatedJumlahMahasiswaData(): Promise<MvMhsTotalResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaTotal);
  }
}
