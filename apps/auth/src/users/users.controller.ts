import {
  Body,
  Controller,
  Delete,
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
import { MessagePattern, Payload } from '@nestjs/microservices';

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
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    this.logger.verbose(`${UsersController.name} - getMember`);
    try {
      page = Math.max(1, page);
      limit = Math.max(1, limit);
      return await this.userService.getMember(user, searchValue, page, limit);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 404);
    }
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard)
  async getMemberByAdmin(@CurrentUser() user: UserDTO) {
    this.logger.verbose(`${UsersController.name} - getMemberByAdmin`);
    try {
      return await this.userService.getMemberByAdmin(user);
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

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteMember(@CurrentUser() user: UserDocument, @Body() body) {
    this.logger.verbose(`${UsersController.name} - deleteMember`);
    const { emails } = body;
    try {
      return await this.userService.deleteMember(user, emails);
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

  @MessagePattern('get_user_by_user_code')
  async getUserByUserCodes(@Payload() data) {
    this.logger.verbose(`${UsersController.name} - getUserByUserCodes`);

    return this.userService.getUserByUserCodes(data);
  }
}
