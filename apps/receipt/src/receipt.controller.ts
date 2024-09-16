import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser, JwtAuthGuard, UserDTO } from '@app/common';
import { DeleteReceiptDTO } from './dto/delete-receipt.dto';
import { UploadReceiptDTO } from './dto/upload-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DownloadReceiptDTO } from './dto/download-receipt.dto';

@UseGuards(JwtAuthGuard)
@Controller('receipt')
export class ReceiptController {
  private readonly logger = new Logger(ReceiptController.name);
  constructor(private readonly fileUploadService: ReceiptService) {}

  @Get('list/period')
  async getReceiptByPeriod(
    @CurrentUser() user: UserDTO,
    @Query('searchValue') searchValue: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate: 'ALL' | 'NOT_ENTERED',
    @Query('dueDate')
    dueDate: 'ALL' | 'EXCEED' | 'LESS_THAN_THREE_MONTHS',
  ) {
    this.logger.verbose(`${ReceiptController.name} - getReceiptByPeriod`);
    try {
      page = Math.max(1, page);
      limit = Math.max(1, limit);
      return await this.fileUploadService.getReceiptByPeriod(
        user,
        searchValue,
        page,
        limit,
        startDate,
        dueDate,
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 400);
    }
  }

  @Get('list/yearAndMonth')
  async getReceiptByYearAndMonth(
    @CurrentUser() user: UserDTO,
    @Query('searchValue') searchValue: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('year') year: string,
    @Query('month')
    month: string,
  ) {
    this.logger.verbose(`${ReceiptController.name} - getReceiptByYearAndMonth`);
    try {
      page = Math.max(1, page);
      limit = Math.max(1, limit);
      return await this.fileUploadService.getReceiptByYearAndMonth(
        user,
        searchValue,
        page,
        limit,
        year,
        month,
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 400);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createReceipt(
    @CurrentUser() user: UserDTO,
    @Body() body,
    @UploadedFile() { originalname, buffer, mimetype }: Express.Multer.File,
  ) {
    this.logger.verbose(`${ReceiptController.name} - createReceipt`);
    this.logger.log(`uploadReceiptDto - ${JSON.stringify(body)}`);

    const dto = plainToInstance(UploadReceiptDTO, body);

    const errors = await validate(dto);
    console.log('🚀 ~ ReceiptController ~ errors:', errors);
    if (errors.length > 0) {
      return new NotFoundException(errors);
    }
    return await this.fileUploadService.createReceipt(user, body, {
      OCRName: originalname || '',
      OCRBuffer: buffer || Buffer.from(''),
      OCRMimetype: mimetype || '',
    });
  }

  @Post('download/excel')
  async downloadReceiptByExcel(
    @CurrentUser() user: UserDTO,
    @Body() body: DownloadReceiptDTO,
  ) {
    this.logger.verbose(`${ReceiptController.name} - downloadReceiptByExcel`);
    this.logger.log(`downloadReceiptByExcelDto - ${JSON.stringify(body)}`);

    return await this.fileUploadService.downloadReceiptByExcel(user, body);
  }

  @Delete()
  async deleteReceipt(@Body() body: DeleteReceiptDTO) {
    this.logger.verbose(`${ReceiptController.name} - deleteReceipt`);
    this.logger.log(`deleteRecieptDTO - ${JSON.stringify(body)}`);
    return await this.fileUploadService.deleteReceipt(body);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  async updateReceipt(
    @CurrentUser() user: UserDTO,
    @Body() body,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.verbose(`${ReceiptController.name} - updateReceipt`);
    this.logger.log(`UpdateReceiptDTO - ${JSON.stringify(body)}`);
    return await this.fileUploadService.updateReceipt(user, body, {
      OCRName: file?.originalname || '',
      OCRBuffer: file?.buffer || Buffer.from(''),
      OCRMimetype: file?.mimetype || '',
    });
  }

  @Get('detail/:_id')
  async getReceiptDetailById(
    @Param('_id')
    _id: string,
  ) {
    this.logger.verbose(`${ReceiptController.name} - getReceiptDetailById`);
    try {
      return await this.fileUploadService.getReceiptDetailById(_id);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 400);
    }
  }
}
