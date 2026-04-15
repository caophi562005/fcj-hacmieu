import { BaseConfiguration } from '@common/configurations/base.config';
import { RedisConfiguration } from '@common/configurations/redis.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { PAYMENT_QUEUE_NAME } from '@common/constants/payment.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { PaymentGrpcController } from './controllers/payment-grpc.controller';
import { PaymentProducer } from './producers/payment.producer';
import { PaymentQueue } from './queues/payment.queue';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentConsumerService } from './services/payment-consumer.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
      connection: {
        url: RedisConfiguration.REDIS_URL,
      },
    }),
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
  providers: [
    PaymentRepository,
    PaymentService,
    PaymentProducer,
    PaymentQueue,
    PaymentConsumerService,
  ],
  exports: [PaymentProducer],
})
export class PaymentModule {}
