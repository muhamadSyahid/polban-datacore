import { Injectable, NotFoundException } from '@nestjs/common';
import { GuestRepository } from './guest.repository';
import { GUEST_CACHE_KEYS } from '../../constants';
import { GuestDomisiliAllDto } from './dto/guest-domisili-all.dto';
import { GuestDomisiliProvinsiDto } from './dto/guest-domisili-provinsi.dto';
import { GuestTotalArrayDto } from './dto/guest-total-array.dto';

@Injectable()
export class GuestService {
  constructor(private readonly guestRepository: GuestRepository) {}

  private async getAndUnwrapCache(cacheKey: string) {
    const dataWrapper = await this.guestRepository.getAggregatedData(cacheKey);

    if (!dataWrapper || !dataWrapper.data) {
      throw new NotFoundException(`Cache data not found for key: ${cacheKey}`);
    }

    return dataWrapper;
  }

  async getGenderData(): Promise<GuestTotalArrayDto> {
    return this.getAndUnwrapCache(
      GUEST_CACHE_KEYS.MAHASISWA_GENDER,
    ) as Promise<GuestTotalArrayDto>;
  }

  async getAgamaData(): Promise<GuestTotalArrayDto> {
    return this.getAndUnwrapCache(
      GUEST_CACHE_KEYS.MAHASISWA_AGAMA,
    ) as Promise<GuestTotalArrayDto>;
  }

  async getJenisSltaData(): Promise<GuestTotalArrayDto> {
    return this.getAndUnwrapCache(
      GUEST_CACHE_KEYS.MAHASISWA_JENIS_SLTA,
    ) as Promise<GuestTotalArrayDto>;
  }

  async getTipeTesMasukData(): Promise<GuestTotalArrayDto> {
    return this.getAndUnwrapCache(
      GUEST_CACHE_KEYS.AKADEMIK_TIPE_TES_MASUK,
    ) as Promise<GuestTotalArrayDto>;
  }

  async getDomisiliAllData(): Promise<GuestDomisiliAllDto> {
    const data = await this.getAndUnwrapCache(
      GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_ALL,
    );
    return data.data as GuestDomisiliAllDto;
  }

  async getDomisiliByProvinsiData(
    provinsi: string,
  ): Promise<GuestDomisiliProvinsiDto> {
    const keySlug = provinsi.toLowerCase().replace(/\s+/g, '_');
    const cacheKey = `${GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_PROVINSI_PREFIX}${keySlug}`;

    const data = await this.getAndUnwrapCache(cacheKey);

    return data.data as GuestDomisiliProvinsiDto;
  }
}
