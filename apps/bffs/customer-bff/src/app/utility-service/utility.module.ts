import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { SqsModule } from '@ssut/nestjs-sqs';
import { MediaController } from './controllers/media.controller';
import { NotificationController } from './controllers/notification.controller';
import { ReportController } from './controllers/report.controller';
import { ReviewController } from './controllers/review.controller';
import { MediaService } from './services/media.service';
import { NotificationConsumerService } from './services/notification-consumer.service';
import { NotificationStreamService } from './services/notification-stream.service';
import { NotificationService } from './services/notification.service';
import { ReportService } from './services/report.service';
import { ReviewService } from './services/review.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.UTILITY_SERVICE)]),
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME,
          queueUrl: SqsConfiguration.SEND_NOTIFICATION_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [
    NotificationController,
    MediaController,
    ReportController,
    ReviewController,
  ],
  providers: [
    NotificationService,
    NotificationConsumerService,
    NotificationStreamService,
    MediaService,
    ReportService,
    ReviewService,
  ],
})
export class UtilityModule {}
