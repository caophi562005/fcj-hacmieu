import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import type {
  GetSellerSettlementByIdRequest,
  GetSellerSettlementSummaryRequest,
  GetSellerSettlementsRequest,
  UpdateSellerSettlementStatusRequest,
} from '@common/interfaces/models/wallet';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SellerSettlementService } from '../services/seller-settlement.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class SellerSettlementGrpcController {
  constructor(private readonly service: SellerSettlementService) {}

  @GrpcMethod(GrpcModuleName.WALLET.SETTLEMENT, 'GetSellerSettlementSummary')
  getSummary(data: GetSellerSettlementSummaryRequest) {
    return this.service.getSummary(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.SETTLEMENT, 'GetSellerSettlements')
  getMany(data: GetSellerSettlementsRequest) {
    return this.service.list(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.SETTLEMENT, 'GetSellerSettlementById')
  getById(data: GetSellerSettlementByIdRequest) {
    return this.service.getById(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.SETTLEMENT, 'UpdateSellerSettlementStatus')
  updateStatus(data: UpdateSellerSettlementStatusRequest) {
    return this.service.updateStatus(data);
  }
}
