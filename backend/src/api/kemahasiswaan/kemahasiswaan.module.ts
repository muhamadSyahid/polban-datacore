import { Module } from '@nestjs/common';
import { KemahasiswaanService } from './kemahasiswaan.service';
import { KemahasiswaanController } from './kemahasiswaan.controller';
import { KemahasiswaanRepository } from './kemahasiswaan.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KemahasiswaanController],
  providers: [KemahasiswaanService, KemahasiswaanRepository],
})
export class KemahasiswaanModule {}
