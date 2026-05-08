import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  AdjustShopCreditRequest,
  GetShopCreditRequest,
  GetShopCreditTransactionsRequest,
  GetShopRevenueSummaryRequest,
} from '@common/interfaces/models/wallet';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreditService } from '../services/credit.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class CreditGrpcController {
  constructor(private readonly creditService: CreditService) {}

  @GrpcMethod(GrpcModuleName.WALLET.CREDIT, 'GetShopCredit')
  getShopCredit(data: GetShopCreditRequest) {
    return this.creditService.getShopCredit(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.CREDIT, 'AdjustShopCredit')
  adjustShopCredit(data: AdjustShopCreditRequest) {
    return this.creditService.adjustShopCredit(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.CREDIT, 'GetShopCreditTransactions')
  getShopCreditTransactions(data: GetShopCreditTransactionsRequest) {
    return this.creditService.getShopCreditTransactions(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.CREDIT, 'GetShopRevenueSummary')
  getShopRevenueSummary(data: GetShopRevenueSummaryRequest) {
    return this.creditService.getShopRevenueSummary(data);
  }
}
