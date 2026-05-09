import { Module } from '@nestjs/common';
import { CreditModule } from './modules/credit/credit.module';
import { PayoutModule } from './modules/payout/payout.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, WalletModule, CreditModule, PayoutModule],
})
export class AppModule {}
