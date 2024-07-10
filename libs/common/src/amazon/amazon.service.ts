import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigProps } from './amazon.module';
import { AMAZON_AWS_CONFIG } from '../constant';

@Injectable()
export class AmazonService {
  private readonly logger = new Logger('AmazonService');
  private readonly client: S3Client;
  private bucket: string;

  constructor(
    @Inject(AMAZON_AWS_CONFIG)
    private readonly configuration: ConfigProps,
  ) {
    const { bucket, ...config } = this.configuration;
    this.client = new S3Client(config);
    this.bucket = bucket;
  }

  async uploadFile(
    fileName: string,
    file: Buffer,
    type: Express.Multer.File['mimetype'],
    key: 'pdf' | 'ocrImage',
  ) {
    this.logger.verbose(`${AmazonService.name} : uploadFile`);

    const object_upload_params = new PutObjectCommand({
      Bucket: this.bucket,
      ContentType: type,
      ACL: 'public-read', // 파일을 퍼블릭으로 설정
      Key: `${key}/${fileName}`,
      Body: file,
    });

    return await this.client.send(object_upload_params);
  }

  setBucket(bucketName: string) {
    this.bucket = bucketName;
  }

  deleteFile(fileName: string) {
    const object_delete_params = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    });

    return this.client.send(object_delete_params);
  }
}
