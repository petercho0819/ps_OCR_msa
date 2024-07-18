import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { UploadImage } from './file-upload.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { UploadOCRSVCDTO } from '../dto/UploadOCRDTO.dto';

@Injectable()
export class FileUploadRepository extends AbstractRepository<UploadImage> {
  protected readonly logger = new Logger(FileUploadRepository.name);
  constructor(
    @InjectModel(UploadImage.name)
    protected readonly uploadModel: Model<UploadImage>,
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
