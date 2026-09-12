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

    await this.paymentService.create(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }

  @SqsMessageHandler(SqsConfiguration.PAYMENT_COMMAND_QUEUE_NAME, false)
  async handlePaymentCommand(message: SqsMessage) {
    if (!message.Body) throw new Error('Empty payment command');
    const envelope = JSON.parse(message.Body) as {
      version: 1;
      eventId: string;
      eventType: 'PAYMENT_CANCEL';
      payload: {
        cancellationId: string;
        orderId: string;
        paymentId: string;
        userId: string;
        amount: number;
        reasonCode: string;
      };
    };
    if (envelope.eventType !== 'PAYMENT_CANCEL') {
      throw new Error(`Unsupported payment command: ${envelope.eventType}`);
    }
    const result = await this.paymentService.cancelOrderPayment({
      eventId: envelope.eventId,
      ...envelope.payload,
    });
    await this.paymentService.sendCancellationResult({
      eventId: envelope.eventId,
      cancellationId: envelope.payload.cancellationId,
      paymentStatus: result,
    });
  }
}
