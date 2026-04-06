import {
  CANCEL_PAYMENT_JOB_NAME,
  PAYMENT_QUEUE_NAME,
} from '@common/constants/payment.constant';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PaymentService } from '../services/payment.service';

@Processor(PAYMENT_QUEUE_NAME)
export class PaymentQueue extends WorkerHost {
  constructor(private readonly paymentService: PaymentService) {
    super();
  }
  async process(job: Job<{ paymentId: string }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_PAYMENT_JOB_NAME: {
        const { paymentId } = job.data;
        await this.paymentService.delete({ id: paymentId });
        // this.kafkaService.emit(QueueTopics.PAYMENT.CANCEL_ORDER_BY_PAYMENT, {
        //   paymentId,
        // });
        console.log('cancel: ', paymentId);
        return {};
      }
      default: {
        break;
      }
    }
  }
}
