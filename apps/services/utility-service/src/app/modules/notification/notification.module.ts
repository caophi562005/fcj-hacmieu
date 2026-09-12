import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { NotificationGrpcController } from './controllers/notification-grpc.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationCommandConsumerService } from './services/notification-command-consumer.service';

@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.NOTIFICATION_COMMAND_QUEUE_NAME,
          queueUrl: SqsConfiguration.NOTIFICATION_COMMAND_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
      producers: [
        {
          name: SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME,
          queueUrl: SqsConfiguration.SEND_NOTIFICATION_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
        {
          name: SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME,
          queueUrl: SqsConfiguration.CANCELLATION_RESULT_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [NotificationGrpcController],
  providers: [
    NotificationRepository,
    NotificationService,
    NotificationCommandConsumerService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
