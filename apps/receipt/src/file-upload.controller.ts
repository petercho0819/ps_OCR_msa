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
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadOCRDTO } from './dto/UploadOCRDTO.dto';
import { CurrentUser, JwtAuthGuard, UserDTO } from '@app/common';

@Controller('upload-image')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createReservationDto, @CurrentUser() user: UserDTO) {
    console.log(
      '🚀 ~ FileUploadController ~ create ~ createReservationDto:',
      createReservationDto,
    );
    console.log('🚀 ~ FileUploadController ~ create ~ user:', user);
    // return await this.reservationsService.create(
    //   createReservationDto,
    //   user._id,
    // );
  }

  @Post('ocrImage')
  @UseGuards(JwtAuthGuard)
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
