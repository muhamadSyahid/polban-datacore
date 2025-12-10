import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
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

  async getAggregatedGenderData(
    angkatan?: number,
  ): Promise<MvMhsGenderResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvMahasiswaGender.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvMahasiswaGender)
      .where(and(...conditions))
      .orderBy(schema.mvMahasiswaGender.angkatan);
  }

  async getAggregatedAgamaData(
    angkatan?: number,
  ): Promise<MvMhsAgamaResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvMahasiswaAgama.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvMahasiswaAgama)
      .where(and(...conditions))
      .orderBy(schema.mvMahasiswaAgama.angkatan);
  }

  async getAggregatedSltaData(
    angkatan?: number,
  ): Promise<MvMhsSltaResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvMahasiswaSltaKategori.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvMahasiswaSltaKategori)
      .where(and(...conditions))
      .orderBy(schema.mvMahasiswaSltaKategori.angkatan);
  }

  async getAggregatedJumlahMahasiswaData(
    angkatan?: number,
  ): Promise<MvMhsTotalResultDto[]> {
    const conditions = [];
    if (angkatan) {
      conditions.push(eq(schema.mvMahasiswaTotal.angkatan, angkatan));
    }

    return await this.db
      .select()
      .from(schema.mvMahasiswaTotal)
      .where(and(...conditions))
      .orderBy(schema.mvMahasiswaTotal.angkatan);
  }
}
