import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getMember(
    @CurrentUser() user: UserDTO,
    @Query('searchValue') searchValue: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.verbose(`${UsersController.name} - getMember`);
    try {
      page = Math.max(1, page);
      limit = Math.max(1, limit);
      return await this.userService.getMember(
        user,
        searchValue,
        page,
        limit,
      );

    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 404);
    }
  }

  @Get(':email')
  @UseGuards(JwtAuthGuard)
  async getMemberDetail(
    @CurrentUser() user: UserDTO,
    @Param('email') email: string,
  ) {
    this.logger.verbose(`${UsersController.name} - getMemberDetail`);
    try {
      return await this.userService.getMemberDetail(user, email);
    } catch (error) {
      this.logger.error(error);
      return new HttpException(error, 404);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: UserDocument) {
    return user;
  }
}
