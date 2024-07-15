import { Controller, Post, Logger, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

import { AUTH } from './endpoint';
import { LocalAuthGuard } from './local-auth.guard';

@Controller(AUTH)
export class AuthController {
  session = {};
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }
}
