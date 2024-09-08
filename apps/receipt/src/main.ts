import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ReceiptModule } from './receipt.module';

async function bootstrap() {
  const app = await NestFactory.create(ReceiptModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*', // 모든 헤더를 허용
    optionsSuccessStatus: 200,
  });
  console.log(
    "🚀 ~ bootstrap ~ configService.get('PORT'):",
    configService.get('PORT'),
  );
  await app.listen(configService.get('PORT'));
}
bootstrap();
