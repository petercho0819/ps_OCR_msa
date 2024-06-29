import { NestFactory } from '@nestjs/core';
import { OcrFileUploadModule } from './ocr-file-upload.module';

async function bootstrap() {
  const app = await NestFactory.create(OcrFileUploadModule);
  await app.listen(3000);
}
bootstrap();
