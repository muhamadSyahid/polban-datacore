import { Module } from '@nestjs/common';
import { KemahasiswaanService } from './kemahasiswaan.service';
import { KemahasiswaanController } from './kemahasiswaan.controller';
import { KemahasiswaanRepository } from './kemahasiswaan.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [KemahasiswaanController],
  providers: [KemahasiswaanService, KemahasiswaanRepository],
})
export class KemahasiswaanModule {}
