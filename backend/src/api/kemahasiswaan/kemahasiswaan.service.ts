import { Injectable } from '@nestjs/common';
import { KemahasiswaanRepository } from './kemahasiswaan.repository';
import { KemahasiswaanTotalArrayDto } from './dto/kemahasiswaan-total-array.dto';

@Injectable()
export class KemahasiswaanService {
  constructor(
    private readonly kemahasiswaanRepository: KemahasiswaanRepository,
  ) {}

  async getJumlahMahasiswaData(
    angkatan?: number,
    prodi?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    let result =
      await this.kemahasiswaanRepository.getAggregatedJumlahMahasiswaData();

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

  async getGenderData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    let result = await this.kemahasiswaanRepository.getAggregatedGenderData();

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

  async getJenisSltaData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    let result = await this.kemahasiswaanRepository.getAggregatedSltaData();

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

  async getAgamaData(
    angkatan?: number,
    prodi?: string,
    kelas?: string,
  ): Promise<KemahasiswaanTotalArrayDto> {
    let result = await this.kemahasiswaanRepository.getAggregatedAgamaData();

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
}
