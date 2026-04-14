import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PaymentController } from './controllers/payment.controller';
import { RefundController } from './controllers/refund.controller';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.PAYMENT_SERVICE)]),
  ],
  controllers: [PaymentController, RefundController],
  providers: [PaymentService],
})
export class PaymentModule {}
