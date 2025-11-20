import { Expose } from 'class-transformer';
import { GuestTotalItemDto } from './guest-total-array.dto';
import { GuestDomisiliAllDto } from './guest-domisili-all.dto';
import { GuestDomisiliProvinsiDto } from './guest-domisili-provinsi.dto';

export class AggregatedDataDto {
  @Expose()
  data: GuestTotalItemDto[] | GuestDomisiliAllDto | GuestDomisiliProvinsiDto;
}
