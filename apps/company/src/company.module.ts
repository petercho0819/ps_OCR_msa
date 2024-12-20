import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { Company, CompanySchema } from './schemas/company.schema';
import {
  UserDocument,
  UserSchema,
} from 'apps/auth/src/users/models/user.schema';
import { CompanyRepository } from './schemas/company.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: UserDocument.name, schema: UserSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PORT: Joi.number().required(),
        COMPANY_QUEUE: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
      }),
    }),
  ],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
