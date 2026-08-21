import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { ProductPlacementController } from './controllers/product-placement.controller';
import { ProductPlacementService } from './services/product-placement.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.WALLET_SERVICE)]),
  ],
  controllers: [WalletController, ProductPlacementController],
  providers: [WalletService, ProductPlacementService],
})
export class WalletModule {}
