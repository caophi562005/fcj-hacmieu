import { Global, Module } from '@nestjs/common';
import { WalletGrpcController } from './controllers/wallet-grpc.controller';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletService } from './services/wallet.service';

@Global()
@Module({
  controllers: [WalletGrpcController],
  providers: [WalletRepository, WalletService],
  exports: [WalletService],
})
export class WalletModule {}
