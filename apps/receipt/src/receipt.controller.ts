import {
  Body,
  Controller,
  Delete,
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
import { DeleteReceiptDTO } from './dto/delete-receipt.dto';

@UseGuards(JwtAuthGuard)
@Controller('receipt')
export class ReceiptController {
  private readonly logger = new Logger(ReceiptController.name);
  constructor(private readonly fileUploadService: ReceiptService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createReceipt(
    @Body() uploadOCRDto: UploadOCRDTO,
    @UploadedFile() { originalname, buffer, mimetype }: Express.Multer.File,
  ) {
    this.logger.verbose(`${ReceiptController.name} - createReceipt`);
    this.logger.log(`uploadOCRDto - ${JSON.stringify(uploadOCRDto)}`);
    return await this.fileUploadService.createReceipt(uploadOCRDto, {
      OCRName: originalname || '',
      OCRBuffer: buffer || Buffer.from(''),
      OCRMimetype: mimetype || '',
    });
  }

  @Delete()
  async deleteReciept(
    @CurrentUser() user: UserDTO,
    @Body() body: DeleteReceiptDTO,
  ) {
    this.logger.verbose(`${ReceiptController.name} - deleteReciept`);
    this.logger.log(`deleteRecieptDTO - ${JSON.stringify(body)}`);
    return await this.fileUploadService.deleteReciept(user, body);
  }
}
