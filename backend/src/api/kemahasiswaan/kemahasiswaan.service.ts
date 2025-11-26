import { Injectable, NotFoundException } from '@nestjs/common';
import { KemahasiswaanRepository } from './kemahasiswaan.repository';
import { KEMAHASISWAAN_CACHE_KEYS } from '../../constants';
import { KemahasiswaanTotalArrayDto } from './dto/kemahasiswaan-total-array.dto';
import { KemahasiswaanTotalItemDto } from './dto/kemahasiswaan-total-array.dto';

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

  async getJumlahMahasiswaData(
    angkatan?: number,
    prodi?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    const cacheKey = KEMAHASISWAAN_CACHE_KEYS.JUMLAH_MAHASISWA;

    const cache = await this.getAndUnwrapCache(cacheKey);

    let result = cache.data as KemahasiswaanTotalItemDto[];

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

    return { angkatan, prodi, data: result };
  }

  async getGenderData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    const cacheKey = KEMAHASISWAAN_CACHE_KEYS.GENDER;

    const cache = await this.getAndUnwrapCache(cacheKey);

    let result = cache.data as KemahasiswaanTotalItemDto[];

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

  async getJenisSltaData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    const cacheKey = KEMAHASISWAAN_CACHE_KEYS.JENIS_SLTA;

    const cache = await this.getAndUnwrapCache(cacheKey);

    let result = cache.data as KemahasiswaanTotalItemDto[];

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

  async getAgamaData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    const cacheKey = KEMAHASISWAAN_CACHE_KEYS.AGAMA;

    const cache = await this.getAndUnwrapCache(cacheKey);

    let result = cache.data as KemahasiswaanTotalItemDto[];

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
