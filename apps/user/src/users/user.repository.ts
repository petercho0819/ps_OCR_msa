import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { Member } from './models/user.schema';
import { CreateUserDTO, CreateUserDetailDTO } from './dto/create-user.dto';

@Injectable()
export class MemberRepository extends AbstractRepository<Member> {
  protected readonly logger = new Logger(MemberRepository.name);
  constructor(
    @InjectModel(Member.name)
    protected readonly userModel: Model<Member>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  async checkDuplicateMember(email: any) {
    this.logger.verbose(`${MemberRepository.name} - checkDuplicateMember`);
    try {
      const result = await this.model.findOne({ email });
      return result;
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async findByEmail(email: string) {
    this.logger.verbose(`${MemberRepository.name} - findByEmail`);
    try {
      const result = await this.model.findOne({ email });
      return result;
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async createMasterMember(createMemberDto: CreateUserDetailDTO) {
    console.log(
      '🚀 ~ MemberRepository ~ createMasterMember ~ createMemberDto:',
      createMemberDto,
    );
    this.logger.verbose(`${MemberRepository.name} - createMasterMember`);
    try {
      const result = await this.userModel.create({
        _id: new Types.ObjectId(),
        ...createMemberDto,
      });
      return result;
    } catch (error) {
      this.logger.error('eer', error.message);
      return null;
    }
  }
}
