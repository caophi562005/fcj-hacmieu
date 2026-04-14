import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CartGrpcController } from './controllers/cart-grpc.controller';
import { CartItemRepository } from './repositories/cart-item.repository';
import { CartRepository } from './repositories/cart.repository';
import { CartItemService } from './services/cart-item.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.CATALOG_SERVICE)]),
  ],
  controllers: [CartGrpcController],
  providers: [CartItemRepository, CartRepository, CartItemService],
  exports: [CartItemService],
})
export class CartModule {}
