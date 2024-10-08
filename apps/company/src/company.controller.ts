import {
  Controller,
  Get,
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@app/common';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  private readonly logger = new Logger(CompanyController.name);

  @MessagePattern('get_company')
  async getCompanyListByCompanyCode(@Payload() data) {
    this.logger.verbose(
      `${CompanyController.name} - getCompanyListByCompanyCode`,
    );

    return this.companyService.getCompanyListByCompanyCode(data);
  }

  @MessagePattern('getCompanyByCompanyCode')
  async getCompanyByCompanyCode(@Payload() data) {
    this.logger.verbose(`${CompanyController.name} - getCompanyByCompanyCode`);

    return this.companyService.getCompanyByCompanyCode(data);
  }
}
