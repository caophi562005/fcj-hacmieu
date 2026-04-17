import { Module } from '@nestjs/common';
import { MediaGrpcController } from './controllers/image-grpc.controller';
import { MediaService } from './services/image.service';
import { S3Service } from './services/s3.service';

@Module({
  controllers: [MediaGrpcController],
  providers: [S3Service, MediaService],
})
export class MediaModule {}
