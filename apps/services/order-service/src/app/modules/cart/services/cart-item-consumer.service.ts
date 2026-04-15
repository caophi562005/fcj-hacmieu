import { SqsConfiguration } from '@common/configurations/sqs.config';
import { DeleteCartItemRequest } from '@common/interfaces/models/order';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { CartItemService } from './cart-item.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class CartItemConsumerService {
  private readonly logger = new Logger(CartItemConsumerService.name);

  constructor(private readonly cartItemService: CartItemService) {}

  @SqsMessageHandler(SqsConfiguration.DELETE_CART_ITEM_QUEUE_NAME, false)
  async handleDeleteCartItemMessage(message: SqsMessage) {
    const body: DeleteCartItemRequest = message.Body
      ? JSON.parse(message.Body)
      : {};

    await this.cartItemService.delete(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.DELETE_CART_ITEM_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }
}
