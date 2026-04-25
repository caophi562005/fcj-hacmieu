import { S3Configuration } from '@common/configurations/s3.config';
import { CreatePresignedUrlRequest } from '@common/interfaces/models/utility';
import { generateRandomFileName } from '@common/utils/file-name.util';
import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async createPresignedUrl(body: CreatePresignedUrlRequest) {
    const randomFilename = generateRandomFileName(body.fileName);
    const presignedUrl =
      await this.s3Service.createPresignedUrlWithClient(randomFilename);

    // Tạo public URL để access file sau khi upload
    const endpoint = S3Configuration.S3_ENDPOINT;
    const bucket = S3Configuration.S3_IMAGE_BUCKET;
    const url = `${endpoint}/${bucket}/${randomFilename}`;

    return {
      presignedUrl,
      url,
    };
  }
}
