import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { S3Service } from '../media/services/s3.service';
import { VideoGrpcController } from './controllers/video-grpc.controller';
import { VideoRepository } from './repositories/video.repository';
import { VideoStatusConsumerService } from './services/video-status-consumer.service';
import { VideoService } from './services/video.service';

@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.UPDATE_VIDEO_STATUS_QUEUE_NAME,
          queueUrl: SqsConfiguration.UPDATE_VIDEO_STATUS_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [VideoGrpcController],
  providers: [
    VideoRepository,
    VideoService,
    VideoStatusConsumerService,
    S3Service,
  ],
  exports: [VideoService],
})
export class VideoModule {}
