import { S3Client } from '@aws-sdk/client-s3';
import z from 'zod';
import { BaseConfiguration } from './base.config';

export const s3ConfigurationSchema = z.object({
  S3_ENDPOINT: z.string(),
  S3_IMAGE_BUCKET: z.string(),
  S3_VIDEO_BUCKET: z.string(),
});

export enum S3Bucket {
  IMAGE_BUCKET = 'IMAGE_BUCKET',
  VIDEO_BUCKET = 'VIDEO_BUCKET',
}

const configServer = s3ConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const S3Configuration = configServer.data;

export const S3Provider = (bucketName: S3Bucket) => {
  const client = new S3Client({
    region: BaseConfiguration.AWS_REGION,
  });

  const bucket = S3Configuration[`S3_${bucketName}`];

  return { client, bucket };
};
