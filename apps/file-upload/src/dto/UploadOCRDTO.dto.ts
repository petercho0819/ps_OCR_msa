import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsIn,
  IsNumberString,
} from 'class-validator';
import { INVALID_RECEIPT_TYPE, receiptType } from '../constant';
import { ReceiptType } from '../interface';

export class UploadOCRDTO {
  @IsNotEmpty()
  @IsString()
  receiptDate: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumberString()
  numberOfPeople: number;

  @IsNotEmpty()
  @IsIn(receiptType, { message: INVALID_RECEIPT_TYPE })
  receiptType: ReceiptType;

  @IsNotEmpty()
  @IsNumberString()
  price: number;

  @IsString()
  @IsOptional()
  memo: string;
}

export class UploadOCRSVCDTO extends UploadOCRDTO {
  @IsNotEmpty()
  @IsString()
  userCode: string;

  @IsNotEmpty()
  @IsString()
  imgPath: string;
}
