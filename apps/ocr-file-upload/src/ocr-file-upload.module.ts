import { Module } from '@nestjs/common';
import { OcrFileUploadController } from './ocr-file-upload.controller';
import { OcrFileUploadService } from './ocr-file-upload.service';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [DatabaseModule],
  controllers: [OcrFileUploadController],
  providers: [OcrFileUploadService],
})
export class OcrFileUploadModule {}
