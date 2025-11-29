import { Injectable, NotFoundException } from '@nestjs/common';
import { AkademikRepository } from './akademik.repository';
import { AKADEMIK_CACHE_KEYS } from '../../constants';
import { AkademikTotalArrayDto } from './dto/akademik-total-array.dto';
import { AkademikTotalItemDto } from './dto/akademik-total-array.dto';

@Injectable()
export class AkademikService {
  constructor(private readonly akademikRepository: AkademikRepository) {}

  private async getAndUnwrapCache(cacheKey: string) {
    const dataWrapper =
      await this.akademikRepository.getAggregatedData(cacheKey);

    if (!dataWrapper || !dataWrapper.data) {
      throw new NotFoundException(`Cache data not found for key: ${cacheKey}`);
    }

    return dataWrapper;
  }
  async getTipeTesMasukData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<AkademikTotalArrayDto> {
    const cacheKey = AKADEMIK_CACHE_KEYS.TIPE_TES_MASUK;

    const cache = await this.getAndUnwrapCache(cacheKey);

    let result = cache.data as AkademikTotalItemDto[];

    if (angkatan) {
      result = result.filter((item) => item.angkatan == angkatan);
    }
    if (prodi) {
      // const slug = prodi.toLowerCase().replace(/\s+/g, '_');
      // result = result.filter((item) => {
      //   const itemSlug = item.prodi?.toLowerCase().replace(/\s+/g, '_');
      //   return itemSlug == slug;
      // });
    }
    if (kelas) {
      // const slug = kelas.toLowerCase().replace(/\s+/g, '_');
      // result = result.filter((item) => {
      //   const itemSlug = item.kelas?.toLowerCase().replace(/\s+/g, '_');
      //   return itemSlug == slug;
      // });
    }

    return { angkatan, prodi, kelas, data: result };
  }
}
