import { Module } from '@nestjs/common';
import { GuestModule } from './guest/guest.module';
import { AkademikModule } from './akademik/akademik.module';
import { KemahasiswaanModule } from './kemahasiswaan/kemahasiswaan.module';
import { DataCoreModule } from './datacore/datacore.module';

@Module({
  imports: [GuestModule, AkademikModule, KemahasiswaanModule, DataCoreModule],
  exports: [GuestModule, AkademikModule, KemahasiswaanModule, DataCoreModule],
})
export class ApiModule {}
