import { QueueTopics } from '@common/constants/queue.constant';
import { CreatePaymentRequest } from '@common/interfaces/models/payment';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentService } from '../services/payment.service';

@Controller()
export class PaymentConsumerController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern(QueueTopics.ORDER.CREATE_PAYMENT_BY_ORDER)
  createPayment(@Payload() payload: CreatePaymentRequest) {
    return this.paymentService.create(payload);
  }
}
