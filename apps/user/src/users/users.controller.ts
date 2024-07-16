import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('master')
  async createMasterMember(@Body() createUserDto: CreateUserDTO) {
    return this.userService.createMasterMember(createUserDto);
  }
}
