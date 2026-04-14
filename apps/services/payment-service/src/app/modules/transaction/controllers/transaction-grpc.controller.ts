import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import { WebhookTransactionRequest } from '@common/interfaces/models/payment/transaction';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TransactionService } from '../services/transaction.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class TransactionGrpcController {
  constructor(private readonly transactionService: TransactionService) {}

  @GrpcMethod(GrpcModuleName.PAYMENT.TRANSACTION, 'Receiver')
  receiver(data: WebhookTransactionRequest) {
    return this.transactionService.receiver(data);
  }
}
