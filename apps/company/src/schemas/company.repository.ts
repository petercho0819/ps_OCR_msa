import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './company.schema';

@Injectable()
export class CompanyRepository extends AbstractRepository<CompanyDocument> {
  protected readonly logger = new Logger(CompanyRepository.name);
  constructor(
    @InjectModel(Company.name)
    protected readonly companyModel: Model<CompanyDocument>,
  ) {
    super(companyModel);
  }

  async getCompanyListByCompanyCode(companyList: any) {
    this.logger.verbose(
      `${CompanyRepository.name} - getCompanyListByCompanyCode`,
    );
    return await this.companyModel.find({ companyCode: { $in: companyList } });
  }

  async getCompanyByCompanyCode(companyCode: any) {
    this.logger.verbose(
      `${CompanyRepository.name} - getCompanyListByCompanyCode`,
    );
    return await this.companyModel.findOne({ companyCode });
  }
}
