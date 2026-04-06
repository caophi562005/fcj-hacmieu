import {
  WebhookTransactionRequest,
  WebhookTransactionResponse,
} from '@common/interfaces/models/payment/transaction';
import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async receiver(
    data: WebhookTransactionRequest,
  ): Promise<WebhookTransactionResponse> {
    const transaction = await this.transactionRepository.receiver(data);
    // this.kafkaService.emit(QueueTopics.ORDER.PAID_ORDER, {
    //   paymentId: transaction.paymentId,
    // });

    // await this.redisService.publish(
    //   RedisChannel.PAYMENT_CHANNEL,
    //   JSON.stringify(transaction)
    // );
    return transaction;
  }
}
