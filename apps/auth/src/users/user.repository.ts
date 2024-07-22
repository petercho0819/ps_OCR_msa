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
    super(userModel);
  }

  async findByEmail(email: string) {
    this.logger.verbose(`${MemberRepository.name} - getMember`);
    const result = await this.userModel.findOne(
      {
        email,
      },
      { password: 0 },
    );
    return result;
  }

  async getMemberInfoByEmail(email) {
    this.logger.log(`getMemberByEmail ${email}`);

    const query: { email: string } = { email };

    const member = await this.userModel.findOne(query);
    return member;
  }

  async getMember(
    companyCode: string,
    searchValue: string,
    page: number,
    limit: number,
  ) {
    this.logger.verbose(`${MemberRepository.name} - getMember`);

    const query: any = { companyCode };

    if (searchValue) {
      query.name = { $regex: searchValue, $options: 'i' }; // case-insensitive search
    }

    const skip = (Number(page) - 1) * Number(limit);

    const data = await this.userModel
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    const totalCount = await this.userModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalCount / Number(limit));

    return {
      totalCount,
      currentPage: page,
      totalPages,
      firstPage: 1,
      lastPage: totalPages,
      paginatedData: data,
    };
  }
}
