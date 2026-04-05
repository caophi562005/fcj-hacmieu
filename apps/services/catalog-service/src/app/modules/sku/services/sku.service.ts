import { GetSKURequest } from '@common/interfaces/models/catalog';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SKURepository } from '../repositories/sku.repository';

@Injectable()
export class SKUService {
  constructor(private readonly sKURepository: SKURepository) {}

  async findById(data: GetSKURequest) {
    const sku = await this.sKURepository.findById(data);
    if (!sku) {
      throw new NotFoundException('Error.SKUNotFound');
    }
    return sku;
  }

  // async decreaseStock(data: { items: OrderItemResponse[]; userId: string }) {
  //   try {
  //     await Promise.all(
  //       data.items.map(async (item) => {
  //         await this.sKURepository.decreaseStock({
  //           productId: item.productId,
  //           value: item.skuValue,
  //           quantity: item.quantity,
  //         });
  //         this.kafkaService.emit(QueueTopics.PRODUCT.STOCK_DECREASE, {
  //           productId: item.productId,
  //           skuId: item.skuId,
  //           userId: data.userId,
  //         });

  //         const product = await this.sKURepository.updateProduct({
  //           id: item.productId,
  //           soldCount: item.quantity,
  //         });
  //         this.kafkaService.emit(QueueTopics.PRODUCT.UPDATE_PRODUCT, product);
  //       })
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async increaseStock(data: IncreaseStockRequest) {
  //   try {
  //     await this.sKURepository.increaseStock(data);
  //     await Promise.all(
  //       data.items.map(async (item) => {
  //         const product = await this.sKURepository.updateProduct({
  //           id: item.productId,
  //           soldCount: -item.quantity,
  //         });
  //         this.kafkaService.emit(QueueTopics.PRODUCT.UPDATE_PRODUCT, product);
  //       })
  //     );
  //   } catch (error) {}
  // }
}
