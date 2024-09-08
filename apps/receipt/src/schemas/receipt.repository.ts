import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument } from './receipt.schema';
import { DeleteReceiptDTO } from '../dto/delete-receipt.dto';
import { UploadReceiptSVCDTO } from '../dto/upload-receipt.dto';

@Injectable()
export class ReceiptRepository extends AbstractRepository<ReceiptDocument> {
  protected readonly logger = new Logger(ReceiptRepository.name);
  constructor(
    @InjectModel(Receipt.name)
    protected readonly uploadModel: Model<ReceiptDocument>,
  ) {
    super(uploadModel);
  }

  async getReceiptByYearAndMonth(
    searchValue: string,
    page: number,
    limit: number,
    year: string,
    month: string,
    companyCode: string,
    memberCode: string,
  ) {
    this.logger.verbose(`${ReceiptRepository.name} - getReceiptByYearAndMonth`);
    return await this.uploadModel
      .find({
        $or: [
          {
            name: {
              $regex: new RegExp(searchValue, 'i'),
            },
          },
          {
            memo: {
              $regex: new RegExp(searchValue, 'i'),
            },
          },
        ],
        year,
        month,
        companyCode,
        memberCode,
      })
      .skip((page - 1) * limit)
      .limit(limit * 1);
  }

  async getReceiptByPeriod(
    searchValue: string,
    page: number,
    limit: number,
    startDate: string,
    dueDate: string,
  ) {
    this.logger.verbose(`${ReceiptRepository.name} - getReceiptByPeriod`);
    return await this.uploadModel.find();
  }

  async createReceipt(dto: UploadReceiptSVCDTO) {
    this.logger.verbose(`${ReceiptRepository.name} - createReceipt`);
    this.logger.log(`createReceipt: ${JSON.stringify(dto)} `);

    return await this.uploadModel.create({
      _id: new Types.ObjectId(),
      ...dto,
    });
  }

  async deleteReciept(body: DeleteReceiptDTO) {
    this.logger.verbose(`${ReceiptRepository.name} - deleteReciept`);
    this.logger.log(`deleteReciept: ${JSON.stringify(body)} `);

    return await this.uploadModel.deleteMany({
      _id: { $in: body },
    });
  }
}
