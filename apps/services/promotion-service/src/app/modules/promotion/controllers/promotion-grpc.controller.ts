import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CheckPromotionRequest,
  CreatePromotionRequest,
  DeletePromotionRequest,
  GetManyPromotionsRequest,
  GetPromotionRequest,
  UpdatePromotionRequest,
} from '@common/interfaces/models/promotion';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PromotionService } from '../services/promotion.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class PromotionGrpcController {
  constructor(private readonly promotionService: PromotionService) {}

  @GrpcMethod(GrpcModuleName.PROMOTION.PROMOTION, 'GetManyPromotions')
  getManyPromotions(data: GetManyPromotionsRequest) {
    return this.promotionService.list(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.PROMOTION, 'GetPromotion')
  getPromotion(data: GetPromotionRequest) {
    return this.promotionService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.PROMOTION, 'CreatePromotion')
  createPromotion(data: CreatePromotionRequest) {
    return this.promotionService.create(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.PROMOTION, 'UpdatePromotion')
  updatePromotion(data: UpdatePromotionRequest) {
    return this.promotionService.update(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.PROMOTION, 'DeletePromotion')
  deletePromotion(data: DeletePromotionRequest) {
    return this.promotionService.delete(data);
  }

  @GrpcMethod(GrpcModuleName.PROMOTION.PROMOTION, 'CheckPromotion')
  checkPromotion(data: CheckPromotionRequest) {
    return this.promotionService.check(data);
  }
}
