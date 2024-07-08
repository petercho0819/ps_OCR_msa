import { Body, Controller, Get, Post } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Controller()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  async createFileUpload(@Body() body) {
    return await this.fileUploadService.createFileUpload(body);
  }
}
