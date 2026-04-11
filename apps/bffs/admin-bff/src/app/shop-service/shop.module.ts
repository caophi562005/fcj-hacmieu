import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MerchantController } from './controllers/merchant.controller';
import { ShopController } from './controllers/shop.controller';
import { MerchantService } from './services/merchant.service';
import { ShopService } from './services/shop.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.SHOP_SERVICE)]),
  ],
  controllers: [MerchantController, ShopController],
  providers: [MerchantService, ShopService],
})
export class ShopModule {}
