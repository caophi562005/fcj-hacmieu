import {
  PAYMENT_SERVICE_PACKAGE_NAME,
  TRANSACTION_MODULE_SERVICE_NAME,
  TransactionModuleClient,
  WebhookTransactionRequest,
  WebhookTransactionResponse,
} from '@common/interfaces/proto-types/payment';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService implements OnModuleInit {
  private transactionModule!: TransactionModuleClient;

  constructor(
    @Inject(PAYMENT_SERVICE_PACKAGE_NAME)
    private readonly paymentClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.transactionModule =
      this.paymentClient.getService<TransactionModuleClient>(
        TRANSACTION_MODULE_SERVICE_NAME,
      );
  }

  async receiver(
    data: WebhookTransactionRequest,
  ): Promise<WebhookTransactionResponse> {
    return firstValueFrom(this.transactionModule.receiver(data));
  }
}
