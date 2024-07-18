import { Module } from '@nestjs/common';
import { AUTH_SERVICE, DatabaseModule } from '@app/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UploadImage, UploadImageSchema } from './schemas/file-upload.schema';
import { AmazonModule } from '@app/common/amazon/amazon.module';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileUploadRepository } from './schemas/file-upload.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UploadImage.name, schema: UploadImageSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
    AmazonModule.init({
      region: process.env.AMAZON_REGION,
      bucket: process.env.AMAZON_BUCKET,
      credentials: {
        accessKeyId: process.env.AMAZON_BUCKET_ACCESSKEY_ID,
        secretAccessKey: process.env.AMAZON_BUCKET_SECRETKEY,
      },
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => {
          const host = configService.get('AUTH_HOST');
          const port = configService.get('AUTH_PORT');
          console.log(`AUTH_HOST: ${host}, AUTH_PORT: ${port}`);
          return {
            transport: Transport.TCP,
            options: {
              host,
              port,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository],
})
export class FileUploadModule {}
