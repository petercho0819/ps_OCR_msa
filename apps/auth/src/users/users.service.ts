import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MemberRepository } from './user.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcryptjs from 'bcryptjs';
import { GetUserDto } from '../dto/get-user.dto';
@Injectable()
export class UsersService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async create(createUserDto: CreateUserDTO) {
    await this.validateCreateUserDto(createUserDto);
    return this.memberRepository.create({
      ...createUserDto,
      password: await bcryptjs.hash(createUserDto.password, 10),
      memberCode: '11',
      role: 'ADMIN',
    });
  }

  private async validateCreateUserDto(createUserDto: CreateUserDTO) {
    try {
      await this.memberRepository.findOne({ email: createUserDto.email });
    } catch (error) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.memberRepository.findOne({ email });
    const passwordIsValid = await bcryptjs.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.memberRepository.findOne(getUserDto);
  }
}
