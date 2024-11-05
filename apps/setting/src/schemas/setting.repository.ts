import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setting, SettingDocument } from './setting.schema';

@Injectable()
export class SettingRepository extends AbstractRepository<SettingDocument> {
  protected readonly logger = new Logger(SettingRepository.name);
  constructor(
    @InjectModel(Setting.name)
    protected readonly settingModel: Model<SettingDocument>,
  ) {
    super(settingModel);
  }

  async updateReceiptRemindDate(companyCode: string, body: any) {
    this.logger.verbose(`${SettingRepository.name} - getReceiptRemindDate`);
    return await this.settingModel.updateOne(
      { companyCode },
      {
        $set: { isActive: body.isActive, uploadDate: body.uploadDate },
      },
    );
  }

  async createReceiptRemindDate(companyCode: string) {
    this.logger.verbose(`${SettingRepository.name} - getReceiptRemindDate`);
    return await this.settingModel.create({
      _id: new Types.ObjectId(),
      companyCode,
      uploadDate: '25',
    });
  }

  async getReceiptRemindDate(companyCode: string) {
    this.logger.verbose(`${SettingRepository.name} - getReceiptRemindDate`);
    return await this.settingModel.findOne({ companyCode });
  }

  async getUpcomingReceiptDate(uploadDate: string) {
    this.logger.verbose(`${SettingRepository.name} - getUpcomingReceiptDate`);
    return await this.settingModel.find({ uploadDate });
  }
}
