import { Module } from '@nestjs/common';
import { PaymentModule } from './modules/payment/payment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, PaymentModule, TransactionModule],
})
export class AppModule {}
