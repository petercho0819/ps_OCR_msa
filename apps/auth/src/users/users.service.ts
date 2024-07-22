import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MemberRepository } from './user.repository';
import * as bcryptjs from 'bcryptjs';
import { GetUserDto } from '../dto/get-user.dto';
import { CreateMasterDTO } from './dto/create-master.dto';
import { UserDTO } from '@app/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { ADMIN, MEMBER } from '../constant';
import { getGenerateCode } from '../function';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  async createMaster(createUserDto: CreateMasterDTO) {
    this.logger.verbose(`${UsersService.name} - createMaster`);
    await this.validateCreateUserDto(createUserDto);
    return this.memberRepository.create({
      ...createUserDto,
      password: await bcryptjs.hash(createUserDto.password, 10),
      memberCode: getGenerateCode(),
      role: ADMIN,
    });
  }

  async getMemberDetail(user: UserDTO, email: string) {
    this.logger.verbose(`${UsersService.name} - getMemberDetail`);

    try {
      const member = await this.memberRepository.findByEmail(email);
      if (!member) {
        throw new NotFoundException('member not found');
      }
      return member;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getMember(
    user: UserDTO,
    searchValue: string,
    page: number,
    limit: number,
  ) {
    this.logger.verbose(`${UsersService.name} - getMember`);
    const { companyCode } = user;
    return await this.memberRepository.getMember(
      companyCode,
      searchValue,
      page,
      limit,
    );
  }

  async createMember(user: UserDTO, createUserDto: CreateUserDTO) {
    this.logger.verbose(`${UsersService.name} - createMember`);
    const { companyCode } = user;
    await this.validateCreateUserDto(createUserDto);

    return this.memberRepository.create({
      ...createUserDto,
      password: await bcryptjs.hash(createUserDto.password, 10),
      memberCode: getGenerateCode(),
      role: MEMBER,
      companyCode,
    });
  }

  private async validateCreateUserDto(createUserDto) {
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

  async getUser(email: GetUserDto) {
    return this.memberRepository.findOne(email);
  }
}
