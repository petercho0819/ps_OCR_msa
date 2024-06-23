import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDTO) {
    return this.userRepository.create({
      ...createUserDto,
    });
  }
}
