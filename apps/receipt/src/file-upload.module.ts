import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadImage, UploadImageSchema } from './schemas/file-upload.schema';
import { FileUploadRepository } from './schemas/file-upload.repository';
import { AmazonModule } from '@app/common/amazon/amazon.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/receipt/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: UploadImage.name, schema: UploadImageSchema },
    ]),
    AmazonModule.init({
      region: process.env.AMAZON_REGION,
      bucket: process.env.AMAZON_BUCKET,
      credentials: {
        accessKeyId: process.env.AMAZON_BUCKET_ACCESSKEY_ID,
        secretAccessKey: process.env.AMAZON_BUCKET_SECRETKEY,
      },
    }),
    HttpModule,
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository],
})
export class FileUploadModule {}
