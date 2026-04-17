import { SqsConfiguration } from '@common/configurations/sqs.config';
import { CreatePaymentRequest } from '@common/interfaces/models/payment';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { PaymentService } from './payment.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class PaymentConsumerService {
  private readonly logger = new Logger(PaymentConsumerService.name);

  constructor(private readonly paymentService: PaymentService) {}

  @SqsMessageHandler(SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME, false)
  async handleCreatePaymentMessage(message: SqsMessage) {
    const body: CreatePaymentRequest = message.Body
      ? JSON.parse(message.Body)
      : null;

    this.paymentService.create(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }
}
