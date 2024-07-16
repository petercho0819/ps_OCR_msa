import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_OR_KEY,
    });
  }
  private logger = new Logger(JwtStrategy.name);
  async validate(payload: any) {
    const id = payload._doc.id;
    const user = await this.authService.checkValidUser(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.id,
    };
  }
}
