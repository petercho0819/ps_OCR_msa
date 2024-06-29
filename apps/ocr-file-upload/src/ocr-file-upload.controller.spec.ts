import { Test, TestingModule } from '@nestjs/testing';
import { OcrFileUploadController } from './ocr-file-upload.controller';
import { OcrFileUploadService } from './ocr-file-upload.service';

describe('OcrFileUploadController', () => {
  let ocrFileUploadController: OcrFileUploadController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OcrFileUploadController],
      providers: [OcrFileUploadService],
    }).compile();

    ocrFileUploadController = app.get<OcrFileUploadController>(OcrFileUploadController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ocrFileUploadController.getHello()).toBe('Hello World!');
    });
  });
});
