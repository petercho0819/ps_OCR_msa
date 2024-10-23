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

export class UploadReceiptDTO {
  receiptList: ReceiptDTO[];
}

export class ReceiptDTO {
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

  @IsString()
  @IsOptional()
  imgPath: string;
}

export class UploadReceiptSVCDTO extends UploadReceiptDTO {
  @IsNotEmpty()
  @IsString()
  memberCode: string;

  @IsNotEmpty()
  @IsString()
  companyCode: string;

  @IsNotEmpty()
  @IsString()
  imgPath: string;

  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsString()
  month: string;
}
