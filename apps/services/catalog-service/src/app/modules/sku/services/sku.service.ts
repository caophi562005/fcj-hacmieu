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

  async decreaseStock(data: { items: OrderItemResponse[]; userId: string }) {
    try {
      await Promise.all(
        data.items.map(async (item) => {
          await this.sKURepository.decreaseStock({
            productId: item.productId,
            value: item.skuValue,
            quantity: item.quantity,
          });

          this.sendQueueMessage(SqsConfiguration.DELETE_CART_ITEM_QUEUE_NAME, {
            productId: item.productId,
            skuId: item.skuId,
            userId: data.userId,
          });

          this.sKURepository.updateProduct({
            id: item.productId,
            soldCount: item.quantity,
          });
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async increaseStock(data: IncreaseStockRequest) {
    try {
      await this.sKURepository.increaseStock(data);
      await Promise.all(
        data.items.map(async (item) => {
          await this.sKURepository.updateProduct({
            id: item.productId,
            soldCount: -item.quantity,
          });
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
