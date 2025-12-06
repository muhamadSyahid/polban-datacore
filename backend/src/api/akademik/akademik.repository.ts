import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  MvAkdDistribusiNilaiResultDto,
  MvAkdTrenIpRataRataResultDto,
  MvAkdTrenIpTertinggiResultDto,
  MvMhsJalurDaftarResultDto,
} from '../../common/dto/mv-result.dto';

@Injectable()
export class AkademikRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getAggregatedJalurDaftarData(): Promise<MvMhsJalurDaftarResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaJalurDaftar);
  }

  async getAggregatedDistribusiNilaiData(): Promise<
    MvAkdDistribusiNilaiResultDto[]
  > {
    return await this.db.select().from(schema.mvAkademikDistribusiNilai);
  }

  async getAggregatedTrenIpRataRataData(): Promise<
    MvAkdTrenIpRataRataResultDto[]
  > {
    return await this.db.select().from(schema.mvAkademikTrenIpRataRata);
  }

  async getAggregatedTrenIpTertinggiData(): Promise<
    MvAkdTrenIpTertinggiResultDto[]
  > {
    return await this.db.select().from(schema.mvAkademikTrenIpTertinggi);
  }
}
