import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadOCRDTO } from './dto/UploadOCRDTO.dto';

@Controller('upload-image')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('ocrImage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Body() uploadOCRDto: UploadOCRDTO,
    @UploadedFile() { originalname, buffer, mimetype }: Express.Multer.File,
  ) {
    this.logger.verbose(`${FileUploadController.name} - uploadImage`);
    this.logger.log(`uploadOCRDto - ${JSON.stringify(uploadOCRDto)}`);
    return await this.fileUploadService.uploadImage(uploadOCRDto, {
      OCRName: originalname || '',
      OCRBuffer: buffer || Buffer.from(''),
      OCRMimetype: mimetype || '',
    });
  }
}
