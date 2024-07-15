import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { Member } from './models/user.schema';

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

  async createMasterMember(createMemberDto) {
    this.logger.verbose(`${MemberRepository.name} - createMasterMember`);
    try {
      const result = await this.model.create(createMemberDto);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }
}
