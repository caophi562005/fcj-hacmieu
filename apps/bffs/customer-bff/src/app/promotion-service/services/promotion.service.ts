import {
  CheckPromotionRequest,
  GetManyPromotionsRequest,
  GetManyPromotionsResponse,
  GetPromotionRequest,
  PROMOTION_MODULE_SERVICE_NAME,
  PROMOTION_SERVICE_PACKAGE_NAME,
  PromotionModuleClient,
  PromotionResponse,
} from '@common/interfaces/proto-types/promotion';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PromotionService implements OnModuleInit {
  private promotionModule!: PromotionModuleClient;

  constructor(
    @Inject(PROMOTION_SERVICE_PACKAGE_NAME)
    private readonly promotionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.promotionModule =
      this.promotionClient.getService<PromotionModuleClient>(
        PROMOTION_MODULE_SERVICE_NAME,
      );
  }

  async getManyPromotions(
    data: GetManyPromotionsRequest,
  ): Promise<GetManyPromotionsResponse> {
    return firstValueFrom(this.promotionModule.getManyPromotions(data));
  }

  async getPromotion(data: GetPromotionRequest): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionModule.getPromotion(data));
  }

  async checkPromotion(
    data: CheckPromotionRequest,
  ): Promise<PromotionResponse> {
    return firstValueFrom(this.promotionModule.checkPromotion(data));
  }
}
