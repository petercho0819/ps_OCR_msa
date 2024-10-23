import { NestFactory } from '@nestjs/core';
import { CompanyModule } from './company.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(CompanyModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: configService.get<string>('COMPANY_QUEUE'),
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: '*', // 모든 헤더를 허용
    optionsSuccessStatus: 200,
  });
  await app.listen(configService.get<number>('PORT'));

  console.log(
    'company connection succeed port number : ',
    configService.get('HTTP_PORT'),
  );

  await app.startAllMicroservices();
}
bootstrap();
