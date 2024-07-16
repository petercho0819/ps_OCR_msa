import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

describe('FileUploadController', () => {
  let fileUploadController: FileUploadController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [FileUploadService],
    }).compile();

    fileUploadController = app.get<FileUploadController>(FileUploadController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fileUploadController.getHello()).toBe('Hello World!');
    });
  });
});
