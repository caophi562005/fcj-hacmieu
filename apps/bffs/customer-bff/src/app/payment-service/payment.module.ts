import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PaymentController } from './controllers/payment.controller';
import { TransactionController } from './controllers/transaction.controller';
import { PaymentStreamService } from './services/payment-stream.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.PAYMENT_SERVICE)]),
  ],
  controllers: [PaymentController, TransactionController],
  providers: [PaymentService, PaymentStreamService],
})
export class PaymentModule {}
