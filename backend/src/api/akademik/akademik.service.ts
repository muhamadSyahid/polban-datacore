import { Injectable } from '@nestjs/common';
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
    const result =
      await this.akademikRepository.getAggregatedJalurDaftarData(angkatan);

    // Filter Prodi/Kelas masih di Service (karena belum ada di MV)
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
    const rawData =
      await this.akademikRepository.getAggregatedDistribusiNilaiData(angkatan);

    // if (prodi) {
    //   const slug = prodi.toLowerCase().replace(/\s+/g, '_');
    //   rawData = rawData
    //     .filter((item) => {
    //       const itemSlug = item.prodi?.toLowerCase().replace(/\s+/g, '_');
    //       return itemSlug == slug;
    //     })
    //     .map((item) => ({ ...item, prodi: undefined }));
    // }

    // <Mata Kuliah, Indeks Nilai>
    const groupedByMk = new Map<string, any>();

    rawData.forEach((row) => {
      if (!groupedByMk.has(row.kodeMk)) {
        groupedByMk.set(row.kodeMk, {
          mata_kuliah: row.namaMk,
          indeks_nilai: [],
        });
      }
      const entry = groupedByMk.get(row.kodeMk);
      entry.indeks_nilai.push({
        indeks: row.nilaiHuruf,
        total: row.total,
      });
    });

    const finalData = Array.from(groupedByMk.values());

    return { angkatan: angkatan || 'All', prodi, data: finalData };
  }

  async getTrenIpRataRataData(
    angkatan?: number,
  ): Promise<AkademikTrenIpRataRataDto> {
    const rawData =
      await this.akademikRepository.getAggregatedTrenIpRataRataData(angkatan);

    const mappedData = rawData.map((item) => ({
      semester: item.semesterUrut,
      ip: Number(item.ipRataRata.toFixed(2)),
    }));

    return { angkatan: angkatan || 'All', data: mappedData };
  }

  async getTrenIpTertinggiData(
    semester?: number,
    angkatan?: number,
  ): Promise<AkademikTrenIpTertinggiDto> {
    const rawData =
      await this.akademikRepository.getAggregatedTrenIpTertinggiData(
        angkatan,
        semester,
      );

    let mappedData: (SemesterIpDto | AngkatanIpDto)[] = [];

    // Jika filter Semester Tampilkan per Angkatan
    if (semester && !angkatan) {
      mappedData = rawData.map((item) => ({
        angkatan: String(item.angkatan),
        ip: item.ipTertinggi,
      }));
    }
    // Tampilkan per Semester
    else {
      mappedData = rawData.map((item) => ({
        semester: item.semesterUrut,
        ip: item.ipTertinggi,
      }));
    }

    return { angkatan, semester, data: mappedData };
  }
}
