import { Inject, Injectable, Logger } from '@nestjs/common';
import { AmazonService } from '@app/common/amazon/amazon.service';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NaverOcrDTO } from './interface';
import { ReceiptRepository } from './schemas/receipt.repository';
import { COMPANY_SERVICE, UserDTO } from '@app/common';
import { DeleteReceiptDTO } from './dto/delete-receipt.dto';
import { UploadReceiptDTO } from './dto/upload-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, of, tap } from 'rxjs';

@Injectable()
export class ReceiptService {
  @Inject(COMPANY_SERVICE) private readonly companyService: ClientProxy;

  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly httpService: HttpService,
    private readonly amazonService: AmazonService,
  ) {}

  async getReceiptByYearAndMonth(
    user: UserDTO,
    searchValue: string,
    page: number,
    limit: number,
    year: string,
    month: string,
  ) {
    this.logger.verbose(`${ReceiptService.name} - getReceiptByYearAndMonth`);
    const { companyCode, memberCode } = user;
    return await this.receiptRepository.getReceiptByYearAndMonth(
      searchValue,
      page,
      limit,
      year,
      month,
      companyCode,
      memberCode,
    );
  }
  async getReceiptByPeriod(
    user: UserDTO,
    searchValue: string,
    page: number,
    limit: number,
    startDate: string,
    dueDate: string,
  ) {
    this.logger.verbose(`${ReceiptService.name} - getReceiptByPeriod`);
    const company = this.receiptRepository.getReceiptByPeriod(
      searchValue,
      page,
      limit,
      startDate,
      dueDate,
    );
  }

  async updateReciept(
    user: UserDTO,
    body: UpdateReceiptDTO,
    { OCRName, OCRBuffer, OCRMimetype },
  ) {
    this.logger.verbose(`${ReceiptService.name} - updateReciept`);
    const { companyCode } = user;
    const company = this.companyService
      .send('getCompanyByCompanyCode', companyCode)
      .pipe(
        tap((res) => {
          console.log('🚀 ~ ReceiptService ~ tap ~ res:', res);
          return res;
        }),
        catchError((e) => {
          console.error('Error in catchError:', e);
          return of(null); // Handle error and return a default value or empty observable
        }),
      );
    console.log(
      '🚀 ~ ReceiptService ~ this.companyService:',
      this.companyService,
    );
    console.log('🚀 ~ ReceiptService ~ company:', company);

    let imgPath: string;
    // if (OCRName) {
    //   await this.amazonService.uploadFile(
    //     OCRName,
    //     OCRBuffer,
    //     OCRMimetype,
    //     'ocrImage',
    //   );
    //   const encodedFileName = encodeURIComponent(OCRName);
    //   imgPath = `${process.env.AMAZON_BUCKET_BASE}/ocrImage/${encodedFileName}`;
    // }
  }

  async createReceipt(
    user: UserDTO,
    uploadReceiptDto: UploadReceiptDTO,
    { OCRName, OCRBuffer, OCRMimetype },
  ) {
    this.logger.verbose(`${ReceiptService.name} - createReceipt`);
    const { memberCode, companyCode } = user;

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
      await this.receiptRepository.createReceipt({
        ...uploadReceiptDto,
        numberOfPeople: Number(uploadReceiptDto.numberOfPeople),
        price: Number(uploadReceiptDto.price),
        memberCode,
        imgPath,
        companyCode,
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

  async deleteReciept(body: DeleteReceiptDTO) {
    this.logger.verbose(`${ReceiptService.name} - deleteReciept`);
    return await this.receiptRepository.deleteReciept(body);
  }
}
