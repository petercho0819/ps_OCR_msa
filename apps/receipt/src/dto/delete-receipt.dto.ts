import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsIn,
  IsNumberString,
  IsArray,
} from 'class-validator';

export class DeleteReceiptDTO {
  @IsNotEmpty()
  @IsArray()
  ids: Array<string>;
}
