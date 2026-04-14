import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetRefundRequest,
  UpdateRefundStatusRequest,
} from '@common/interfaces/models/payment';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RefundService } from '../services/refund.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class RefundGrpcController {
  constructor(private readonly refundService: RefundService) {}

  @GrpcMethod(GrpcModuleName.PAYMENT.REFUND, 'GetManyRefunds')
  getManyRefunds(data: GetManyRefundsRequest) {
    return this.refundService.list(data);
  }

  @GrpcMethod(GrpcModuleName.PAYMENT.REFUND, 'GetRefund')
  getRefund(data: GetRefundRequest) {
    return this.refundService.getOne(data);
  }

  @GrpcMethod(GrpcModuleName.PAYMENT.REFUND, 'CreateRefund')
  createRefund(data: CreateRefundRequest) {
    return this.refundService.create(data);
  }

  @GrpcMethod(GrpcModuleName.PAYMENT.REFUND, 'UpdateRefundStatus')
  updateRefundStatus(data: UpdateRefundStatusRequest) {
    return this.refundService.updateStatus(data);
  }
}
