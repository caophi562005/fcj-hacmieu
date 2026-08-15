import { Global, Module } from '@nestjs/common';
import { PlatformLedgerGrpcController } from './controllers/platform-ledger-grpc.controller';
import { WalletGrpcController } from './controllers/wallet-grpc.controller';
import { PlatformLedgerRepository } from './repositories/platform-ledger.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { PlatformLedgerService } from './services/platform-ledger.service';
import { WalletService } from './services/wallet.service';

@Global()
@Module({
  controllers: [WalletGrpcController, PlatformLedgerGrpcController],
  providers: [
    WalletRepository,
    WalletService,
    PlatformLedgerRepository,
    PlatformLedgerService,
  ],
  exports: [WalletService, PlatformLedgerService],
})
export class WalletModule {}
