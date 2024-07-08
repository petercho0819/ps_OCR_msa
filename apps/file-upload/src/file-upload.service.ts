import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  getHello(): string {
    return 'Hello World!';
  }
}
