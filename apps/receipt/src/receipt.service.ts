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
import { DownloadReceiptDTO } from './dto/download-receipt.dto';
import * as ExcelJS from 'exceljs';
import { DINNER_FEE, TAXI_FEE } from './constant';

@Injectable()
export class ReceiptService {
  @Inject(COMPANY_SERVICE) private readonly companyService: ClientProxy;

  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly httpService: HttpService,
    private readonly amazonService: AmazonService,
  ) {}

  async getReceiptDetailById(_id: string) {
    this.logger.verbose(`${ReceiptService.name} - getReceiptDetailById`);
    return await this.receiptRepository.getReceiptDetailById(_id);
  }

  async downloadReceiptByExcel(user: UserDTO, body: DownloadReceiptDTO) {
    this.logger.verbose(`${ReceiptService.name} - getReceiptByYearAndMonth`);
    const { companyCode, memberCode } = user;
    const { year, month } = body;
    const receipt =
      await this.receiptRepository.getReceiptByYearAndMonthByExcel(
        year,
        month,
        companyCode,
        memberCode,
      );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${year} - ${month}`);
    const columns = [
      { header: '일자', key: 'receiptDate', width: 20 },
      { header: '항목', key: 'receiptType', width: 20 },
      { header: '가격', key: 'price', width: 10 },
      { header: '이름', key: 'name', width: 30 },
      { header: '식대 인원', key: 'numberOfPeople', width: 10 },
      { header: '메모', key: 'memo', width: 20 },
      // { header: '영수증', key: 'imgPath', width: 20 },
    ];
    worksheet.columns = columns;
    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    receipt.forEach((detail) => {
      const row = worksheet.addRow({
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
        // imgPath: detail.imgPath,
      });
      // 셀 스타일을 개별적으로 설정
      row.eachCell((cell, colNumber) => {
        if (colNumber === 16) {
          // Note 열 (1-based index)
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    console.log(
      '🚀 ~ ReceiptService ~ downloadReceiptByExcel ~ buffer:',
      buffer,
    );
    return buffer;
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
