import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CreditController } from './controllers/credit.controller';
import { PayoutController } from './controllers/payout.controller';
import { WalletController } from './controllers/wallet.controller';
import { CreditService } from './services/credit.service';
import { PayoutService } from './services/payout.service';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.WALLET_SERVICE)]),
  ],
  controllers: [WalletController, CreditController, PayoutController],
  providers: [WalletService, CreditService, PayoutService],
})
export class WalletModule {}
