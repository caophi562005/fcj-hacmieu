import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable, Logger } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class PaymentConsumerService {
  private readonly logger = new Logger(PaymentConsumerService.name);

  @SqsMessageHandler(SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME, false)
  async handleCreatePaymentMessage(message: SqsMessage) {
    this.logger.log(
      `Received message from ${SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
    this.logger.log(`Payload: ${message.Body ?? '{}'}`);
  }

  @SqsConsumerEventHandler(
    SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME,
    'processing_error',
  )
  onProcessingError(error: Error, message: SqsMessage) {
    this.logger.error(
      `SQS processing error for ${message.MessageId ?? 'unknown-id'}: ${error.message}`,
    );
  }
}
