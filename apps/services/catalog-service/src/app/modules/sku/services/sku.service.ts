import { SqsConfiguration } from '@common/configurations/sqs.config';
import {
  GetSKURequest,
  IncreaseStockRequest,
} from '@common/interfaces/models/catalog';
import { OrderItemResponse } from '@common/interfaces/models/order';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuidv4 } from 'uuid';
import { SKURepository } from '../repositories/sku.repository';

@Injectable()
export class SKUService {
  constructor(
    private readonly sKURepository: SKURepository,
    private readonly sqsService: SqsService,
  ) {}

  private async sendQueueMessage<T>(queueName: string, body: T) {
    try {
      await this.sqsService.send(queueName, {
        id: uuidv4(),
        body,
        delaySeconds: 0,
      });
    } catch (error) {
      console.error(`Error sending message to ${queueName}:`, error);
      throw new InternalServerErrorException('Error.SendOrderMessageFailed');
    }
  }

  async findById(data: GetSKURequest) {
    const sku = await this.sKURepository.findById(data);
    if (!sku) {
      throw new NotFoundException('Error.SKUNotFound');
    }
    return sku;
  }

  async reserveStock(data: {
    orderId: string;
    items: Array<Pick<OrderItemResponse, 'skuId' | 'productId' | 'quantity'>>;
    userId: string;
  }) {
    const reservation = await this.sKURepository.reserve(data);
    if (reservation.status === 'RESERVED') {
      await Promise.all(
        data.items.map((item) =>
          this.sendQueueMessage(SqsConfiguration.DELETE_CART_ITEM_QUEUE_NAME, {
            productId: item.productId,
            skuId: item.skuId,
            userId: data.userId,
          }),
        ),
      );
    }
    return reservation;
  }

  decreaseStock(data: {
    orderId: string;
    items: Array<Pick<OrderItemResponse, 'skuId' | 'productId' | 'quantity'>>;
    userId: string;
  }) {
    return this.reserveStock(data);
  }

  releaseStock(data: {
    orderId: string;
    userId: string;
    items: Array<{ skuId: string; quantity: number }>;
  }) {
    return this.sKURepository.release(data);
  }

  async increaseStock(data: IncreaseStockRequest) {
    await this.sKURepository.increaseStock(data);
  }
}
