import { Expose } from 'class-transformer';
import { AkademikTotalItemDto } from './akademik-total-array.dto';

export class AggregatedDataDto {
  @Expose()
  data: AkademikTotalItemDto[];
}
