import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { NotificationStreamService } from './notification-stream.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class NotificationConsumerService {
  private readonly logger = new Logger(NotificationConsumerService.name);

  constructor(
    private readonly notificationStreamService: NotificationStreamService,
  ) {}

  @SqsMessageHandler(SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME, false)
  async handleSendNotificationMessage(message: SqsMessage) {
    const body = message.Body ? JSON.parse(message.Body) : null;

    if (!body) {
      this.logger.warn(
        `Received invalid message from ${SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
      );
      return;
    }

    this.notificationStreamService.publish(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }
}
