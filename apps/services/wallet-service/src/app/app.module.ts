import { Module } from '@nestjs/common';
import { WalletModule } from './modules/wallet/wallet.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, WalletModule],
})
export class AppModule {}
