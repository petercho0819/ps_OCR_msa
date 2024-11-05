import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SettingService } from './setting.service';
import { CurrentUser, JwtAuthGuard, UserDTO } from '@app/common';

@UseGuards(JwtAuthGuard)
@Controller('setting')
export class SettingController {
  private readonly logger = new Logger(SettingController.name);

  constructor(private readonly settingService: SettingService) {}

  @Get('date')
  async getReceiptRemindDate(@CurrentUser() user: UserDTO) {
    this.logger.verbose(`${SettingController.name} - getReceiptRemindDate`);
    try {
      return await this.settingService.getReceiptRemindDate(user);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 400);
    }
  }
  @Post('date')
  async updateReceiptRemindDate(@CurrentUser() user: UserDTO, @Body() body) {
    console.log(
      '🚀 ~ SettingController ~ updateReceiptRemindDate ~ body:',
      body,
    );
    this.logger.verbose(`${SettingController.name} - updateReceiptRemindDate`);
    try {
      return await this.settingService.updateReceiptRemindDate(user, body);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 400);
    }
  }
}
