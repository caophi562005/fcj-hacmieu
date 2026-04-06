import { RedisConfiguration } from '@common/configurations/redis.config';
import {
  CANCEL_PAYMENT_JOB_NAME,
  PAYMENT_QUEUE_NAME,
} from '@common/constants/payment.constant';
import { generateCancelPaymentJobId } from '@common/utils/bullmq.util';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import ms, { StringValue } from 'ms';

@Injectable()
export class PaymentProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {}

  async cancelPaymentJob(paymentId: string) {
    console.log('add queue');
    await this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      { paymentId },
      {
        delay: ms(RedisConfiguration.PAYMENT_TTL as StringValue),
        jobId: generateCancelPaymentJobId(paymentId),
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  removeJob(paymentId: string) {
    console.log('remove queue');
    return this.paymentQueue.remove(generateCancelPaymentJobId(paymentId));
  }
}
