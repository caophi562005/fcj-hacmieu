import { Global, Module } from '@nestjs/common';
import { ShopGrpcController } from './controllers/shop-grpc.controller';
import { ShopRepository } from './repositories/shop.repository';
import { ShopService } from './services/shop.service';

@Global()
@Module({
  controllers: [ShopGrpcController],
  providers: [ShopRepository, ShopService],
  exports: [ShopService],
})
export class ShopModule {}
