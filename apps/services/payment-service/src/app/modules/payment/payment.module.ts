import { PAYMENT_QUEUE_NAME } from '@common/constants/payment.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { PaymentGrpcController } from './controllers/payment-grpc.controller';
import { PaymentProducer } from './producers/payment.producer';
import { PaymentQueue } from './queues/payment.queue';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENT_QUEUE_NAME })],
  controllers: [PaymentGrpcController],
  providers: [PaymentRepository, PaymentService, PaymentProducer, PaymentQueue],
  exports: [PaymentProducer],
})
export class PaymentModule {}
