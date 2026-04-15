import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SKUGrpcController } from './controllers/sku-grpc.controller';
import { SKURepository } from './repositories/sku.repository';
import { SKUConsumerService } from './services/sku-consumer.service';
import { SKUService } from './services/sku.service';

@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.CREATE_ORDER_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_ORDER_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
      producers: [
        {
          name: SqsConfiguration.DELETE_CART_ITEM_QUEUE_NAME,
          queueUrl: SqsConfiguration.DELETE_CART_ITEM_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [SKUGrpcController],
  providers: [SKURepository, SKUService, SKUConsumerService],
})
export class SKUModule {}
