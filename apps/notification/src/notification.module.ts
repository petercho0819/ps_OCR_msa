import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { AUTH_SERVICE, DatabaseModule, EMAIL_SERVICE } from '@app/common';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { NotificationRepository } from './schemas/notification.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const host = configService.get('RABBITMQ_URL');
          const queueName = configService.get('AUTH_QUEUE');

          return {
            transport: Transport.RMQ,
            options: {
              urls: [host],
              queue: queueName,
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: EMAIL_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const host = configService.get('RABBITMQ_URL');
          const queueName = configService.get('EMAIL_QUEUE');

          return {
            transport: Transport.RMQ,
            options: {
              urls: [host],
              queue: queueName,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URL'),
        exchanges: [
          {
            name: 'email.exchange',
            type: 'topic',
          },
        ],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PORT: Joi.number().required(),
        RABBITMQ_URL: Joi.string().required(),
        AUTH_QUEUE: Joi.string().required(),
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
