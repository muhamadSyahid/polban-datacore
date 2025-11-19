import { Injectable, NotFoundException } from '@nestjs/common';
import { GuestRepository } from './guest.repository';
import { GUEST_CACHE_KEYS } from 'src/constants';
import { GuestDomisiliAllDto } from './dto/guest-domisili-all.dto';
import { GuestTotalArrayDto } from './dto/guest-total-array.dto';

@Injectable()
export class GuestService {
  constructor(private readonly guestRepository: GuestRepository) {}

  private async getAndUnwrapCache(cacheKey: string) {
    const dataWrapper = await this.guestRepository.getAggregatedData(cacheKey);

    if (!dataWrapper || !dataWrapper.data) {
      throw new NotFoundException(`Cache data not found for key: ${cacheKey}`);
    }

    // Mengurai data dari { data: { data: [...] } } yang dibungkus oleh ETL Repository
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

  async getDomisiliAllData(): Promise<GuestDomisiliAllDto> {
    return this.getAndUnwrapCache(
      GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_ALL,
    ) as Promise<GuestDomisiliAllDto>;
  }

  async getDomisiliByProvinsiData(provinsi: string) {
    // Membuat cache key dinamis
    const keySlug = provinsi.toLowerCase().replace(/\s+/g, '_');
    const cacheKey = `${GUEST_CACHE_KEYS.MAHASISWA_DOMISILI_PROVINSI_PREFIX}${keySlug}`;

    const data = await this.getAndUnwrapCache(cacheKey);

    // Perlu di-unwrap dua kali jika service ETL menyimpan {provinsi: ..., data: [...]}
    // dan repository membungkusnya lagi.
    if (data.data) {
      return data.data; // Jika outputnya { data: { provinsi: ... } }
    }
    return data;
  }
}
