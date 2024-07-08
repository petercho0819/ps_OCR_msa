import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './schemas/file-upload.repository';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileUploadRepository: FileUploadRepository) {}

  async createFileUpload(request) {
    return await this.fileUploadRepository.createFileUpload(request);
  }
}
