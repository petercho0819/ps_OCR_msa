import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  name: string;
}

export class CreateUserDetailDTO extends CreateUserDTO {
  @IsString()
  role: string;
  @IsString()
  memberCode: string;
}
