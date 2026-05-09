import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetPaymentRequest,
  UpdatePaymentStatusRequest,
} from '@common/interfaces/models/payment';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from '../services/payment.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class PaymentGrpcController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod(GrpcModuleName.PAYMENT.PAYMENT, 'GetManyPayments')
  getManyPayments(data: GetManyPaymentsRequest) {
    return this.paymentService.list(data);
  }

  @GrpcMethod(GrpcModuleName.PAYMENT.PAYMENT, 'GetPayment')
  getPayment(data: GetPaymentRequest) {
    return this.paymentService.getOne(data);
  }

  @GrpcMethod(GrpcModuleName.PAYMENT.PAYMENT, 'CreatePayment')
  createPayment(data: CreatePaymentRequest) {
    return this.paymentService.create(data);
  }

  @GrpcMethod(GrpcModuleName.PAYMENT.PAYMENT, 'UpdatePaymentStatus')
  updatePaymentStatus(data: UpdatePaymentStatusRequest) {
    return this.paymentService.updateStatus(data);
  }
}
