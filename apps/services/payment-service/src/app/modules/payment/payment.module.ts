import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { SqsModule } from '@ssut/nestjs-sqs';
import { PaymentGrpcController } from './controllers/payment-grpc.controller';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentConsumerService } from './services/payment-consumer.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.ORDER_SERVICE)]),
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.CREATE_PAYMENT_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_PAYMENT_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [PaymentGrpcController],
  providers: [PaymentRepository, PaymentService, PaymentConsumerService],
})
export class PaymentModule {}
