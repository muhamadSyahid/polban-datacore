import { Expose } from 'class-transformer';
import { KemahasiswaanTotalItemDto } from './kemahasiswaan-total-array.dto';

export class AggregatedDataDto {
  @Expose()
  data: KemahasiswaanTotalItemDto[];
}
