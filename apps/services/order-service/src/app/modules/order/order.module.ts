import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
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
  ],
  controllers: [OrderGrpcController],
  providers: [OrderRepository, OrderService],
})
export class OrderModule {}
