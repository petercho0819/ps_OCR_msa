import { Module } from '@nestjs/common';
import { AmazonService } from './amazon.service';
import { S3ClientConfig } from '@aws-sdk/client-s3';
import { AMAZON_AWS_CONFIG } from '../constant';

export type ConfigProps = S3ClientConfig & { bucket: string };

@Module({})
export class AmazonModule {
  public static init(config) {
    return {
      module: AmazonModule,
      providers: [
        {
          provide: AMAZON_AWS_CONFIG,
          useValue: config,
        },
        AmazonService,
      ],
      exports: [AmazonService],
    };
  }
}
