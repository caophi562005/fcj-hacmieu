import { SqsConfiguration } from '@common/configurations/sqs.config';
import { OrderItemResponse } from '@common/interfaces/models/order';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { SKUService } from './sku.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class SKUConsumerService {
  private readonly logger = new Logger(SKUConsumerService.name);

  constructor(private readonly sKUService: SKUService) {}

  @SqsMessageHandler(SqsConfiguration.CREATE_ORDER_QUEUE_NAME, false)
  async handleCreateOrderMessage(message: SqsMessage) {
    const body: { items: OrderItemResponse[]; userId: string } = message.Body
      ? JSON.parse(message.Body)
      : {};

    await this.sKUService.decreaseStock(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.CREATE_ORDER_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }
}
