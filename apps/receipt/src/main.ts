import { NestFactory } from '@nestjs/core';
import { FileUploadModule } from './file-upload.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(FileUploadModule);
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
