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
import { ClientsModule, Transport } from '@nestjs/microservices';
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
      // envFilePath: './apps/user/.env',
      validationSchema: Joi.object({
        JWT_EXPIRATION: Joi.string().required(),
        SECRET_OR_KEY: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_OR_KEY'),
        signOptions: {
          expiresIn: '600s',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, MemberRepository],
})
export class AuthModule {}
