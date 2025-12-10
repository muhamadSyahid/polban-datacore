import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, asc } from 'drizzle-orm';
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

  async getAggregatedJalurDaftarData(
    angkatan?: number,
  ): Promise<MvMhsJalurDaftarResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvMahasiswaJalurDaftar.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvMahasiswaJalurDaftar)
      .where(and(...conditions));
  }

  async getAggregatedDistribusiNilaiData(
    angkatan?: number,
  ): Promise<MvAkdDistribusiNilaiResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvAkademikDistribusiNilai.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvAkademikDistribusiNilai)
      .where(and(...conditions))
      .orderBy(asc(schema.mvAkademikDistribusiNilai.nilaiHuruf));
  }

  async getAggregatedTrenIpRataRataData(
    angkatan?: number,
  ): Promise<MvAkdTrenIpRataRataResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvAkademikTrenIpRataRata.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvAkademikTrenIpRataRata)
      .where(and(...conditions))
      .orderBy(asc(schema.mvAkademikTrenIpRataRata.semesterUrut));
  }

  async getAggregatedTrenIpTertinggiData(
    angkatan?: number,
    semester?: number,
  ): Promise<MvAkdTrenIpTertinggiResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvAkademikTrenIpTertinggi.angkatan, angkatan));
    } else if (semester) {
      conditions.push(
        eq(schema.mvAkademikTrenIpTertinggi.semesterUrut, semester),
      );
    }

    return await this.db
      .select()
      .from(schema.mvAkademikTrenIpTertinggi)
      .where(and(...conditions))
      .orderBy(
        asc(schema.mvAkademikTrenIpTertinggi.semesterUrut),
        asc(schema.mvAkademikTrenIpTertinggi.angkatan),
      );
  }
}
