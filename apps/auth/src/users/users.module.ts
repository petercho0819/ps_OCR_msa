import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { COMPANY_SERVICE, DatabaseModule } from '@app/common';
import { UserDocument, UserSchema } from './models/user.schema';
import { MemberRepository } from './user.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: COMPANY_SERVICE,
        useFactory: (configService: ConfigService) => {
          const host = configService.get('RABBIT_COMPANY_URL');
          const queueName = configService.get('COMPANY_QUEUE');

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
  ],
  controllers: [UsersController],
  providers: [UsersService, MemberRepository],
  exports: [UsersService],
})
export class UsersModule {}
