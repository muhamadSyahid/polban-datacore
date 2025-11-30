import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import {
  MvMhsAgamaResultDto,
  MvMhsDomisiliKotaResultDto,
  MvMhsGenderResultDto,
  MvMhsJalurDaftarResultDto,
  MvMhsSltaResultDto,
} from '../../common/dto/mv-result.dto';

@Injectable()
export class GuestRepository {
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

  async getAggregatedDomisiliData(
    provinsi?: string,
  ): Promise<MvMhsDomisiliKotaResultDto[]> {
    if (provinsi) {
      return await this.db
        .select()
        .from(schema.mvMahasiswaDomisili)
        .where(
          sql`LOWER(${schema.mvMahasiswaDomisili.namaProvinsi}) = ${provinsi.toLowerCase()}`,
        );
    }

    return await this.db.select().from(schema.mvMahasiswaDomisili);
  }

  async getAggregatedJalurDaftarData(): Promise<MvMhsJalurDaftarResultDto[]> {
    return await this.db.select().from(schema.mvMahasiswaJalurDaftar);
  }
}
