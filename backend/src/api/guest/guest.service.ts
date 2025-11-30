import { Injectable } from '@nestjs/common';
import { GuestRepository } from './guest.repository';
import { GuestDomisiliAllDto } from './dto/guest-domisili-all.dto';
import { GuestDomisiliProvinsiDto } from './dto/guest-domisili-provinsi.dto';
import { GuestTotalArrayDto } from './dto/guest-total-array.dto';
import { DataTransformUtil } from '../../common/utils/data-transform.util';

@Injectable()
export class GuestService {
  constructor(private readonly guestRepository: GuestRepository) {}

  async getGenderData(): Promise<GuestTotalArrayDto> {
    const rawData = await this.guestRepository.getAggregatedGenderData();
    const summedData = DataTransformUtil.groupByAndSum(rawData, 'jenis');
    return { data: summedData } as GuestTotalArrayDto;
  }

  async getAgamaData(): Promise<GuestTotalArrayDto> {
    const rawData = await this.guestRepository.getAggregatedAgamaData();
    const summedData = DataTransformUtil.groupByAndSum(rawData, 'agama');
    return { data: summedData } as GuestTotalArrayDto;
  }

  async getJenisSltaData(): Promise<GuestTotalArrayDto> {
    const rawData = await this.guestRepository.getAggregatedSltaData();
    const summedData = DataTransformUtil.groupByAndSum(rawData, 'jenis');
    return { data: summedData } as GuestTotalArrayDto;
  }

  async getTipeTesMasukData(): Promise<GuestTotalArrayDto> {
    const rawData = await this.guestRepository.getAggregatedJalurDaftarData();
    const summedData = DataTransformUtil.groupByAndSum(rawData, 'tipe');

    const finalData = summedData.map((item) => ({
      jenis: item.tipe,
      total: item.total,
    }));

    return { data: finalData } as any as GuestTotalArrayDto;
  }

  async getDomisiliAllData(): Promise<GuestDomisiliAllDto> {
    const rawData = await this.guestRepository.getAggregatedDomisiliData();
    return DataTransformUtil.transformDomisiliForGuestAll(rawData);
  }

  async getDomisiliByProvinsiData(
    provinsi: string,
  ): Promise<GuestDomisiliProvinsiDto> {
    const rawData =
      await this.guestRepository.getAggregatedDomisiliData(provinsi);

    return DataTransformUtil.transformDomisiliForGuestProvinsi(
      rawData[0].namaProvinsi,
      rawData,
    );
  }
}
