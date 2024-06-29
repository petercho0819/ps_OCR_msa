import { Controller, Get } from '@nestjs/common';
import { OcrFileUploadService } from './ocr-file-upload.service';

@Controller()
export class OcrFileUploadController {
  constructor(private readonly ocrFileUploadService: OcrFileUploadService) {}

  @Get('sdsd')
  getHello(): string {
    return this.ocrFileUploadService.getHello();
  }
}
