import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { NotificationGrpcController } from './controllers/notification-grpc.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    SqsModule.register({
      producers: [
        {
          name: SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME,
          queueUrl: SqsConfiguration.SEND_NOTIFICATION_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [NotificationGrpcController],
  providers: [NotificationRepository, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
