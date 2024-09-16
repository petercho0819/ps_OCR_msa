import { IsString, IsNotEmpty } from 'class-validator';

export class DownloadReceiptDTO {
  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsString()
  month: string;
}
