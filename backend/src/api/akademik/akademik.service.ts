import { Injectable, NotImplementedException } from '@nestjs/common';
import { AkademikRepository } from './akademik.repository';
import { AkademikTotalArrayDto } from './dto/akademik-total-array.dto';
import { AkademikDistribusiNilaiDto } from './dto/akademik-distribusi-nilai.dto';
import {
  AkademikTrenIpRataRataDto,
  AkademikTrenIpTertinggiDto,
  AngkatanIpDto,
  SemesterIpDto,
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
    let result =
      await this.akademikRepository.getAggregatedDistribusiNilaiData();

    if (angkatan) {
      result = result
        .filter((item) => item.angkatan == angkatan);
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

    let data = result.reduce<Record<string, MataKuliahNilaiDto>>((acc,item) => {
      const key = item.kodeMk;
      if(!acc[key]) {
        acc[key] = {
          mataKuliah: item.namaMk,
          indeksNilai: [],
        };
      }
      acc[key].indeksNilai.push({
        indeks: item.nilaiHuruf,
        total: item.total
      });
      return acc;
    },
    {},
  );

    return { angkatan, prodi, data: Object.values(data)};
  }

  async getTrenIpRataRataData(
    angkatan?: number,
  ): Promise<AkademikTrenIpRataRataDto> {
    let raw = await this.akademikRepository.getAggregatedTrenIpRataRataData();
    let filtered = raw;
    if (angkatan) {
      filtered = raw.filter((item) => item.angkatan == angkatan);
    }
    let data: SemesterIpDto[] = filtered.map((item) => ({
      semester: item.semesterUrut,
      ip: item.ipRataRata,
    }));

    return {
      angkatan, data};
  }

  // Mengambil data tren IP tertinggi.
  // Jika parameter 'semester' diberikan, akan mengembalikan IP tertinggi per angkatan untuk semester tsb.
  // Jika tidak (parameter 'angkatan' diberikan), akan mengembalikan IP tertinggi per semester untuk angkatan tsb.
  async getTrenIpTertinggiData(
    semester?: number,
    angkatan?: number,
  ): Promise<AkademikTrenIpTertinggiDto> {
    let result = await this.akademikRepository.getAggregatedTrenIpTertinggiData();
    let data;
    if (angkatan) {
      result = result.filter((item) => item.angkatan == angkatan);
      let dataakademik: AkademikIpDto[] = result.map((item) => ({
      angkatan: angkatan ? item.angkatan: undefined,
      ip: item.ipRataRata,
      }));
      data = dataakademik;
    }

    // if (semester) {
    //   result = result.filter((item) => item.semester == semester);
    //   let datasemester: SemesterIpDto[] = result.map((item) => ({
    //   angkatan: angkatan ? item.angkatan : undefined,
    //   ip: item.ipRataRata,
    //   }));
    // }

    return { angkatan, semester, data};
  }
}
