import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetManyRefundsResponse,
  GetRefundRequest,
  PAYMENT_SERVICE_PACKAGE_NAME,
  REFUND_MODULE_SERVICE_NAME,
  RefundModuleClient,
  RefundResponse,
  UpdateRefundStatusRequest,
} from '@common/interfaces/proto-types/payment';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RefundService implements OnModuleInit {
  private refundModule!: RefundModuleClient;

  constructor(
    @Inject(PAYMENT_SERVICE_PACKAGE_NAME)
    private readonly paymentClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.refundModule = this.paymentClient.getService<RefundModuleClient>(
      REFUND_MODULE_SERVICE_NAME,
    );
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
