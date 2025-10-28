import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';

const envpath = join(process.cwd(), '.env')

async function bootstrap() {
  dotenv.config({ path: envpath });

  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
