import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class CreateMasterDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  name: string;

  @IsString()
  companyCode: string;
}

export class CreateUserDetailDTO extends CreateMasterDTO {
  @IsString()
  role: string;
  @IsString()
  memberCode: string;
}
