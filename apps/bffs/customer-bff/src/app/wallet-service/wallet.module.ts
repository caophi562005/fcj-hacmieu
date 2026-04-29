import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.WALLET_SERVICE)]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
