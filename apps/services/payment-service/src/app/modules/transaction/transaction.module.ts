import { Module } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { TransactionGrpcController } from './controllers/transaction-grpc.controller';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [PaymentModule],
  controllers: [TransactionGrpcController],
  providers: [TransactionRepository, TransactionService],
})
export class TransactionModule {}
