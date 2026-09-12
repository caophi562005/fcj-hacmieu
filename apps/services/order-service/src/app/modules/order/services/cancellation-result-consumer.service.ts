import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { OrderRepository } from '../repositories/order.repository';

type SqsMessage = { MessageId?: string; Body?: string };

@Injectable()
export class CancellationResultConsumerService {
  private readonly logger = new Logger(CancellationResultConsumerService.name);

  constructor(private readonly repository: OrderRepository) {}

  @SqsMessageHandler(SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME, false)
  async handle(message: SqsMessage) {
    if (!message.Body) throw new Error('Empty cancellation result message');
    const envelope = JSON.parse(message.Body) as {
      version: 1;
      eventId: string;
      eventType: 'CANCELLATION_EFFECT_COMPLETED' | 'CANCELLATION_EFFECT_FAILED';
      payload: {
        cancellationId: string;
        effect: string;
        detail?: string;
        paymentStatus?: 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
      };
    };
    await this.repository.recordCancellationResult({
      ...envelope.payload,
      status:
        envelope.eventType === 'CANCELLATION_EFFECT_COMPLETED'
          ? 'COMPLETED'
          : 'FAILED',
    });
    this.logger.log(`Applied cancellation result ${envelope.eventId}`);
  }
}
