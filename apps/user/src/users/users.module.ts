import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '@app/common';
import { MemberSchema, Member } from './models/user.schema';
import { MemberRepository } from './user.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, MemberRepository],
})
export class UsersModule {}
