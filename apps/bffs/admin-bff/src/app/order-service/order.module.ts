import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.ORDER_SERVICE)]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
