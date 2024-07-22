import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { CurrentUser } from '../current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserDocument } from './models/user.schema';
import { CreateMasterDTO } from './dto/create-master.dto';
import { UserDTO } from '@app/common';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userService: UsersService) {}

  @Post('master')
  async createMaster(@Body() createUserDto: CreateMasterDTO) {
    this.logger.verbose(`${UsersController.name} - createMaster`);
    return this.userService.createMaster(createUserDto);
  }

  @Post('member')
  @UseGuards(JwtAuthGuard)
  async createMember(
    @CurrentUser() user: UserDTO,
    @Body() createUserDto: CreateUserDTO,
  ) {
    this.logger.verbose(`${UsersController.name} - createMember`);
    this.logger.log(`user - ${JSON.stringify(user)}`);
    this.logger.log(`Body - ${JSON.stringify(Body)}`);
    return this.userService.createMember(user, createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: UserDocument) {
    return user;
  }
}
