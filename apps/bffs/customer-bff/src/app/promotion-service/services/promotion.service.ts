import {
  CheckPromotionRequest,
  GetManyPromotionsRequest,
  GetManyPromotionsResponse,
  GetPromotionRequest,
  PROMOTION_SERVICE_NAME,
  PROMOTION_SERVICE_PACKAGE_NAME,
  PromotionResponse,
  PromotionServiceClient,
} from '@common/interfaces/proto-types/promotion';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PromotionService implements OnModuleInit {
  private promotionService!: PromotionServiceClient;

  constructor(
    @Inject(PROMOTION_SERVICE_PACKAGE_NAME)
    private readonly promotionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.promotionService =
      this.promotionClient.getService<PromotionServiceClient>(
        PROMOTION_SERVICE_NAME,
      );
  }

  async getManyPromotions(
    data: GetManyPromotionsRequest,
  ): Promise<GetManyPromotionsResponse> {
    return firstValueFrom(this.promotionService.getManyPromotions(data));
  }

  async getPromotion(data: GetPromotionRequest): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.getPromotion(data));
  }

  async checkPromotion(
    data: CheckPromotionRequest,
  ): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionService.checkPromotion(data));
  }
}
