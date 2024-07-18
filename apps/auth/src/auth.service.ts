import { Inject, Injectable } from '@nestjs/common';
import { UserDocument } from './users/models/user.schema';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokenpayload } from './interface/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: UserDocument, response: Response) {
    const tokenPayload: Tokenpayload = {
      userId: user._id.toString(),
    };

    // Calculate the token expiration time by adding seconds to the current date
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 600);

    const token = this.jwtService.sign(tokenPayload);
    console.log('🚀 ~ AuthService ~ login ~ token:', token);

    response.cookie('Authentication', token, {
      expires: expires,
      // httpOnly: true,
    });

    return token; // Return the token
  }
}
