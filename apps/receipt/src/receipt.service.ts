import { Inject, Injectable, Logger } from '@nestjs/common';
import { AmazonService } from '@app/common/amazon/amazon.service';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NaverOcrDTO } from './interface';
import { ReceiptRepository } from './schemas/receipt.repository';
import { AUTH_SERVICE, COMPANY_SERVICE, UserDTO } from '@app/common';
import { DeleteReceiptDTO } from './dto/delete-receipt.dto';
import { UploadReceiptDTO } from './dto/upload-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import { DownloadReceiptDTO } from './dto/download-receipt.dto';
import * as ExcelJS from 'exceljs';
import { DINNER_FEE, TAXI_FEE } from './constant';
import { getGenerateCode } from 'apps/auth/src/function';

@Injectable()
export class ReceiptService {
  @Inject(COMPANY_SERVICE) private readonly companyService: ClientProxy;
  @Inject(AUTH_SERVICE) private readonly userService: ClientProxy;

  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly httpService: HttpService,
    private readonly amazonService: AmazonService,
  ) {}

  async getReceiptByYearAndMonthByAdmin(
    user: UserDTO,
    searchValue: string,
    page: number,
    limit: number,
    year: string,
    month: string,
  ) {
    this.logger.verbose(
      `${ReceiptService.name} - getReceiptByYearAndMonthByAdmin`,
    );
    const { companyCode } = user;
    const receipt =
      await this.receiptRepository.getReceiptByYearAndMonthByAdmin(
        searchValue,
        page,
        limit,
        year,
        month,
        companyCode,
      );

    const userCodes = [...new Set(receipt.map((v) => v.memberCode))];
    console.log('this.userService', this.userService);
    const result = await forkJoin({
      receipts: Promise.resolve(receipt),
      users: this.userService.send('get_user_by_user_code', userCodes).pipe(
        tap((res) => {
          this.logger.debug(`Fetched user data: ${JSON.stringify(res)}`);
        }),
        map((users) => {
          const userMap = new Map(users.map((user) => [user.memberCode, user]));
          return userMap;
        }),
      ),
    })
      .pipe(
        map(({ receipts, users }) => {
          return receipts.map((receipt) => {
            const user: any = users.get(receipt.memberCode);
            return {
              ...receipt,
              userName: user ? user.name : '',
              userEmail: user ? user.email : '',
              companyName: user ? user.companyName : '',
            };
          });
        }),
      )
      .toPromise();

    const resultMap = new Map();

    result.forEach((item) => {
      const {
        memberCode,
        userName,
        isApprove,
        userEmail,
        name,
        price,
        receiptDate,
        receiptType,
        numberOfPeople,
        memo,
        imgPath,
      } = item;

      if (!resultMap.has(memberCode)) {
        // 새로운 memberCode에 대한 엔트리 생성
        resultMap.set(memberCode, {
          memberCode,
          userName,
          userEmail,
          isApprove,
          excelData: [],
        });
      }

      // excelData 배열에 새로운 항목 추가
      resultMap.get(memberCode).excelData.push({
        name,
        price,
        receiptDate,
        receiptType,
        numberOfPeople,
        memo,
        imgPath,
      });
    });

    // Map을 배열로 변환하여 최종 결과 생성
    return Array.from(resultMap.values());
  }

  async getReceiptDetailById(_id: string) {
    this.logger.verbose(`${ReceiptService.name} - getReceiptDetailById`);
    return await this.receiptRepository.getReceiptDetailById(_id);
  }

  async downloadReceiptByExcel(user: UserDTO, body: DownloadReceiptDTO) {
    this.logger.verbose(`${ReceiptService.name} - downloadReceiptByExcel`);
    const { companyCode, memberCode } = user;
    const { year, month } = body;
    const receipt =
      await this.receiptRepository.getReceiptByYearAndMonthByExcel(
        year,
        month,
        companyCode,
        memberCode,
      );
    return receipt.map((detail) => {
      return {
        receiptDate: detail.receiptDate,
        receiptType:
          detail.receiptType === DINNER_FEE
            ? '저녁 식대'
            : detail.receiptType === TAXI_FEE
            ? '택시비'
            : '기타',
        price: detail.price,
        numberOfPeople: detail.numberOfPeople,
        name: detail.name,
        memo: detail.memo,
        imgPath: detail.imgPath,
      };
    });
  }

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

  async updateReceipt(
    user: UserDTO,
    body,
    { OCRName, OCRBuffer, OCRMimetype },
  ) {
    this.logger.verbose(`${ReceiptService.name} - updateReceipt`);
    const { companyCode } = user;

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
    } else {
      const result = await this.receiptRepository.getReceiptDetailById(
        body._id,
      );
      imgPath = result.imgPath;
    }

    return await this.receiptRepository.updateReceipt({
      ...body,
      imgPath,
      receiptDate: moment(body.receiptDate).format('YYYY-MM-DD'),
      year: moment(body.receiptDate).format('YYYY'),
      month: moment(body.receiptDate).format('MM'),
    });
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
      if (OCRName && OCRBuffer) {
        const key = `receipt_${moment().format(
          'YYYY-MM-DD HH:mm:ss:SSS',
        )}_${getGenerateCode()}`;
        const uploadResult = await this.amazonService.uploadFile(
          key,
          OCRBuffer,
          OCRMimetype,
          'ocrImage',
        );

        if (uploadResult.Location) {
          imgPath = uploadResult.Location;
        } else {
          throw new Error('Failed to get upload location from S3');
        }
      }
      // 2. db에 저장
      await this.receiptRepository.createReceipt({
        ...uploadReceiptDto,
        numberOfPeople: Number(uploadReceiptDto.numberOfPeople),
        price: Number(uploadReceiptDto.price),
        memberCode,
        imgPath,
        receiptDate: moment(uploadReceiptDto.receiptDate).format('YYYY-MM-DD'),
        year: moment(uploadReceiptDto.receiptDate).format('YYYY'),
        month: moment(uploadReceiptDto.receiptDate).format('MM'),
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
      // const base64Encoded = data.toString('base64');

      // const naverOcrDto: NaverOcrDTO = {
      //   images: [
      //     {
      //       format: OCRMimetype.split('/')[1],
      //       name: OCRName,
      //       data: base64Encoded,
      //     },
      //   ],
      //   requestId: uuidv4(),
      //   version: 'V2',
      //   timestamp: moment().unix(),
      // };

      // const result2 = await this.httpService.axiosRef.post(
      //   process.env.NAVER_OCR_URL_FOR_RECIPT,
      //   naverOcrDto,
      //   {
      //     headers: {
      //       'X-OCR-SECRET': process.env.X_OCR_SECRET_FOR_RECEIPT,
      //       'Content-Type': 'application/json',
      //     },
      //   },
      // );

      // const money =
      //   result2?.data?.images?.[0].receipt?.result?.totalPrice?.price?.formatted
      //     ?.value || 0;
      // const year =
      //   result2?.data?.images?.[0].receipt?.result?.paymentInfo?.date?.formatted
      //     ?.year || '';
      // const month =
      //   result2?.data?.images?.[0].receipt?.result?.paymentInfo?.date?.formatted
      //     ?.month || '';
      // const day =
      //   result2?.data?.images?.[0].receipt?.result?.paymentInfo?.date?.formatted
      //     ?.day || '';
      // return {
      //   totalPrice: money,
      //   date: `${year}-${month}-${day}`,
      // };
    } catch (e) {
      this.logger.error(e);
    }
  }

  async deleteReceipt(body: DeleteReceiptDTO) {
    this.logger.verbose(`${ReceiptService.name} - deleteReceipt`);
    return await this.receiptRepository.deleteReceipt(body);
  }
}
