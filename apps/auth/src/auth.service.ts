import { Inject, Injectable } from '@nestjs/common';
import { UserDocument } from './users/models/user.schema';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MemberRepository } from './users/user.repository';
import Tokenpayload from './interface/token-payload.interface';
import { userInfo } from 'os';
import { decryptDecryptCode } from './utils/validate';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly memberRepository: MemberRepository,
  ) {}

  async login(user, response: Response) {
    const { email } = decryptDecryptCode<{
      email: string;
      time: string;
    }>(user.loginForm);
    const memberData = await this.memberRepository.getMemberInfoByEmail(email);
    // Calculate the token expiration time by adding seconds to the current date
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 36000000);

    const tokenDto = <Tokenpayload>{
      email: memberData.email,
      role: memberData.role,
      companyCode: memberData.companyCode,
      memberCode: memberData.memberCode,
      name: memberData.name,
    };

    const token = this.jwtService.sign(tokenDto);

    response.cookie('Authentication', token, {
      expires: expires,
      // httpOnly: true,
    });

    return {
      token,
      memberData,
    }; // Return the token
  }
}
