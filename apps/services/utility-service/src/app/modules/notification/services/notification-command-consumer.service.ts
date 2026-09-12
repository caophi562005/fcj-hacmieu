import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsService } from '@ssut/nestjs-sqs';
import { NotificationService } from './notification.service';

type SqsMessage = { Body?: string };

@Injectable()
export class NotificationCommandConsumerService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sqsService: SqsService,
  ) {}

  @SqsMessageHandler(SqsConfiguration.NOTIFICATION_COMMAND_QUEUE_NAME, false)
  async handle(message: SqsMessage) {
    if (!message.Body) throw new Error('Empty notification command');
    const envelope = JSON.parse(message.Body) as {
      version: 1;
      eventId: string;
      eventType: 'ORDER_CANCELLED_NOTIFICATION';
      payload: {
        cancellationId: string;
        orderId: string;
        userId: string;
        sellerUserId: string;
        reasonCode: string;
      };
    };
    if (envelope.eventType !== 'ORDER_CANCELLED_NOTIFICATION') {
      throw new Error(`Unsupported notification command: ${envelope.eventType}`);
    }
    const recipients = [
      { key: 'customer', userId: envelope.payload.userId },
      { key: 'seller', userId: envelope.payload.sellerUserId },
    ];
    await Promise.all(
      recipients.map((recipient) =>
        this.notificationService.createIdempotent({
          dedupeKey: `${envelope.eventId}:${recipient.key}`,
          userId: recipient.userId,
          type: 'ORDER_UPDATE',
          title: 'Đơn hàng đã hủy',
          description: `Đơn hàng đã được hủy (${envelope.payload.reasonCode})`,
          metadata: { orderId: envelope.payload.orderId },
        }),
      ),
    );
    await this.sqsService.send(SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME, {
      id: `${envelope.eventId}:result`,
      body: {
        version: 1,
        eventId: `${envelope.eventId}:result`,
        eventType: 'CANCELLATION_EFFECT_COMPLETED',
        payload: {
          cancellationId: envelope.payload.cancellationId,
          effect: 'NOTIFICATION',
        },
      },
      delaySeconds: 0,
    });
  }
}
