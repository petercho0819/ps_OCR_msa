import { Injectable, Logger } from '@nestjs/common';
import { CompanyRepository } from './schemas/company.repository';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly companyRepository: CompanyRepository) {}

  async getCompanyListByCompanyCode(companyCodeList: any) {
    this.logger.verbose(`${CompanyService.name} - getCompanyListByCompanyCode`);
    this.logger.debug(`companyCodeList : ${JSON.stringify(companyCodeList)}`);
    return await this.companyRepository.getCompanyListByCompanyCode(
      companyCodeList,
    );
  }

  async getCompanyByCompanyCode(companyCode: any) {
    this.logger.verbose(`${CompanyService.name} - getCompanyByCompanyCode`);
    return await this.companyRepository.getCompanyByCompanyCode(companyCode);
  }
}
