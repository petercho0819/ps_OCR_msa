import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  console.log(
    'configService.get<string>(',
    configService.get<string>('RABBIT_AUTH_URL'),
  );
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBIT_AUTH_URL')],
      queue: configService.get<string>('AUTH_QUEUE'),
      queueOptions: {
        durable: true,
        autoCreate: true,
      },
      prefetchCount: 1,
      // noAck: false,
      persistent: true,
    },
  });

  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    optionsSuccessStatus: 200,
  });
  await app.listen(configService.get<number>('HTTP_PORT'));

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  // app.useLogger(app.get(Logger));

  console.log('Microservice connected successfully');

  console.log(
    '🚀 ~ bootstrap auth ~ HTTP_PORT:',
    configService.get('HTTP_PORT'),
  );
  await app.startAllMicroservices();
}
bootstrap();
