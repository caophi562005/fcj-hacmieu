import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TransactionController } from './controllers/transaction.controller';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.PAYMENT_SERVICE)]),
  ],
  controllers: [TransactionController],
  providers: [PaymentService],
})
export class PaymentModule {}
