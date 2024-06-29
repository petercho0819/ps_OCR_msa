import { Module } from '@nestjs/common';
import { OcrFileUploadController } from './ocr-file-upload.controller';
import { OcrFileUploadService } from './ocr-file-upload.service';

@Module({
  imports: [],
  controllers: [OcrFileUploadController],
  providers: [OcrFileUploadService],
})
export class OcrFileUploadModule {}
