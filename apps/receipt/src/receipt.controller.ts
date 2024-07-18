import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadOCRDTO } from './dto/UploadOCRDTO.dto';
import { CurrentUser, JwtAuthGuard, UserDTO } from '@app/common';

@Controller('receipt')
export class ReceiptController {
  private readonly logger = new Logger(ReceiptController.name);
  constructor(private readonly fileUploadService: ReceiptService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Body() uploadOCRDto: UploadOCRDTO,
    @UploadedFile() { originalname, buffer, mimetype }: Express.Multer.File,
  ) {
    this.logger.verbose(`${ReceiptController.name} - uploadImage`);
    this.logger.log(`uploadOCRDto - ${JSON.stringify(uploadOCRDto)}`);
    return await this.fileUploadService.uploadImage(uploadOCRDto, {
      OCRName: originalname || '',
      OCRBuffer: buffer || Buffer.from(''),
      OCRMimetype: mimetype || '',
    });
  }
}
