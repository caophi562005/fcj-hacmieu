import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { SqsModule } from '@ssut/nestjs-sqs';
import { CartGrpcController } from './controllers/cart-grpc.controller';
import { CartItemRepository } from './repositories/cart-item.repository';
import { CartRepository } from './repositories/cart.repository';
import { CartItemConsumerService } from './services/cart-item-consumer.service';
import { CartItemService } from './services/cart-item.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.CATALOG_SERVICE)]),
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.DELETE_CART_ITEM_QUEUE_NAME,
          queueUrl: SqsConfiguration.DELETE_CART_ITEM_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [CartGrpcController],
  providers: [
    CartItemRepository,
    CartRepository,
    CartItemService,
    CartItemConsumerService,
  ],
  exports: [CartItemService],
})
export class CartModule {}
