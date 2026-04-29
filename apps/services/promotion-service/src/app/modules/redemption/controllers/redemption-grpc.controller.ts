import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  ClaimPromotionRequest,
  GetMyVouchersRequest,
} from '@common/interfaces/models/promotion';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RedemptionService } from '../services/redemption.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class RedemptionGrpcController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @GrpcMethod(GrpcModuleName.PROMOTION.REDEMPTION, 'ClaimPromotion')
  claimPromotion(data: ClaimPromotionRequest) {
    return this.redemptionService.claim(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.REDEMPTION, 'GetMyVouchers')
  getMyVouchers(data: GetMyVouchersRequest) {
    return this.redemptionService.getMyVouchers(data);
  }
}
