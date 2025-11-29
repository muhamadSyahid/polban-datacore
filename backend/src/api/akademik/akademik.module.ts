import { Module } from '@nestjs/common';
import { AkademikService } from './akademik.service';
import { AkademikController } from './akademik.controller';
import { AkademikRepository } from './akademik.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AkademikController],
  providers: [AkademikService, AkademikRepository],
})
export class AkademikModule {}
