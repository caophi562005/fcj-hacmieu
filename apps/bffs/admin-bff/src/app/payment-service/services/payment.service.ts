import {
  CreatePaymentRequest,
  CreateRefundRequest,
  DashboardPaymentRequest,
  DashboardPaymentResponse,
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetManyRefundsRequest,
  GetManyRefundsResponse,
  GetPaymentRequest,
  GetRefundRequest,
  PAYMENT_MODULE_SERVICE_NAME,
  PAYMENT_SERVICE_PACKAGE_NAME,
  PaymentModuleClient,
  PaymentResponse,
  REFUND_MODULE_SERVICE_NAME,
  RefundModuleClient,
  RefundResponse,
  UpdatePaymentStatusRequest,
  UpdateRefundStatusRequest,
} from '@common/interfaces/proto-types/payment';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentModule!: PaymentModuleClient;
  private refundModule!: RefundModuleClient;

  constructor(
    @Inject(PAYMENT_SERVICE_PACKAGE_NAME)
    private readonly paymentClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentModule = this.paymentClient.getService<PaymentModuleClient>(
      PAYMENT_MODULE_SERVICE_NAME,
    );
    this.refundModule = this.paymentClient.getService<RefundModuleClient>(
      REFUND_MODULE_SERVICE_NAME,
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

  async dashboardPayment(
    data: DashboardPaymentRequest,
  ): Promise<DashboardPaymentResponse> {
    return firstValueFrom(this.paymentModule.dashboardPayment(data));
  }

  async getManyRefunds(
    data: GetManyRefundsRequest,
  ): Promise<GetManyRefundsResponse> {
    return firstValueFrom(this.refundModule.getManyRefunds(data));
  }

  async getRefund(data: GetRefundRequest): Promise<RefundResponse> {
    return firstValueFrom(this.refundModule.getRefund(data));
  }

  async createRefund(data: CreateRefundRequest): Promise<RefundResponse> {
    return firstValueFrom(this.refundModule.createRefund(data));
  }

  async updateRefundStatus(
    data: UpdateRefundStatusRequest,
  ): Promise<RefundResponse> {
    return firstValueFrom(this.refundModule.updateRefundStatus(data));
  }
}
