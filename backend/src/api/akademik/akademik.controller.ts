import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AkademikService } from './akademik.service';
import { AkademikTotalArrayDto } from './dto/akademik-total-array.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants/roles.constants';
import { Roles } from '../../common/decorators/roles.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('v1/akademik')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DATACORE_ADMIN, UserRole.DATAVIEW_INTERNAL)
@ApiTags('Akademik')
export class AkademikController {
  constructor(private readonly akademikService: AkademikService) {}

  @Get('tipe-tes-masuk')
  async getTipeTesMasuk(
    @Query('angkatan') angkatan?: number,
    @Query('prodi') prodi?: string,
    @Query('kelas') kelas?: string,
  ): Promise<AkademikTotalArrayDto> {
    return this.akademikService.getTipeTesMasukData(angkatan, prodi, kelas);
  }
}
