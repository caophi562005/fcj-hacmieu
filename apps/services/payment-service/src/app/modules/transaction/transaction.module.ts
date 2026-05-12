import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PaymentModule } from '../payment/payment.module';
import { TransactionGrpcController } from './controllers/transaction-grpc.controller';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [
    PaymentModule,
    ClientsModule.register([
      GrpcClientProvider(GrpcService.ORDER_SERVICE),
      GrpcClientProvider(GrpcService.WALLET_SERVICE),
    ]),
  ],
  controllers: [TransactionGrpcController],
  providers: [TransactionRepository, TransactionService],
})
export class TransactionModule {}
