import { Injectable, Logger } from '@nestjs/common';
import { MemberRepository } from './user.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { getGenerateCode } from '../function';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  async createMasterMember(createUserDto: CreateUserDTO) {
    this.logger.verbose(`${UsersService.name} - createMasterMember`);
    const { email } = createUserDto;

    // Description : 중복 회원가입 방지
    const checkDuplicateMember =
      await this.memberRepository.checkDuplicateMember(email);
    if (checkDuplicateMember) return 'duplicate User';

    // Description : 비밀번호 bcrypt
    const saltOrRounds = 10;
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    const result = await this.memberRepository.createMasterMember({
      ...createUserDto,
      role: 'MASTER',
      memberCode: getGenerateCode(),
    });

    if (result) return result;
  }
}
