import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemberRepository } from './users/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private memberRepository: MemberRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(id: string, pass: string): Promise<any> {
    const user = await this.memberRepository.findByEmail(id);
    if (user) {
      const { password, ...result } = user;
      const isMatch = await bcrypt.compare(pass, password);

      if (isMatch) {
        return result;
      }
    }

    throw new UnauthorizedException();
  }

  async checkValidUser(id: string): Promise<any> {
    const user = await this.memberRepository.findByEmail(id);
    if (user) {
      return user;
    }

    throw new UnauthorizedException();
  }

  async login(user: any) {
    return {
      accessToken: this.jwtService.sign(user, {
        secret: process.env.SECRET_OR_KEY,
        expiresIn: process.env.JWT_EXPIRED,
      }),
      expiresIn: process.env.JWT_EXPIRED,
    };
  }
}
