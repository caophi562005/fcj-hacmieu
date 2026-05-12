import {
  CreatePaymentRequest,
  GetPaymentRequest,
  PAYMENT_MODULE_SERVICE_NAME,
  PAYMENT_SERVICE_PACKAGE_NAME,
  PaymentModuleClient,
  PaymentResponse,
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
  private paymentModule!: PaymentModuleClient;
  private transactionModule!: TransactionModuleClient;

  constructor(
    @Inject(PAYMENT_SERVICE_PACKAGE_NAME)
    private readonly paymentClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentModule = this.paymentClient.getService<PaymentModuleClient>(
      PAYMENT_MODULE_SERVICE_NAME,
    );
    this.transactionModule =
      this.paymentClient.getService<TransactionModuleClient>(
        TRANSACTION_MODULE_SERVICE_NAME,
      );
  }

  async getPayment(data: GetPaymentRequest): Promise<PaymentResponse> {
    return firstValueFrom(this.paymentModule.getPayment(data));
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    return firstValueFrom(this.paymentModule.createPayment(data));
  }

  async receiver(
    data: WebhookTransactionRequest,
  ): Promise<WebhookTransactionResponse> {
    return firstValueFrom(this.transactionModule.receiver(data));
  }
}
