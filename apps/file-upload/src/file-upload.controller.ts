import { Controller, Get } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Controller()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get()
  getHello(): string {
    return this.fileUploadService.getHello();
  }
}
