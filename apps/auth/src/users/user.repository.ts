import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { UserDocument } from './models/user.schema';

@Injectable()
export class MemberRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(MemberRepository.name);
  constructor(
    @InjectModel(UserDocument.name)
    protected readonly userModel: Model<UserDocument>,
  ) {
    super(userModel,);
  }
  // async create(dto) {
  //   await this.userModel.create(dto);
  // }
}
