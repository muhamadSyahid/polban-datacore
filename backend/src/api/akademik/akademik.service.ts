import { Injectable, NotImplementedException } from '@nestjs/common';
import { AkademikRepository } from './akademik.repository';
import { AkademikTotalArrayDto } from './dto/akademik-total-array.dto';
import { AkademikDistribusiNilaiDto } from './dto/akademik-distribusi-nilai.dto';
import {
  AkademikTrenIpRataRataDto,
  AkademikTrenIpTertinggiDto,
} from './dto/akademik-tren-ip.dto';

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
  ): Promise<AkademikDistribusiNilaiDto> {
    throw new NotImplementedException();

    return { angkatan, prodi, data: [] };
  }

  async getTrenIpRataRataData(
    angkatan?: number,
  ): Promise<AkademikTrenIpRataRataDto> {
    throw new NotImplementedException();

    return { angkatan, data: [] };
  }

  // Mengambil data tren IP tertinggi.
  // Jika parameter 'semester' diberikan, akan mengembalikan IP tertinggi per angkatan untuk semester tsb.
  // Jika tidak (parameter 'angkatan' diberikan), akan mengembalikan IP tertinggi per semester untuk angkatan tsb.
  async getTrenIpTertinggiData(
    semester?: number,
    angkatan?: number,
  ): Promise<AkademikTrenIpTertinggiDto> {
    throw new NotImplementedException();

    return { angkatan, semester, data: [] };
  }
}
