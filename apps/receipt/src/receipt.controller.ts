import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
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
    const parsedData = JSON.parse(body.receiptBody);

    const dto = plainToInstance(UploadReceiptDTO, parsedData);
    const te = {
      receiptDate: '2024-01-01',
      name: 'name',
      numberOfPeople: 2,
      receiptType: 'DINNER_FEE',
      price: 100,
      memo: '2명',
    };
    const errors = await validate(dto);
    return await this.fileUploadService.createReceipt(user, parsedData, {
      OCRName: originalname || '',
      OCRBuffer: buffer || Buffer.from(''),
      OCRMimetype: mimetype || '',
    });
  }

  @Delete()
  async deleteReciept(@Body() body: DeleteReceiptDTO) {
    this.logger.verbose(`${ReceiptController.name} - deleteReciept`);
    this.logger.log(`deleteRecieptDTO - ${JSON.stringify(body)}`);
    return await this.fileUploadService.deleteReciept(body);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  async updateReciept(
    @CurrentUser() user: UserDTO,
    @Body() body: UpdateReceiptDTO,
    @UploadedFile() { originalname, buffer, mimetype }: Express.Multer.File,
  ) {
    this.logger.verbose(`${ReceiptController.name} - updateReciept`);
    this.logger.log(`UpdateReceiptDTO - ${JSON.stringify(body)}`);
    return await this.fileUploadService.updateReciept(user, body, {
      OCRName: originalname || '',
      OCRBuffer: buffer || Buffer.from(''),
      OCRMimetype: mimetype || '',
    });
  }
}
