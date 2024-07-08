import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { UploadImage } from './file-upload.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';

@Injectable()
export class FileUploadRepository extends AbstractRepository<UploadImage> {
  protected readonly logger = new Logger(FileUploadRepository.name);
  constructor(
    @InjectModel(UploadImage.name) readonly orderModel: Model<UploadImage>,
    @InjectConnection() connection: Connection,
  ) {
    super(orderModel, connection);
  }

  async createFileUpload(request: any) {
    return await this.orderModel.create({
      _id: new Types.ObjectId(),
      ...request,
    });
  }
}
