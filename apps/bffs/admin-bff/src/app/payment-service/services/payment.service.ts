import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetPaymentRequest,
  PAYMENT_MODULE_SERVICE_NAME,
  PAYMENT_SERVICE_PACKAGE_NAME,
  PaymentModuleClient,
  PaymentResponse,
  UpdatePaymentStatusRequest,
} from '@common/interfaces/proto-types/payment';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentModule!: PaymentModuleClient;

  constructor(
    @Inject(PAYMENT_SERVICE_PACKAGE_NAME)
    private readonly paymentClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentModule = this.paymentClient.getService<PaymentModuleClient>(
      PAYMENT_MODULE_SERVICE_NAME,
    );
  }

  async getManyPayments(
    data: GetManyPaymentsRequest,
  ): Promise<GetManyPaymentsResponse> {
    return firstValueFrom(this.paymentModule.getManyPayments(data));
  }

  async getPayment(data: GetPaymentRequest): Promise<PaymentResponse> {
    return firstValueFrom(this.paymentModule.getPayment(data));
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    return firstValueFrom(this.paymentModule.createPayment(data));
  }

  async updatePaymentStatus(
    data: UpdatePaymentStatusRequest,
  ): Promise<PaymentResponse> {
    return firstValueFrom(this.paymentModule.updatePaymentStatus(data));
  }
}
