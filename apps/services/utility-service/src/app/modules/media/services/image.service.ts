import { S3Configuration } from '@common/configurations/s3.config';
import { ImageTypeValues } from '@common/constants/media.constant';
import { CreatePresignedUrlRequest } from '@common/interfaces/models/utility';
import { generateRandomFileName } from '@common/utils/file-name.util';
import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async createPresignedUrl(body: CreatePresignedUrlRequest) {
    const { userId, type, fileName } = body;

    // Với AVATAR: cố định tên file là `avatar{ext}` để ghi đè ảnh cũ.
    // Các loại khác: tên file random để tránh trùng.
    const ext = fileName.split('.').pop();
    const finalFileName =
      type === ImageTypeValues.AVATAR
        ? `avatar.${ext}`
        : generateRandomFileName(fileName);

    const folder = type.toLowerCase();
    const key = `${userId}/${folder}/${finalFileName}`;

    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(key);

    // Tạo public URL để access file sau khi upload
    const endpoint = S3Configuration.S3_ENDPOINT;
    const bucket = S3Configuration.S3_IMAGE_BUCKET;
    const url = `${endpoint}/${key}`;

    return {
      presignedUrl,
      url,
    };
  }
}
