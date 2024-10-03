import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigProps } from './amazon.module';
import { AMAZON_AWS_CONFIG } from '../constant';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';

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
    key: string,
    file: Buffer,
    mimetype: string,
    folder: 'pdf' | 'ocrImage',
  ) {
    this.logger.verbose(`${AmazonService.name} : uploadFile`);

    const stream = Readable.from(file);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: folder + '/' + key,
        Body: stream,
        ContentType: mimetype,
        ACL: 'public-read',
      },
    });

    try {
      const result = await upload.done();
      return result;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
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
