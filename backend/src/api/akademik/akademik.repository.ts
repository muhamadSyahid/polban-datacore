import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { MvMhsJalurDaftarResultDto } from 'src/common/dto/mv-result.dto';

@Injectable()
export class AkademikRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getAggregatedJalurDaftarData(): Promise<MvMhsJalurDaftarResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaJalurDaftar);
  }

  async getAggregatedDistribusiNilaiData(): Promise<
    { angkatan: number; total: number }[]
  > {
    throw new NotImplementedException();
  }

  async getAggregatedTrenIpRataRataData(): Promise<
    { angkatan: number; total: number }[]
  > {
    throw new NotImplementedException();
  }

  async getAggregatedTrenIpTertinggiData(): Promise<
    { angkatan: number; total: number }[]
  > {
    throw new NotImplementedException();
  }
}
