import { Injectable, Logger } from '@nestjs/common';
import { FileUploadRepository } from './schemas/file-upload.repository';
import { UploadOCRDTO } from './dto/UploadOCRDTO.dto';
import { AmazonService } from '@app/common/amazon/amazon.service';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NaverOcrDTO } from './interface';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    private readonly httpService: HttpService,
    private readonly amazonService: AmazonService,
  ) {}

  async uploadImage(
    uploadOCRDto: UploadOCRDTO,
    { OCRName, OCRBuffer, OCRMimetype },
  ) {
    this.logger.verbose(`${FileUploadService.name} - uploadImage`);

    // file 절대경로로 업데이트
    // 1. aws에 업로드
    try {
      let imgPath: string;
      if (OCRName) {
        await this.amazonService.uploadFile(
          OCRName,
          OCRBuffer,
          OCRMimetype,
          'ocrImage',
        );
        const encodedFileName = encodeURIComponent(OCRName);
        imgPath = `${process.env.AMAZON_BUCKET_BASE}/ocrImage/${encodedFileName}`;
      }
      // 2. db에 저장
      await this.fileUploadRepository.createUploadImage({
        ...uploadOCRDto,
        numberOfPeople: Number(uploadOCRDto.numberOfPeople),
        price: Number(uploadOCRDto.price),
        userCode: 'userCode1',
        imgPath,
      });
      // naver api로 분석하기
      // 1. img 파일을 폴더에 업로드
      const directoryPath = path.join(__dirname, '../../../receipt-uploads');
      const filePath = path.join(directoryPath, 'receipt');
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }
      await fs.promises.writeFile(filePath, OCRBuffer);
      //  2. 업로드된 파일을 가지고 base64로 변환
      const data = await fs.promises.readFile(filePath);
      const base64Encoded = data.toString('base64');

      const naverOcrDto: NaverOcrDTO = {
        images: [
          {
            format: OCRMimetype.split('/')[1],
            name: OCRName,
            data: base64Encoded,
          },
        ],
        requestId: uuidv4(),
        version: 'V2',
        timestamp: moment().unix(),
      };

      const result2 = await this.httpService.axiosRef.post(
        process.env.NAVER_OCR_URL_FOR_RECIPT,
        naverOcrDto,
        {
          headers: {
            'X-OCR-SECRET': process.env.X_OCR_SECRET_FOR_RECEIPT,
            'Content-Type': 'application/json',
          },
        },
      );

      const money =
        result2?.data?.images?.[0].receipt?.result?.totalPrice?.price?.formatted
          ?.value || 0;
      const year =
        result2?.data?.images?.[0].receipt?.result?.paymentInfo?.date?.formatted
          ?.year || '';
      const month =
        result2?.data?.images?.[0].receipt?.result?.paymentInfo?.date?.formatted
          ?.month || '';
      const day =
        result2?.data?.images?.[0].receipt?.result?.paymentInfo?.date?.formatted
          ?.day || '';
      return {
        totalPrice: money,
        date: `${year}-${month}-${day}`,
      };
    } catch (e) {
      this.logger.error(e);
    }
  }
}
