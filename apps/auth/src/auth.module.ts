import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserDocument, UserSchema } from './users/models/user.schema';
import { MemberRepository } from './users/user.repository';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_EXPIRATION: Joi.string().required(),
        SECRET_OR_KEY: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        RABBIT_AUTH_URL: Joi.string().required(),
        AUTH_QUEUE: Joi.string().required(),
        RABBIT_COMPANY_URL: Joi.string().required(),
        COMPANY_QUEUE: Joi.string().required(),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_OR_KEY'),
        signOptions: {
          expiresIn: '600d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, MemberRepository],
})
export class AuthModule {}
