import { Injectable, NotImplementedException } from '@nestjs/common';
import { AkademikRepository } from './akademik.repository';
import { AkademikTotalArrayDto } from './dto/akademik-total-array.dto';

@Injectable()
export class AkademikService {
  constructor(private readonly akademikRepository: AkademikRepository) {}

  async getTipeTesMasukData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<AkademikTotalArrayDto> {
    let result = await this.akademikRepository.getAggregatedJalurDaftarData();

    if (angkatan) {
      result = result
        .filter((item) => item.angkatan == angkatan)
        .map((item) => ({ ...item, angkatan: undefined }));
    }
    if (prodi) {
      // const slug = prodi.toLowerCase().replace(/\s+/g, '_');
      // result = result
      //   .filter((item) => {
      //     const itemSlug = item.prodi?.toLowerCase().replace(/\s+/g, '_');
      //     return itemSlug == slug;
      //   })
      //   .map((item) => ({ ...item, prodi: undefined }));
    }
    if (kelas) {
      // const slug = kelas.toLowerCase().replace(/\s+/g, '_');
      // result = result
      //   .filter((item) => {
      //     const itemSlug = item.kelas?.toLowerCase().replace(/\s+/g, '_');
      //     return itemSlug == slug;
      //   })
      //   .map((item) => ({ ...item, kelas: undefined }));
    }

    return { angkatan, prodi, kelas, data: result };
  }

  async getDistribusiNilaiData(
    angkatan?: number,
    prodi?: string,
  ): Promise<AkademikTotalArrayDto> {
    let result =
      await this.akademikRepository.getAggregatedDistribusiNilaiData();

    if (angkatan) {
      result = result
        .filter((item) => item.angkatan == angkatan)
        .map((item) => ({ ...item, angkatan: undefined }));
    }
    if (prodi) {
      // const slug = prodi.toLowerCase().replace(/\s+/g, '_');
      // result = result
      //   .filter((item) => {
      //     const itemSlug = item.prodi?.toLowerCase().replace(/\s+/g, '_');
      //     return itemSlug == slug;
      //   })
      //   .map((item) => ({ ...item, prodi: undefined }));
    }

    return { angkatan, prodi, data: result };
  }

  async getTrenIpRataRataData(
    angkatan?: number,
  ): Promise<AkademikTotalArrayDto> {
    let result =
      await this.akademikRepository.getAggregatedTrenIpRataRataData();

    if (angkatan) {
      result = result
        .filter((item) => item.angkatan == angkatan)
        .map((item) => ({ ...item, angkatan: undefined }));
    }
    return { angkatan, data: result };
  }

  async getTrenIpTertinggiData(
    semester?: number,
    angkatan?: number,
  ): Promise<AkademikTotalArrayDto> {
    throw new NotImplementedException();

    return { angkatan, semester, data: [] };
  }
}
