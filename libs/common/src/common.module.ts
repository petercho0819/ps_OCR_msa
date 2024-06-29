import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [CommonService],
  exports: [CommonService],
  imports: [DatabaseModule, ConfigModule, LoggerModule],
})
export class CommonModule {}
