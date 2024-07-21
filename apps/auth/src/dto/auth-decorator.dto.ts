import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export default class AuthUserDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  @IsString()
  nscCode: string;

  @IsOptional()
  @IsString()
  dealershipCode: string;

  @IsOptional()
  @IsString()
  memberCode: string;

  @IsOptional()
  @IsString()
  dealerCode: string;

  @IsOptional()
  @IsString()
  lang: string;
}
