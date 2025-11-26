import { Injectable, NotFoundException } from '@nestjs/common';
import { KemahasiswaanRepository } from './kemahasiswaan.repository';
import { KEMAHASISWAAN_CACHE_KEYS } from '../../constants';
import { KemahasiswaanTotalArrayDto } from './dto/kemahasiswaan-total-array.dto';

@Injectable()
export class KemahasiswaanService {
  constructor(
    private readonly kemahasiswaanRepository: KemahasiswaanRepository,
  ) {}

  private async getAndUnwrapCache(cacheKey: string) {
    const dataWrapper =
      await this.kemahasiswaanRepository.getAggregatedData(cacheKey);

    if (!dataWrapper || !dataWrapper.data) {
      throw new NotFoundException(`Cache data not found for key: ${cacheKey}`);
    }

    return dataWrapper;
  }

  async getGenderData(): Promise<KemahasiswaanTotalArrayDto> {
    return this.getAndUnwrapCache(
      KEMAHASISWAAN_CACHE_KEYS.GENDER,
    ) as Promise<KemahasiswaanTotalArrayDto>;
  }

  async getAgamaData(): Promise<KemahasiswaanTotalArrayDto> {
    return this.getAndUnwrapCache(
      KEMAHASISWAAN_CACHE_KEYS.AGAMA,
    ) as Promise<KemahasiswaanTotalArrayDto>;
  }

  async getJenisSltaData(): Promise<KemahasiswaanTotalArrayDto> {
    return this.getAndUnwrapCache(
      KEMAHASISWAAN_CACHE_KEYS.JENIS_SLTA,
    ) as Promise<KemahasiswaanTotalArrayDto>;
  }

  async getJumlahMahasiswaData(): Promise<KemahasiswaanTotalArrayDto> {
    return this.getAndUnwrapCache(
      KEMAHASISWAAN_CACHE_KEYS.JUMLAH_MAHASISWA,
    ) as Promise<KemahasiswaanTotalArrayDto>;
  }
}
