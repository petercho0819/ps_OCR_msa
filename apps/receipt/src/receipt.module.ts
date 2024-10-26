import { Module } from '@nestjs/common';
import { AUTH_SERVICE, COMPANY_SERVICE, DatabaseModule } from '@app/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AmazonModule } from '@app/common/amazon/amazon.module';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { Receipt, ReceiptSchema } from './schemas/receipt.schema';
import { ReceiptRepository } from './schemas/receipt.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([{ name: Receipt.name, schema: ReceiptSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        RABBITMQ_URL: Joi.string().required(),
        AUTH_QUEUE: Joi.string().required(),
        COMPANY_QUEUE: Joi.string().required(),
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
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('AUTH_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: COMPANY_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('COMPANY_QUEUE'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    HttpModule,
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, ReceiptRepository],
})
export class ReceiptModule {}
