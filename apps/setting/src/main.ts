import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { SettingModule } from './setting.module';

async function bootstrap() {
  const app = await NestFactory.create(SettingModule);
  const configService = app.get(ConfigService);
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
    'setting connection succeed port number : ',
    configService.get('PORT'),
  );

  await app.startAllMicroservices();
}
bootstrap();
