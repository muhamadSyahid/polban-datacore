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
    const result =
      await this.kemahasiswaanRepository.getAggregatedJumlahMahasiswaData(
        angkatan,
      );

    // Filter Prodi/Kelas masih di Service (Logic Future Proofing)
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
    const result =
      await this.kemahasiswaanRepository.getAggregatedGenderData(angkatan);

    // Filter Prodi/Kelas masih di Service
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
    const result =
      await this.kemahasiswaanRepository.getAggregatedSltaData(angkatan);

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
    const result =
      await this.kemahasiswaanRepository.getAggregatedAgamaData(angkatan);

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
