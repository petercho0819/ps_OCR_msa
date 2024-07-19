import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { UploadOCRSVCDTO } from '../dto/UploadOCRDTO.dto';
import { Receipt, ReceiptDocument } from './receipt.schema';

@Injectable()
export class ReceiptRepository extends AbstractRepository<ReceiptDocument> {
  protected readonly logger = new Logger(ReceiptRepository.name);
  constructor(
    @InjectModel(Receipt.name)
    protected readonly uploadModel: Model<ReceiptDocument>,
  ) {
    super(uploadModel);
  }
  async createUploadImage(dto: UploadOCRSVCDTO) {
    this.logger.log(`createUploadImage: ${JSON.stringify(dto)} `);
    return await this.uploadModel.create({
      _id: new Types.ObjectId(),
      ...dto,
    });
  }
}
