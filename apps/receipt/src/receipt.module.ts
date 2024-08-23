import { Module } from '@nestjs/common';
import { AUTH_SERVICE, DatabaseModule } from '@app/common';

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
    HttpModule,
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, ReceiptRepository],
})
export class ReceiptModule {}
