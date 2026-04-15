import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { SqsModule } from '@ssut/nestjs-sqs';
import { CartModule } from '../cart/cart.module';
import { OrderGrpcController } from './controllers/order-grpc.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    CartModule,
    ClientsModule.register([
      GrpcClientProvider(GrpcService.CATALOG_SERVICE),
      GrpcClientProvider(GrpcService.PROMOTION_SERVICE),
    ]),
    SqsModule.register({
      producers: [
        {
          name: SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_PAYMENT_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
        {
          name: SqsConfiguration.CREATE_REDEMPTION_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_REDEMPTION_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
        {
          name: SqsConfiguration.CREATE_ORDER_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_ORDER_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [OrderGrpcController],
  providers: [OrderRepository, OrderService],
})
export class OrderModule {}
